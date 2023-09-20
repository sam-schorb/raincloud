import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPasswordForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        token: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tokenFromURL = query.get('token');
        if (tokenFromURL) {
            setFormData(prevState => ({ ...prevState, token: tokenFromURL }));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setErrorMessage('Invalid password. Password should be at least 6 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const { username, password, token } = formData;
            const response = await axios.post('/reset-password', { username, password, token });

            if (response.status === 200) {
                navigate('/'); // redirect to homepage
            } else {
                setErrorMessage(response.data.message || 'Error changing password.');
            }
        } catch (error) {
            setErrorMessage('Error changing password.');
            console.error('Error resetting password:', error);
        }
    };

    const validatePassword = (pass) => {
        const { username } = formData; // Extracting the username from formData here
    
        if (pass === username) return false;
        if (pass.length < 4 || pass.length > 20) return false;
        if (/[^\da-zA-Z]/.test(pass)) return false;
        if (['password', 'synnack', 'asdf'].some(word => pass.includes(word))) return false;
        return true;
    };

    return (
        <div className="reset-password-form mx-auto mt-10 p-6 w-full max-w-md rounded">
            <h2 className="text-2xl mb-6 font-semibold">Reset Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2" htmlFor="username">Username:</label>
                    <input className="w-full p-2 border rounded text-black" type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2" htmlFor="password">New Password:</label>
                    <input className="w-full p-2 border rounded text-black" type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2" htmlFor="confirmPassword">Confirm Password:</label>
                    <input className="w-full p-2 border rounded text-black" type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2" htmlFor="token">Token:</label>
                    <input className="w-full p-2 border rounded text-black" type="text" id="token" name="token" value={formData.token} onChange={handleChange} required readOnly />
                </div>
                <div>
                    <button className="w-full p-2 mt-4 bg-vdark-gray text-white rounded hover:bg-dark-gray" type="submit">Reset Password</button>
                </div>
                {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
            </form>
        </div>
    );
}

export default ResetPasswordForm;
