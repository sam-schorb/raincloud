import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const Switch = ({ id, paramId, handleSwitchClick, textSizeRatio = 0.2 }) => { 
  const [isOn, setIsOn] = useState(false);
  const editMode = useSelector(selectEditMode);
  const containerRef = useRef(null);
  const [size, setSize] = useState(0); // This will be the size of the component

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

  const handleClick = useCallback(() => {
    if (!editMode) {
      setIsOn(prevState => !prevState); // Toggle the state
      handleSwitchClick && handleSwitchClick(paramId);
    }
  }, [editMode, paramId, handleSwitchClick]);

  const borderSize = Math.max(1, size * 0.05); // Calculate border size as 5% of the component size with a minimum of 1px

  const switchStyle = {
    width: `${size - 2 * borderSize}px`, // Adjust width for border
    height: `${size - 2 * borderSize}px`, // Adjust height for border
    border: `${borderSize}px solid #6b6a6a`,
    boxShadow: `0 0 0 ${borderSize}px #262626`, // Outer black border
    borderRadius: '50%',
    backgroundColor: isOn ? '#6b6a6a' : 'white',
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
      <div style={switchStyle}>
        <span style={labelStyle}>{id}</span>
      </div>
    </div>
  );
};

export default React.memo(Switch);
