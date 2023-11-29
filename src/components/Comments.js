import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
import { useSelector } from 'react-redux';           // Import useSelector
import { selectUser } from '../slices/userSlice';    // Adjust the path accordingly


const Comments = ({ patchId }) => {
    const [comments, setComments] = useState([]); // To store fetched comments
    
    const user = useSelector(selectUser);            // Extract user info from Redux store
    const isLoggedIn = user !== null;                // Determine if the user is logged in
    const loggedInUsername = user?.name || '';       // Extract the logged-in username

    const [comment, setComment] = useState('');


    const handleSubmitComment = async () => {
        try {
            const response = await axios.post('/postComment', {
                patchId: patchId,
                comment: comment,
            });
    
            if (response.status === 200) {
                setComment('');  // Clear the comment input
                fetchComments(); // Fetch the updated comments to reflect the new comment immediately
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

        
        const fetchComments = async () => {
            try {
                const response = await axios.get(`/getComments?patchId=${patchId}`);
                if (response.status === 200) {
                    setComments(response.data);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
    
        // Fetch comments when the component mounts
        useEffect(() => {
            fetchComments();
        }, []);


    return (
        <div>
            {/* Comments Header */}
            <div className="text-xl mb-2 text-center p-4">Comments</div>

            {/* Comments Table */}
            <table className="border-2 border-true-gray justify-left my-4" style={{ width: '100%', boxSizing: 'border-box' }}>
                <tbody>
                    {comments.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'bg-light-gray' : '#9e9e9e' }}>
                            <td className="border-2 border-true-gray p-3">
                                {item.comment}
                                <div style={{ fontSize: 'smaller', textAlign: 'right' }}>
                                    Posted on {item.date} by {item.username}
                                    <a href="mailto:mail.iimaginary.com" style={{ marginLeft: '5px' }}>[report]</a>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Comment Form */}
            {isLoggedIn ? (
                <div>
                    <div className="text-lg mb-2">Leave a comment</div>
                    <div className="text-md mb-2">Post as: {loggedInUsername}</div>
                    <textarea 
                        className="bg-light-gray border-2 border-medium-gray"
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        rows={4} 
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                <button 
                    style={{ marginTop: '10px' }}   
                    className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-white rounded"
                    onClick={handleSubmitComment}>
                    Submit
                </button>
                </div>
            ) : (
                <div style={{ fontSize: 'smaller' }}>Please sign in to comment.</div>
            )}
        </div>
    );
};

export default Comments;
