import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EmailVerification({ setNotificationType }) {
    const { token } = useParams();
    const navigate = useNavigate();

    // Verifying email on component mount
    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.post('/verify-email', { token });
                
                if (response.status === 200) {
                    setNotificationType('Email verified successfully!');
                    navigate('/');
                } else {
                    setNotificationType('Failed to verify email.');
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                setNotificationType('Error occurred while verifying email.');
            }
        };

        verifyEmail();
    }, [token, navigate, setNotificationType]);

    return (
        <div>
            <h2>Email Verification</h2>
            <p>Verifying your email. Please wait...</p>
        </div>
    );
}

export default EmailVerification;
