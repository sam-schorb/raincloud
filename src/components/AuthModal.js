

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';

const AuthModal = ({closeModal, setNotificationType}) => {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);


    const dispatch = useDispatch();

    const validatePassword = (pass) => {
        if (pass === username) return false;
        if (pass.length < 4 || pass.length > 20) return false;
        if (/[^\da-zA-Z]/.test(pass)) return false;
        if (['password', 'synnack', 'asdf'].some(word => pass.includes(word))) return false;
        return true;
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
    
            let message = '';
            
            if (response.ok) {
                const data = await response.json();
                dispatch(setUser({
                    id: data.userId,
                    username: data.username
                }));
                
                console.log("Logged in user:", { id: data.userId, username: data.username });
                message = data.message || 'Logged in successfully';
                
            } else if (response.headers.get('Content-Type').includes('application/json')) {
                const data = await response.json();
                message = data.message;
            } else {
                message = await response.text();
            }
            
            setNotificationType(message);
            
    
            // Clear the feedback message after 5 seconds
            setTimeout(() => {
                setNotificationType('');
            }, 5000);
            
        } catch (error) {
            console.error("Error:", error);
            setNotificationType('Error logging in.');
    
            // Clear the feedback message after 5 seconds
            setTimeout(() => {
                setNotificationType('');
            }, 5000);
        }
    };

    
    

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setNotificationType('Passwords do not match.');
            return;
        }
        if (!validatePassword(password)) {
            setNotificationType('Invalid password.');
            return;
        }
        if (!termsAccepted) {
            setNotificationType('Please accept terms and conditions.');
            return;
        }
    
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture); // Ensure the field name matches the server expectation.
        }
    
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData,
                // You might need to include credentials if you're handling sessions
                // credentials: 'include'
            });
    
            if (response.ok) {
                // The response is expected to be in JSON format
                const data = await response.json();
                setNotificationType(data.message); // No need for the '||' since we ensure the server sends a message
            } else {
                // Handle different cases of errors
                let message = '';
                if (response.headers.get('Content-Type').includes('application/json')) {
                    const data = await response.json();
                    message = data.type; // Use the `type` property as the message
                } else {
                    message = 'An unexpected error occurred during registration.';
                }
                setNotificationType(message);
            }
        } catch (error) {
            console.error('Error registering:', error);
            // This message will only be set if there's a network issue or if response.json() throws an error
            setNotificationType('Error registering.');
        }
    };
    

    const handleForgotUsername = async () => {
        try {
            const response = await fetch('/forgot-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
    
            let message = '';
    
            if (response.headers.get('Content-Type').includes('application/json')) {
                const data = await response.json();
                message = data.message;
            } else {
                message = await response.text();
            }
    
            setNotificationType(message);
    
        } catch (error) {
            setNotificationType('Error fetching username.');
        }
    };
    

    const handleForgotPassword = async () => {
        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
    
            let message = '';
    
            if (response.headers.get('Content-Type').includes('application/json')) {
                const data = await response.json();
                message = data.message || 'Error resetting password.';
            } else {
                message = await response.text();
            }
    
            setNotificationType(message);
    
        } catch (error) {
            setNotificationType('Error resetting password.');
        }
    };
    

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    }

    const handleActionAndClose = (action) => {
        action();
        closeModal();
    }
    
    const renderView = () => {
        switch(view) {
            case 'login':
                return (
                    <div>
                    <input className="border border-gray-400 p-2 mb-4 w-full" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br />
                    <input className="border border-gray-400 p-2 mb-4 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <br/>
                    <div>
                        <button className="bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded mb-4" onClick={() => handleActionAndClose(handleLogin)}>Login</button>
                        <button className="bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded mb-4" onClick={handleOverlayClick}>Cancel</button>
                    </div>
                </div>
                );
            case 'register':
                return (
                    <div>
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br />
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br />
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /><br />
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="file" name="imageFile" onChange={e => setProfilePicture(e.target.files[0])} /><br />
                        <input className="border border-gray-400 p-2 mb-4" type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} /> I accept the terms and conditions<br />
                        <div>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={() => handleActionAndClose(handleRegister)}>Register</button>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={handleOverlayClick}>Cancel</button>
                        </div>
                    </div>
                );
            case 'forgot-username':
                return (
                    <div>
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
                        <div>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={() => handleActionAndClose(handleForgotUsername)}>Retrieve Username</button>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={handleOverlayClick}>Cancel</button>
                        </div>
                    </div>
                );
            case 'forgot-password':
                return (
                    <div>
                        <input className="border border-gray-400 p-2 mb-4 w-full" type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
                        <div>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={() => handleActionAndClose(handleForgotPassword)}>Reset Password</button>
                        <button className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded mb-4" onClick={handleOverlayClick}>Cancel</button>
                        </div>
                    </div>
                );
            default:
                return <div>Invalid view</div>;
        }
    };

    return (
        <div className="fixed z-50 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-start pt-10" onClick={handleOverlayClick}>
            <div className="bg-gray-400 p-5 rounded-lg max-w-screen-sm w-full text-gray-900 lg:w-2/3" onClick={e => e.stopPropagation()}>
                <div className="flex flex-wrap justify-center border-b-2 pb-2 mb-4 p-0 gap-2">
                    <button className={`flex-shrink-0 bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded ${view === 'login' ? 'bg-gray-300' : ''}`} style={{minWidth: '60px'}} onClick={() => setView('login')}>Login</button>
                    <button className={`flex-shrink-0 bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded ${view === 'register' ? 'bg-gray-300' : ''}`} style={{minWidth: '80px'}} onClick={() => setView('register')}>Register</button>
                    <button className={`flex-shrink-0 bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded ${view === 'forgot-username' ? 'bg-gray-300' : ''}`} style={{minWidth: '100px'}} onClick={() => setView('forgot-username')}>Forgot Username</button>
                    <button className={`flex-shrink-0 bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded ${view === 'forgot-password' ? 'bg-gray-300' : ''}`} style={{minWidth: '100px'}} onClick={() => setView('forgot-password')}>Reset Password</button>
                    <button onClick={() => window.location.href='/help'} className={`flex-shrink-0 bg-gray-100 text-gray-900 py-2 px-2 mr-2 rounded ${view === 'help' ? 'bg-gray-300' : ''}`} style={{minWidth: '60px'}}>Help</button>
                </div>
                <div className="p-5">
                    {renderView()}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;


