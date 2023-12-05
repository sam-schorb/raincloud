import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const Button = ({ id, paramId, handleButtonClick, textSizeRatio = 0.2 }) => {
  const [isClicked, setIsClicked] = useState(false);
  const editMode = useSelector(selectEditMode);

  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize(Math.min(rect.width, rect.height)); // Maintain square aspect ratio
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

  const handleClick = useCallback(() => {
    if (!editMode) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 100);
      handleButtonClick && handleButtonClick(paramId);
    }
  }, [editMode, paramId, handleButtonClick]);

  const borderSize = Math.max(1, size * 0.05);

  const buttonStyle = {
    width: `${size - 2 * borderSize}px`,
    height: `${size - 2 * borderSize}px`,
    border: `${borderSize}px solid #6b6a6a`,
    boxShadow: `0 0 0 ${borderSize}px #262626`,
    borderRadius: '50%',
    backgroundColor: isClicked ? '#6b6a6a' : 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundClip: 'padding-box',
    boxSizing: 'border-box',
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
    <div ref={containerRef} style={containerStyle} onClick={handleClick}>
      <div style={buttonStyle}>
        <span style={labelStyle}>{id}</span>
      </div>
    </div>
  );
};

export default React.memo(Button);
