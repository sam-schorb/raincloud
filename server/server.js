// **Modules**
const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const Mailjet = require('node-mailjet');

dotenv.config();

// **Initialization**
const app = express();
const PORT = process.env.PORT || 3001; // Use default port if not on Heroku


// **Middlewares**
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = ['https://localhost:3000', 'https://www.iimaginary.com','https://droplets-bc07b656285d.herokuapp.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));


// Initialize Mailjet
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);

const mongoURL = process.env.MONGO_URL;
const client = new MongoClient(mongoURL, {
    useUnifiedTopology: true
});

// Database collections
let patchesCollection, usersCollection, likesCollection, refreshTokensCollection;

const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to the database");
        const db = client.db('RNBO1-basicUpload');
        patchesCollection = db.collection('patches');
        usersCollection = db.collection('users');
        likesCollection = db.collection('likes');
        refreshTokensCollection = db.collection('refreshTokens');
    } catch (err) {
        console.error('Failed to connect to the database', err);
        setTimeout(connectDB, 5000);  
    }
};
connectDB();

const setTokensAsCookies = (res, authToken, refreshToken) => {
    res.cookie('authToken', authToken, { httpOnly: true, maxAge: 3600 * 1000 });  
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
};

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
        if (file.fieldname === 'patchFile' && file.mimetype === 'application/json') {
            cb(null, true);
        } else if ((file.fieldname === 'imageFile' || file.fieldname === 'profilePicture') && file.mimetype.startsWith('image/')) {
            if (file.size > 500 * 1024) {  
                return cb(new Error('Image file too large'), false);
            }
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});


const authenticateJWT = (req, res, next) => {
    const token = req.cookies.authToken;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ isAuthenticated: false });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(200).json({ isAuthenticated: false });  // Note this change
    }
};


// Handle graceful shutdowns
const exitHandler = async (exitCode) => {
    if (client && client.isConnected()) {
        await client.close();
        console.log('Database connection closed.');
    }
    process.exit(exitCode);
};

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('SIGTERM', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));


// Adjusted validatePassword
const validatePassword = (pass, usernameCheck) => {
    if (pass === usernameCheck) return false;
    if (pass.length < 4 || pass.length > 20) return false;
    if (/[^\da-zA-Z]/.test(pass)) return false; // Checking for special characters

    return true;
};

