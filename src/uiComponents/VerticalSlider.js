// VerticalSlider.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const SLIDER_MODE = 'adapt';  // Set to 'adapt' for adaptive size, 'fixed' for fixed size

const styles = {
  container: {
    position: 'relative',
    width: SLIDER_MODE === 'fixed' ? '80px' : '100%',
    height: SLIDER_MODE === 'fixed' ? '240px' : '100%',
    border: '4px solid #262626',
    borderRadius: '8px',
    backgroundClip: 'padding-box',
    boxSizing: 'border-box',
  },
  sliderTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: '#eee',
    borderRadius: '8px',
  },
  sliderThumb: (percentage) => ({
    position: 'absolute',
    width: '100%',
    height: '6.67%',
    top: `calc(${percentage}% - 10px)`,
    background: '#6b6a6a',
    borderRadius: '8px',
    cursor: 'pointer',
  }),
  label: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centering the label inside the container
    fontSize: '12px',
    color: 'black',
    textAlign: 'center',
    userSelect: 'none',
    zIndex: 1 // Ensuring label is on top
  }
};

const VerticalSlider = ({ id, value, onValueChange }) => {  // Add value and onValueChange props
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(value);  // Initialize sliderValue with value prop
  const editMode = useSelector(selectEditMode);

  const sliderRef = useRef(null);

  useEffect(() => {
    setSliderValue(value);  // Update the sliderValue state whenever the value prop changes
  }, [value]);

  const handleMouseDown = useCallback((event) => {
    sliderRef.current = event.currentTarget;
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (!editMode && isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const percentage = 100 - ((y / rect.height) * 100);  
      const newValue = Math.min(Math.max(percentage, 0), 100) / 100;
      setSliderValue(newValue);
      onValueChange && onValueChange(newValue);  // Send the value between 0 and 1 to parent immediately
    }
  }, [editMode, isDragging, onValueChange]);

const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onValueChange && onValueChange(sliderValue);  // Send the value between 0 and 1 to parent
}, [ sliderValue, onValueChange]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div style={styles.container} onMouseDown={handleMouseDown}>
        <span style={styles.label}>{id}</span>
        <div style={styles.sliderTrack}>
            <div style={styles.sliderThumb(100 - sliderValue * 100)} />
        </div>
    </div>
  );
};

VerticalSlider.defaultProps = {
  value: 0,
  onValueChange: () => {},
};

export default React.memo(VerticalSlider);