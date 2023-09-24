import React, { useState, useEffect, useRef } from 'react';

const Notification = ({ message, setType }) => {
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef(message);  // Store the current message in a ref

  useEffect(() => {
    // Check if the message has changed since the last render
    if (messageRef.current !== message) {
      // Clear any existing timeouts to hide or remove the notification
      setIsVisible(true);  // Immediately show the new notification
    }

    messageRef.current = message;  // Update the ref to the current message

    const fadeOutTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Cleanup function
    return () => {
      clearTimeout(fadeOutTimeout);
    };
  }, [message]);

  useEffect(() => {
    if (!isVisible) {
      const removeTypeTimeout = setTimeout(() => {
        setType(null);
      }, 500);  // Allow 500ms for the fade-out transition to complete.

      // Cleanup function
      return () => {
        clearTimeout(removeTypeTimeout);
      };
    }
  }, [isVisible, setType]);

  // Use inline styles for absolute positioning to ensure consistency.
  const notificationStyle = {
    position: 'fixed',
    bottom: '12.5%', // Position the notification 1/8 from the bottom
    left: '50%', // Center the notification horizontally
    transform: 'translateX(-50%)',
    padding: '1rem',
    backgroundColor: '#4d5169', // Tailwind's bg-blue-500
    color: 'white',
    borderRadius: '0.25rem', // Tailwind's rounded-md
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Tailwind's shadow-lg
    opacity: isVisible ? 1 : 0, // Handle fade-in/fade-out
    transition: 'opacity 500ms',
    zIndex: 1000
  };

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  );
};

export default Notification;
