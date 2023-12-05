import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const VerticalSlider = ({ id, value, onValueChange, textSizeRatio = 0.2 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(value || 0);
  const editMode = useSelector(selectEditMode);

  const sliderRef = useRef(null);
  const containerRef = useRef(null);
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

  const handleStartInteraction = (clientY) => {
    if (!editMode && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const y = clientY - rect.top;
      const percentage = 100 - ((y / rect.height) * 100);
      const newValue = Math.min(Math.max(0, percentage), 100) / 100;
      setSliderValue(newValue);
      onValueChange && onValueChange(newValue);
    }
  };

  const handleMouseDown = useCallback((event) => {
    setIsDragging(true);
    handleStartInteraction(event.clientY);
    event.preventDefault();
  }, [handleStartInteraction]);

  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      handleStartInteraction(event.clientY);
    }
  }, [isDragging, handleStartInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((event) => {
    setIsDragging(true);
    handleStartInteraction(event.touches[0].clientY);
  }, [handleStartInteraction]);

  const handleTouchMove = useCallback((event) => {
    if (isDragging) {
      handleStartInteraction(event.touches[0].clientY);
    }
  }, [isDragging, handleStartInteraction]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
    }} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      <div style={{
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
