// HorizontalSlider.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const SLIDER_MODE = 'adapt';  // Set to 'adapt' for adaptive size, 'fixed' for fixed size

const styles = {
  container: {
    position: 'relative',
    height: SLIDER_MODE === 'fixed' ? '80px' : '100%',
    width: SLIDER_MODE === 'fixed' ? '240px' : '100%',
    border: '4px solid #262626',
    borderRadius: '8px',
    backgroundClip: 'padding-box',
    boxSizing: 'border-box',
  },
  sliderTrack: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    background: '#eee',
    borderRadius: '8px',
  },
  sliderThumb: (percentage) => ({
    position: 'absolute',
    height: '100%',
    width: '6.67%',  // Adapting the thumb for horizontal orientation
    left: `calc(${percentage}% - 10px)`,  // Changing 'top' to 'left' for horizontal orientation
    background: '#6b6a6a',
    borderRadius: '8px',
    cursor: 'pointer',
  }),
  label: {
    position: 'absolute',
    top: '50%', // Centering vertically
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centering horizontally
    fontSize: '12px',
    color: 'black',
    textAlign: 'center',
    userSelect: 'none',
    zIndex: 1 // Ensuring label is on top
  }
};

const HorizontalSlider = ({ id, value, onValueChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(value);
  const editMode = useSelector(selectEditMode);

  const sliderRef = useRef(null);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleMouseDown = useCallback((event) => {
    sliderRef.current = event.currentTarget;
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (!editMode && isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newValue = Math.min(Math.max(percentage, 0), 100) / 100;
      setSliderValue(newValue);
      onValueChange && onValueChange(newValue);
    }
  }, [editMode, isDragging, onValueChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onValueChange && onValueChange(sliderValue);
  }, [sliderValue, onValueChange]);

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
        <span style={styles.label}>{id}</span> {/* Label added here */}
        <div style={styles.sliderTrack}>
            <div style={styles.sliderThumb(sliderValue * 100)} />
        </div>
    </div>
  );
};


HorizontalSlider.defaultProps = {
  value: 0,
  onValueChange: () => {},
};

export default React.memo(HorizontalSlider);
