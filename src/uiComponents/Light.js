// Light.jsx

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectOutportMessages } from '../slices/outportMessagesSlice';

const getBackgroundColor = (message) => {
  if (message === null || message === undefined) return 'white';
  if (message === 1) return 'yellow';
  if (message >= 2) return 'blue';
  return 'white';  // default
};

const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    },
    light: (message) => ({
      width: '100%',
      height: '100%',
      border: '4px solid #6b6a6a',
      borderRadius: '50%',
      backgroundColor: getBackgroundColor(message),
    }),
    label: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '12px', // Smaller font size to fit the button
      color: 'black', // Color of the label text
      textAlign: 'center',
      userSelect: 'none', // Prevents text selection
    }
  };

const Light = ({ id, paramId }) => {
  const messages = useSelector(selectOutportMessages);
  const [displayMessage, setDisplayMessage] = useState(null);

  useEffect(() => {
    const messageContent = messages[id];
    if (messageContent !== undefined) {
      setDisplayMessage(messageContent);
    }
  }, [messages, id, displayMessage]);

  return (
    <div style={styles.container}>
      <div style={styles.light(displayMessage)} />
      <span style={styles.label}>{id}</span>
    </div>
  );
};


export default React.memo(Light);