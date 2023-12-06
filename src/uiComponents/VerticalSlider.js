/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useRef } from 'react';

const VerticalSlider = ({ id, value, onValueChange, textSizeRatio = 0.2 }) => {
  const [sliderValue, setSliderValue] = useState(value || 0);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const startYRef = useRef(0); // Ref to store startY value
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
    
    let currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY;
    const rect = sliderRef.current.getBoundingClientRect();
    const y = currentY - rect.top;
    const percentage = 100 - ((y / rect.height) * 100);  
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
    startYRef.current = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endDrag);
  }, [moveHandler, endDrag]);



  const fontSize = size * textSizeRatio;
  const borderSize = Math.max(1, size * 0.05);
  const sliderHeight = 80 + (size / 3);

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      height: `${sliderHeight}%`,
      width: '75%',
      border: `${borderSize}px solid #262626`,
      margin: 'auto',
      borderRadius: '8px',
      backgroundClip: 'padding-box',
      boxSizing: 'border-box',
    }} onMouseDown={startDrag} onTouchStart={startDrag}>
      <div ref={sliderRef} style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: '#eee',
        borderRadius: '8px',
      }}>
        <span style={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
          width: '100%',
          height: '6.67%',
          top: `calc(${100 - sliderValue * 100}% - 10px)`,
          background: '#6b6a6a',
          borderRadius: '8px',
          cursor: 'pointer',
        }} />
      </div>
    </div>
  );
};

export default React.memo(VerticalSlider);
