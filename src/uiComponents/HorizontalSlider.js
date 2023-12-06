  import React, { useState, useCallback, useEffect, useRef } from 'react';

const HorizontalSlider = ({ id, value, onValueChange, textSizeRatio = 0.2 }) => {
  const [sliderValue, setSliderValue] = useState(value || 0);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const startXRef = useRef(0); // Ref to store startX value
  const isDraggingRef = useRef(false); // Ref to track if the slider is being dragged
  const [size, setSize] = useState(0);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize(rect.width);
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

  const convertRange = useCallback((oldMin, oldMax, newMin, newMax, oldValue) => {
    return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }, []);

  const moveHandler = useCallback((moveEvent) => {
    if (isDraggingRef.current) {
      moveEvent.preventDefault(); // Prevent default only while dragging
    }
    
    let currentX = moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = currentX - rect.left;
    const percentage = (x / rect.width) * 100;  
    const newValue = Math.min(Math.max(percentage, 0), 100) / 100;

    setSliderValue(newValue);
    onValueChange && onValueChange(newValue);
  }, [convertRange]);

  const endDrag = useCallback(() => {
    isDraggingRef.current = false; // Set dragging to false
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('touchmove', moveHandler);
  }, [moveHandler]);

  const startDrag = useCallback((e) => {
    isDraggingRef.current = true; // Set dragging to true
    startXRef.current = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endDrag);
  }, [moveHandler, endDrag]);

  const fontSize = size * textSizeRatio * 0.3; // Dynamic font size
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
    }} onMouseDown={startDrag} onTouchStart={startDrag}>
      <div ref={sliderRef} style={{
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
