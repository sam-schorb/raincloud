import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectOutportMessages } from '../slices/outportMessagesSlice';

const NumberBox = ({ id, paramId, textSizeRatio = 0.2 }) => {
  const messages = useSelector(selectOutportMessages);
  const [displayMessage, setDisplayMessage] = useState('');
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

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
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize(Math.min(rect.width, rect.height)); // Use the smaller dimension for a square aspect ratio
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const messageContent = messages[id];
    if (messageContent !== undefined) {
      setDisplayMessage(processMessage(messageContent));
    }
  }, [messages, id, displayMessage]);

  const borderSize = Math.max(1, size * 0.05);

  const numberStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${borderSize}px solid #6b6a6a`,
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: `${size * textSizeRatio}px`, // Font size as a ratio of the component size
  };

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={numberStyle}>
        {displayMessage}
      </div>
    </div>
  );
};

export default React.memo(NumberBox);
