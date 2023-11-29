import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectOutportMessages } from '../slices/outportMessagesSlice';

const NumberBox = ({ id, paramId }) => {
  const messages = useSelector(selectOutportMessages);
  const [displayMessage, setDisplayMessage] = useState('');
  const numberRef = useRef(null);


  const processMessage = (message) => {
    let processedMessage = message;
    if (typeof message === 'number') {
      // Truncate to two decimal places for floating points
      processedMessage = parseFloat(message.toFixed(2));

      // Truncate with ellipsis for numbers greater than 1000
      if (message > 1000) {
        processedMessage = `${Math.round(message / 1000)}k+`;
      }
    }
    return processedMessage;
  };

  useEffect(() => {
    const messageContent = messages[id];
    if (messageContent !== undefined) {
      setDisplayMessage(processMessage(messageContent));
    }
  }, [messages, id, displayMessage]);
  
  // Inline styles for the number box container and the number display
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    },
    number: {
      width: '100%', // Reduce width to account for padding
      height: '100%', // Reduce height to account for padding
      border: '4px solid #6b6a6a',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      overflow: 'hidden', // Hide overflow
      textOverflow: 'ellipsis', // Show ellipsis for overflowed text
      whiteSpace: 'nowrap', // No wrapping to the next line
      fontSize: '12px', // Set font size to 12px here
    }
  };

  return (
    <div style={styles.container} ref={numberRef}>
      <div style={styles.number}>
        {displayMessage}
      </div>
    </div>
  );
};



export default React.memo(NumberBox);
