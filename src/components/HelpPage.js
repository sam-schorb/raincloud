import React from 'react';

function HelpPage() {
    return (
        <div className="w-2/3 mx-auto p-8 bg-transparent rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
            <p className="mb-6">If you have any questions, concerns, or technical issues, please refer to our FAQ section below. If you can't find the answer you're looking for, please feel free to contact our support team.</p>
            
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <ul className="list-disc pl-6">
                <li className="mb-4">
                    <strong>Q: How do I upload patches?</strong>
                    <p>A: Click on the "Upload" button on the top navigation bar and follow the on-screen instructions.</p>
                </li>
                <li className="mb-4">
                    <strong>Q: How do I manage my account settings?</strong>
                    <p>A: After logging in, click on your user icon to access account settings and other user-specific features.</p>
                </li>
                <li className="mb-4">
                    <strong>Q: How can I reset my password?</strong>
                    <p>A: Navigate to the login section and select the "Forgot Password" option. You will be guided through the process of resetting your password.</p>
                </li>
                <li className="mb-4">
                    <strong>Q: What should I do if I encounter an error with a patch?</strong>
                    <p>A: Try to disconnect your device and reset the context. If the issue persists, reach out to our support team with detailed information about the error.</p>
                </li>
            </ul>
        </div>
    );
}

export default HelpPage;
