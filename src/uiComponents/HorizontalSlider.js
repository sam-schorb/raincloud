import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const HorizontalSlider = ({ id, value, onValueChange, textSizeRatio = 0.2 }) => {
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

  const convertRange = useCallback((oldMin, oldMax, newMin, newMax, oldValue) => {
    return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    let startX;
    if (e.type === 'mousedown') {
      startX = e.clientX;
    } else if (e.type === 'touchstart') {
      startX = e.touches[0].clientX;
    }

    const moveHandler = (moveEvent) => {
      let currentX;
      if (moveEvent.type === 'mousemove') {
        currentX = moveEvent.clientX;
      } else if (moveEvent.type === 'touchmove') {
        currentX = moveEvent.touches[0].clientX;
      }

      const deltaX = currentX - startX;
      const slider = sliderRef.current.getBoundingClientRect();
      const percentage = convertRange(0, slider.width, 0, 100, deltaX);
      const newValue = Math.min(Math.max(0, percentage), 100) / 100;

      setSliderValue(newValue);
      onValueChange && onValueChange(newValue);
    };

    const endDrag = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endDrag);
  };

  const fontSize = size * textSizeRatio * 0.35;
  const borderSize = Math.max(1, size * 0.02);
  const sliderHeight = size * 0.25;

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      height: '100%',
      width: '100%',
    }} onMouseDown={startDrag} onTouchStart={startDrag}>
      <div ref={sliderRef} style={{
        position: 'relative',
        height: `${sliderHeight}px`,
        width: '100%',
        border: `${borderSize}px solid #262626`,
        borderRadius: '8px',
        background: '#eee',
        backgroundClip: 'padding-box',
        boxSizing: 'border-box',
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
          height: '100%',
          width: `${size * 0.075}px`,
          left: `calc(${sliderValue * 100}% - ${size * 0.0375}px)`,
          background: '#6b6a6a',
          borderRadius: '8px',
          cursor: 'pointer',
        }} />
      </div>
    </div>
  );
};

export default React.memo(HorizontalSlider);
