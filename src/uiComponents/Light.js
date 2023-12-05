import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectOutportMessages } from '../slices/outportMessagesSlice';

const getBackgroundColor = (message) => {
  if (message === null || message === undefined) return 'white';
  if (message === 1) return 'yellow';
  if (message >= 2) return 'blue';
  return 'white';
};

const Light = ({ id, paramId, textSizeRatio = 0.2 }) => {
  const messages = useSelector(selectOutportMessages);
  const [displayMessage, setDisplayMessage] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize(Math.min(rect.width, rect.height));
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
      setDisplayMessage(messageContent);
    }
  }, [messages, id, displayMessage]);

  const borderSize = Math.max(1, size * 0.05);

  const lightStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${borderSize}px solid #6b6a6a`,
    borderRadius: '50%',
    backgroundColor: getBackgroundColor(displayMessage),
    boxSizing: 'border-box',
    position: 'relative',
  };

  const labelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: `${size * textSizeRatio}px`, // Font size as a ratio of the component size
    color: 'black',
    textAlign: 'center',
    userSelect: 'none',
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
      <div style={lightStyle} />
      <span style={labelStyle}>{id}</span>
    </div>
  );
};

export default React.memo(Light);