const generateAuthToken = (user) => {  // NEW: Function to generate auth token
    const tokenPayload = { 
        id: user._id, 
        username: user.username 
    };
    return jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {  // NEW: Function to generate refresh token
    const tokenPayload = { 
        id: user._id, 
        username: user.username 
    };
    return jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Input validation function
const validateInput = (input, type) => {
    switch (type) {
        case 'email':
            return validator.isEmail(input);
        case 'username':
            return validator.isAlphanumeric(input) && validator.isLength(input, { min: 4, max: 30 });
        case 'password':
            return validatePassword(input, type); // Assuming validatePassword is defined elsewhere in your code
        case 'patchId':
            return ObjectId.isValid(input);
        default:
            return true;
    }
};


const isValidPatchContent = (content) => {
    // Top-level structure checks
    if (!content.desc || !content.presets || !content.src) return false;
    if (!Array.isArray(content.presets) || !Array.isArray(content.src)) return false;

    const desc = content.desc;

    // Checking numeric properties, but only if they exist
    const numericProperties = ['numParameters', 'numSignalInParameters', 'numSignalOutParameters', 'numInputChannels', 'numOutputChannels', 'numMidiInputPorts', 'numMidiOutputPorts', 'patcherSerial'];
    for (const prop of numericProperties) {
        if (desc.hasOwnProperty(prop) && (typeof desc[prop] !== 'number' || desc[prop] < 0)) return false;
    }

    // Check array properties and their inner structures but only if they exist
    ['inports', 'inlets', 'outlets'].forEach(arrayName => {
        if (desc.hasOwnProperty(arrayName) && !Array.isArray(desc[arrayName])) return false;
    });

    if (desc.inports) {
        for (const port of desc.inports) {
            if (port && (!port.tag || typeof port.tag !== 'string')) return false;
        }
    }

    if (desc.inlets) {
        for (const inlet of desc.inlets) {
            if (inlet && (!['event', 'signal'].includes(inlet.type) || typeof inlet.index !== 'number' || !inlet.tag || typeof inlet.tag !== 'string')) return false;
        }
    }

    if (desc.outlets) {
        for (const outlet of desc.outlets) {
            if (outlet && (!['event', 'signal'].includes(outlet.type) || typeof outlet.index !== 'number' || !outlet.tag || typeof outlet.tag !== 'string')) return false;
        }
    }

    // Check meta but only if it exists
    if (desc.meta) {
        if (typeof desc.meta !== 'object') return false;

        const stringProps = ['architecture', 'filename', 'maxversion', 'rnboversion'];
        for (const prop of stringProps) {
            if (desc.meta.hasOwnProperty(prop) && typeof desc.meta[prop] !== 'string') return false;
        }
    }

    return true;
};



app.post('/uploadPatch', authenticateJWT, upload.fields([{ name: 'patchFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), async (req, res) => {
    console.log(req.user);  // Debug log
    try {
        // Validate name
        if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.length > 200) {
            return res.status(400).send('Invalid patch name');
        }

        // Validate description
        if (!req.body.description || typeof req.body.description !== 'string' || req.body.description.length > 320) {
            return res.status(400).send('Invalid patch description');
        }

        // Validate patch file content structure
        const fileContent = JSON.parse(req.files.patchFile[0].buffer.toString('utf-8')); // Convert file buffer to object
        if (!isValidPatchContent(fileContent)) {
            return res.status(400).send('Invalid patch file structure');
        }

        const currentDateTime = new Date(); // Get the current date and time

        // Extract userId and username from authenticated user data
        const userId = req.user.id;  // Assuming authenticateJWT middleware sets user info in req.user
        const username = req.user.username;

        const patchData = {
            name: req.body.name,
            tags: req.body.tags,
            description: req.body.description,
            fileContent: req.files.patchFile[0].buffer.toString('utf-8'), // Convert file buffer to string
            image: req.files.imageFile ? req.files.imageFile[0].buffer : null, // Save the image file as binary data if it exists
            userId: userId,
            username: username,
            uploadDate: currentDateTime
        };

        await patchesCollection.insertOne(patchData);
        res.status(200).send('Patch uploaded successfully');
        
    } catch (error) {
        console.error('Error uploading patch:', error);
        res.status(500).send('Internal Server Error');
    }
});


// DELETE patch route
app.delete('/deletePatch/:patchId', authenticateJWT, async (req, res) => {
    const patchId = req.params.patchId;
    try {
        // Use MongoDB's ObjectID when querying by _id
        const result = await patchesCollection.deleteOne({ _id: new ObjectId(patchId) });

        if (result.deletedCount === 1) {
            res.status(200).send('Patch deleted successfully');
        } else {
            res.status(404).send('Patch not found');
        }
    } catch (error) {
        console.error('Error deleting patch:', error);
        res.status(500).send('Internal Server Error');
    }
});

// UPDATE patch route
app.put('/updatePatch/:patchId', authenticateJWT, upload.fields([{ name: 'patchFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), async (req, res) => {
    const patchId = req.params.patchId;
    
    try {
        // Validate name
        if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.length > 200) {
            return res.status(400).send('Invalid patch name');
        }

        // Validate description
        if (!req.body.description || typeof req.body.description !== 'string' || req.body.description.length > 320) {
            return res.status(400).send('Invalid patch description');
        }

        // Prepare data to be updated
        const updateData = {
            name: req.body.name,
            tags: req.body.tags,
            description: req.body.description,
        };

        // If there's an image, update it. Else, leave as-is
        if (req.files.imageFile) {
            updateData.image = req.files.imageFile[0].buffer;
        }

        // Use MongoDB's ObjectID when querying by _id
        const result = await patchesCollection.updateOne({ _id: new ObjectId(patchId) }, { $set: updateData });

        if (result.modifiedCount === 1) {
            res.status(200).send('Patch updated successfully');
        } else {
            res.status(404).send('Patch not found');
        }
    } catch (error) {
        console.error('Error updating patch:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.use((req, res, next) => {
    res.header(
        "Content-Security-Policy",
        `
            default-src 'self' 'unsafe-inline' 'unsafe-eval';
            img-src 'self' data:;
            font-src 'self' data: https://fonts.gstatic.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://c74-public.nyc3.digitaloceanspaces.com;
        `
    );
    next();
});


app.get('/getPatch/:patchId', async (req, res) => {
    try {
        console.log("Fetching patch for ID:", req.params.patchId); // Log the patchId being requested

        const patchId = req.params.patchId;
        const patch = await patchesCollection.findOne({ _id: new ObjectId(patchId) });

        console.log("Fetched patch:", patch.name);  // Log the fetched patch

        if (patch) {
            res.status(200).json(JSON.parse(patch.fileContent));
        } else {
            res.status(404).send('Patch not found');
        }
    } catch (error) {
        console.error('Error fetching specific patch:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getPatches', async (req, res) => {
    try {
        const patches = await patchesCollection.find({}).toArray();
        res.status(200).json(patches);
    } catch (error) {
        console.error('Error fetching patches:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getPatchInfo', async (req, res) => {
    try {
        let query = {};

        // Check if an ID was provided and adjust the query accordingly
        if (req.query.id) {
            query._id = new ObjectId(req.query.id);
        }

        const patchesInfo = await patchesCollection.find(
            query,
            {
                projection: { _id: 1, name: 1, username: 1, uploadDate: 1, image: 1 }
            }
        )
        .sort({ uploadDate: -1 })  // Sorting by uploadDate in descending order
        .toArray();

        res.status(200).json(patchesInfo);
    } catch (error) {
        console.error('Error fetching patch summaries:', error);
        res.status(500).send('Internal Server Error');
    }
});


// In your backend/server code, add this route
app.get('/getFullPatchInfo/:patchId', authenticateJWT, async (req, res) => {
    const patchId = new ObjectId(req.params.patchId);
    try {
        const patch = await patchesCollection.findOne({ _id: patchId });
        if (!patch) {
            return res.status(404).send('Patch not found');
        }
        res.send(patch);
    } catch (error) {
        console.error('Error fetching patch:', error);
        res.status(500).send('Server error');
    }
});



// Route to get patches uploaded by a specific user
app.get('/getUserPatchInfo/:userId', async (req, res) => {

    const userId = req.params.userId;


    // Error handling for missing user ID
    if (!userId) {
        console.error('[ERROR] Missing user ID in request');
        return res.status(400).send('Missing user ID');
    }

    try {

        const userPatches = await patchesCollection.find(
            { userId: userId },  // Using userId as string directly
            {
                projection: { _id: 1, name: 1, username: 1, uploadDate: 1, image: 1 }
            }
        )
        .sort({ uploadDate: -1 })  // Sorting by uploadDate in descending order
        .toArray();

        if (userPatches && userPatches.length > 0) {
            console.log(`[INFO] Successfully fetched ${userPatches.length} patches for user with ID: ${userId}`);
        } else {
            console.log(`[INFO] No patches found for user with ID: ${userId}`);
        }

        // Respond with the patches uploaded by the user
        res.status(200).json(userPatches);
    } catch (error) {
        console.error('[ERROR] Exception caught when fetching patches:', error);
        res.status(500).send('Internal Server Error');
    }
});





app.get('/getRecentlyPlayed/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch the recently played list for the logged-in user
        // Assume you have a usersCollection that contains the recently played patches for each user
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const recentlyPlayedIds = user.recentlyPlayed;  // Assume the user object has a 'recentlyPlayed' field which is an array of patchIds

        // Fetch the necessary information for each ID in the recently played list
        const recentPatchesData = await Promise.all(recentlyPlayedIds.map(async patchId => {
            const patch = await patchesCollection.findOne({ _id: new ObjectId(patchId) });
            if (patch) {
                return {
                    id: patch._id,
                    username: patch.username,
                    name: patch.name,
                    picture: patch.image,
                };
            }
        }));

        res.status(200).json(recentPatchesData.filter(patch => patch));
    } catch (error) {
        console.error('Error fetching recently played patches:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/updateRecentlyPlayed', async (req, res) => {
    const { userId, patchId } = req.body;

    if (!userId || !patchId) {
        return res.status(400).send('Missing parameters');
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const existingRecentlyPlayed = user.recentlyPlayed.map(id => id.toString());
    const updatedRecentlyPlayed = existingRecentlyPlayed.includes(patchId) ? existingRecentlyPlayed : [patchId, ...existingRecentlyPlayed].slice(0, 8);

    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { recentlyPlayed: updatedRecentlyPlayed } }
    );

    res.status(200).send('Successfully updated recently played patches');
});


app.post('/login', async (req, res) => {
        try {
        const { username, password } = req.body;

        const user = await usersCollection.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Username or password is incorrect');
        }

        if (!user.isVerified) {
            return res.status(401).send('Please verify your email before logging in');
        }

        const authToken = generateAuthToken(user);  // Generate auth token
        const refreshToken = generateRefreshToken(user);  // Generate refresh token
        // Store this refresh token in a separate database table or some other mechanism

        await refreshTokensCollection.insertOne({
            token: refreshToken,
            userId: user._id,
            username: user.username,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)  // 7 days from now
        });

        setTokensAsCookies(res, authToken, refreshToken);  // Set tokens in HttpOnly cookies
        
        // Login successful
        res.status(200).json({ 
            message: 'Login successful',
            authToken,
            refreshToken,
            username: user.username,
            userId: user._id  // Assuming MongoDB or similar where _id is the user ID
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/logout', authenticateJWT, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        await refreshTokensCollection.deleteOne({ token: refreshToken });
        res.clearCookie('authToken');
        res.clearCookie('refreshToken');
        res.status(200).json('Logged out successfully');
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.post('/token', async (req, res) => {  // NEW: Refresh token endpoint
    
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).send('Refresh token not provided');
    }

    const tokenEntry = await refreshTokensCollection.findOne({ token: refreshToken });
    if (!tokenEntry) {
        return res.status(401).send('Invalid refresh token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });

        if (!user) {
            return res.status(401).send('Invalid refresh token');
        }

        // Generate a new authentication token
        const authToken = generateAuthToken(user);
        
        // Generate a new refresh token
        const newRefreshToken = generateRefreshToken(user);  // Assuming you have a similar function for this

        // Delete the old refresh token from the database
        await refreshTokensCollection.deleteOne({ token: refreshToken });
        
        // Insert the new refresh token into the database
        await refreshTokensCollection.insertOne({
            token: newRefreshToken,
            userId: user._id,
            username: user.username,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)  // 7 days from now, adjust as per your requirement
        });

        // Send back the new authentication token and the new refresh token
        res.status(200).json({ authToken, refreshToken: newRefreshToken });

    } catch (err) {
        console.error('Error in token endpoint:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/validateToken', authenticateJWT, async (req, res) => {
    try {
        // At this point, the token is already valid because of the authenticateJWT middleware
        // Therefore, we just need to fetch the user's details and return them
        const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
        if (!user) {
            return res.status(401).send('User not found');
        }
        // Return necessary user data. Adjust fields as needed.
        res.json({ isAuthenticated: true, user: { username: user.username, id: user._id } });
    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).send('Internal Server Error');
    }
});







app.post('/reset-password', async (req, res) => {
    try {
        const { username, password, token } = req.body;

        // Validate inputs
        if (!username || !password || !token) {
            return res.status(400).send('Missing required fields');
        }

        if (!validateInput(username, 'username')) {
            return res.status(400).send('Invalid username format');
        }

        if (!validatePassword(password, username) || !validateInput(password, 'password')) {
            return res.status(400).send('Invalid password');
        }

        // Find the user with the given token and within the expiry time
        const user = await usersCollection.findOne({
            username,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).send('Invalid token or username');

        // Hash the new password and save it
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        await usersCollection.updateOne({ username }, {
            $set: { password: hashedPassword },
            $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
        });

        res.status(200).send('Password has been reset');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Internal Server Error');
    }
});





app.post('/forgot-username', async (req, res) => {
    try {
        const { email } = req.body;
        if (!validateInput(email, 'email')) {
            return res.status(400).send('Invalid email format');
        }

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).send('User with that email not found');

        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[{
                    "From": {
                        "Email": process.env.EMAIL_USER,
                        "Name": "Droplets"
                    },
                    "To": [{
                        "Email": email
                    }],
                    "Subject": "Your Username",
                    "TextPart": `Hello, your username is: ${user.username}`
                }]
            });

        await request;

        res.status(200).send('Username has been sent to the email');
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!validateInput(email, 'email')) {
            return res.status(400).send('Invalid email format');
        }

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).send('User with that email not found');

        const resetToken = crypto.randomBytes(20).toString('hex');
        const expireTime = Date.now() + 24*3600*1000;

        await usersCollection.updateOne({ email }, {
            $set: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: expireTime
            }
        });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[{
                    "From": {
                        "Email": process.env.EMAIL_USER,
                        "Name": "Droplets"
                    },
                    "To": [{
                        "Email": email
                    }],
                    "Subject": "Reset Password",
                    "TextPart": `Here is your reset link: ${resetURL}. This link is valid for 24 hours.`
                }]
            });

        await request;

        res.status(200).send('Reset token has been sent to the email');
    } catch (error) {
        console.error('Error generating reset token:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/register', upload.single('profilePicture'), async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const profilePicture = req.file ? req.file.buffer : null;

        if (!validateInput(email, 'email')) {
            return res.status(400).send('Invalid email');
        }

        if (!validateInput(username, 'username')) {
            return res.status(400).send('Invalid username');
        }

        if (!validatePassword(password, username) || !validateInput(password, 'password')) {
            return res.status(400).send('Invalid password');
        }

        const userExists = await usersCollection.findOne({ $or: [{email}, {username}] });
        if (userExists) {
            return res.status(409).send('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const newUser = {
            email,
            username,
            password: hashedPassword,
            verificationToken,
            isVerified: false,
            recentlyPlayed: [],
            profilePicture
        };

        await usersCollection.insertOne(newUser);

        const verificationURL = `${process.env.FRONTEND_URL}/reset-password?token=${verificationToken}`;

        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[{
                    "From": {
                        "Email": process.env.EMAIL_USER,
                        "Name": "Droplets"
                    },
                    "To": [{
                        "Email": email
                    }],
                    "Subject": "Verify Your Account",
                    "HTMLPart": `<p>Please <a href="${verificationURL}">click here</a> to verify your account.</p>`
                }]
            });

        await request;

        res.status(201).send('Verification email sent. Please check your email.');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        // Find the user with the provided token
        const user = await usersCollection.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid or expired verification token.');
        }

        // Update the user's isVerified status
        await usersCollection.updateOne({ _id: user._id }, { $set: { isVerified: true } });

        res.status(200).send('Email verified successfully.');
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).send('Internal Server Error');
    }
});






// Add a like
app.post('/likePatch', async (req, res) => {
    const userId = req.body.userId; 
    const patchId = req.body.patchId;

    if (!userId || !patchId) {
        return res.status(400).send('Missing user or patch ID');
    }

    try {
        // Check if like already exists
        const existingLike = await likesCollection.findOne({ userId: new ObjectId(userId), patchId: new ObjectId(patchId) });
        if (existingLike) {
            return res.status(400).send('Like already exists');
        }

        // Insert the new like into the collection
        await likesCollection.insertOne({ userId: new ObjectId(userId), patchId: new ObjectId(patchId) });

        const updatedLikeCount = await likesCollection.countDocuments({ patchId: new ObjectId(patchId) });
        
        res.status(200).json({ message: 'Liked successfully', updatedLikeCount });
    } catch (error) {
        console.error('Error liking patch:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove a like
app.delete('/unlikePatch', async (req, res) => {
    const userId = req.body.userId; 
    const patchId = req.body.patchId;

    if (!userId || !patchId) {
        return res.status(400).send('Missing user or patch ID');
    }

    try {
        // Delete the like from the collection
        await likesCollection.deleteOne({ userId: new ObjectId(userId), patchId: new ObjectId(patchId) });

        const updatedLikeCount = await likesCollection.countDocuments({ patchId: new ObjectId(patchId) });
        
        res.status(200).json({ message: 'Unliked successfully', updatedLikeCount });
    } catch (error) {
        console.error('Error unliking patch:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/likedPatchesInfo/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).send('Missing user ID');
    }

    try {
        // 1. Fetch the patches that user likes
        const userLikes = await likesCollection.find({ userId: new ObjectId(userId) }).toArray();
        const likedPatchIds = userLikes.map(like => new ObjectId(like.patchId)); // Convert to ObjectId for MongoDB query

        // 2. Fetch detailed information for each liked patch
        const likedPatchesInfo = await patchesCollection.find(
            { _id: { $in: likedPatchIds } },  // Use $in operator to fetch multiple patches based on IDs
            {
                projection: { _id: 1, name: 1, username: 1, uploadDate: 1, image: 1 }
            }
        )
        .sort({ uploadDate: -1 })  // Sorting by uploadDate in descending order
        .toArray();

        // 3. Respond with the detailed information
        res.status(200).json(likedPatchesInfo);
    } catch (error) {
        console.error('Error fetching liked patches for user:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Get like count for a patch
app.get('/likeCount/:patchId', async (req, res) => {
    const patchId = req.params.patchId;

    if (!patchId) {
        return res.status(400).send('Missing patch ID');
    }

    try {
        // Count the number of likes for the patch
        const likeCount = await likesCollection.countDocuments({ patchId: new ObjectId(patchId) });

        res.status(200).json({ likeCount });
    } catch (error) {
        console.error('Error fetching like count:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/likeCounts', async (req, res) => {
    try {
        const aggregatedLikes = await likesCollection.aggregate([
            { $group: { _id: "$patchId", likeCount: { $sum: 1 } } }
        ]).toArray();

        const formattedResult = aggregatedLikes.map(item => ({
            patchId: item._id.toString(), // convert ObjectId to string
            likeCount: item.likeCount
        }));

        res.status(200).json(formattedResult);

    } catch (error) {
        console.error('Error fetching all like counts:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/hasLiked/:patchId', async (req, res) => {
    const userId = req.query.userId || req.userId;  // Fallback to JWT validation once implemented
    const patchId = req.params.patchId;

    if (!userId || !patchId) {
        return res.status(400).send('Missing user or patch ID');
    }

    try {
        // Check if like exists for the user and patch
        const existingLike = await likesCollection.findOne({ userId: new ObjectId(userId), patchId: new ObjectId(patchId) });

        res.status(200).json({ hasLiked: !!existingLike });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/userLikes/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).send('Missing user ID');
    }

    try {
        const userLikes = await likesCollection.find({ userId: new ObjectId(userId) }).toArray();
        const likedPatchIds = userLikes.map(like => like.patchId.toString());

        res.status(200).json({ likes: likedPatchIds });
    } catch (error) {
        console.error('Error fetching likes for user:', error);
        res.status(500).send('Internal Server Error');
    }
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build'));

    // This is your fallback route for production. It should come AFTER your API routes.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
} else {
    // For non-production environments, serve your development index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
