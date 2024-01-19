import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/userSlice';

const Comments = ({ patchId }) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const user = useSelector(selectUser);
  const isLoggedIn = user !== null;
  const loggedInUsername = user?.name || '';

  // Function to handle submission of a new comment
  const handleSubmitComment = async () => {
    try {
      const response = await axios.post('/postComment', { patchId, comment });
      if (response.status === 200) {
        setComment('');
        fetchComments(); // Refresh comments after submission
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Function to fetch comments from the server
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

  // Effect to fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [patchId]);

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

      {/* Comment Form for Logged-in Users */}
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
            onClick={handleSubmitComment}
          >
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