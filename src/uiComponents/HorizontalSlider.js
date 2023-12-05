import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const HorizontalSlider = ({ id, value, onValueChange, textSizeRatio = 0.2 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(value);
  const editMode = useSelector(selectEditMode);

  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleMouseDown = useCallback((event) => {
    sliderRef.current = event.currentTarget;
    setIsDragging(true);
    event.preventDefault();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize(rect.width); // For horizontal slider, we are concerned with width
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

  const fontSize = size * textSizeRatio * 0.35; // Dynamic font size
  const borderSize = Math.max(1, size * 0.02);
  const sliderHeight = size * 0.25; // Set the height as a proportion of the width
    
    return (
      <div ref={containerRef} style={{
        display: 'flex', // Use flexbox for layout
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        position: 'relative',
        height: '100%', // Take up full height of the container
        width: '100%', // Take up full width of the container
      }} onMouseDown={handleMouseDown}>
        <div style={{
          position: 'relative',
          height: `${sliderHeight}px`, // Dynamic height based on width
          width: '100%',
          border: `${borderSize}px solid #262626`,
          borderRadius: '8px',
          background: '#eee',
          backgroundClip: 'padding-box',
          boxSizing: 'border-box',
        }}>
          <span style={{ 
            position: 'absolute',
            display: 'flex', // Use flexbox for layout
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            fontSize: fontSize, 
            color: 'black', 
            textAlign: 'center', 
            userSelect: 'none', 
            zIndex: 1 
          }}>
            {id}
          </span>
          <div style={{
            position: 'absolute',
            height: '100%',
            width: `${size * 0.075}px`,
            left: `calc(${sliderValue * 97.5}% - ${size * 0.025}px)`,
            background: '#6b6a6a',
            borderRadius: '8px',
            cursor: 'pointer',
          }} />
        </div>
      </div>
    );
  };
  
  export default React.memo(HorizontalSlider);
  
