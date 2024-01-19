import React, { useState, useCallback, useRef, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

const Dial = ({
  numTicks = 100,
  degrees = 360,
  min = 0,
  max = 1,
  value = 0,
  textSizeRatio = 0.2,
  onChange = () => {},
  id
}) => {
  const dialRef = useRef(null);
  const [size, setSize] = useState(0);
  const [currentValue, setCurrentValue] = useState(value);
  const fullAngle = degrees;
  const startAngle = (360 - degrees) / 2;
  const endAngle = startAngle + degrees;
  const [deg, setDeg] = useState(((value - min) * (endAngle - startAngle)) / (max - min) + startAngle);

  const radius = size / 2;

  useEffect(() => {
    const updateSize = () => {
      if (dialRef.current) {
        const rect = dialRef.current.getBoundingClientRect();
        setSize(Math.min(rect.width, rect.height));
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (dialRef.current) {
      resizeObserver.observe(dialRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const convertRange = useCallback((oldMin, oldMax, newMin, newMax, oldValue) => {
    return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    let startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    const moveHandler = (moveEvent) => {
      if (moveEvent.cancelable) {
        moveEvent.preventDefault(); // Only call if the event is cancelable
      }
      let currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY;

      const touchSensitivityScale = moveEvent.type.startsWith('touch') ? 0.5 : 1;
      const deltaY = (startY - currentY) * touchSensitivityScale;

      const dial = dialRef.current.getBoundingClientRect();
      const deltaDeg = convertRange(0, dial.height, 0, fullAngle, deltaY);
      let newDeg = Math.min(Math.max(startAngle, deg + deltaDeg), endAngle);
      const newValue = convertRange(startAngle, endAngle, min, max, newDeg);

      setDeg(newDeg);
      setCurrentValue(newValue);
      onChange(newValue);
    };

    const endDrag = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
    };

    // Add touchmove with { passive: false } to handle preventDefault correctly
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endDrag, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: false });
    dialRef.current.addEventListener('touchmove', moveHandler, { passive: false });
  };

  const renderTicks = () => {
    const tickWidth = 2;
    return Array.from({ length: numTicks }, (_, i) => {
      const degree = startAngle + (fullAngle / numTicks) * i;
      const isActive = i < (currentValue / max) * numTicks;
      return (
        <div
          key={i}
          className={`tick ${isActive ? 'active' : ''}`}
          style={{
            width: `${tickWidth}px`,
            height: `${size * 0.25}px`, // Make ticks half the diameter of the dial
            backgroundColor: isActive ? 'aquamarine' : 'transparent',
            position: 'absolute',
            left: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate(-50%, -50%) rotate(${degree}deg) translate(0, -${size * 0.25}px)`,
            transformOrigin: '50% 100%'
          }}
        />
      );
    });
  };
 

  // Styles for the dial components
  const dialStyles = {
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      borderRadius: '50%',
      background: '#EEE',
      position: 'absolute',
      width: `${0.9 * size}px`,
      height: `${0.9 * size}px`,
      zIndex: 1,
    },
    grip: {
      width: `${size * 0.1}px`,
      height: `${size * 0.3}px`, // Increased length of the grip
      background: '#CCC',
      borderRadius: '50%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) rotate(${deg}deg) translate(0, -${radius / 2}px)`, // Grip extends towards center
      transformOrigin: '50% 50%',
      zIndex: 2,
    },
    label: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: `${size * textSizeRatio}px`, // Font size as a ratio of the component size
      color: 'black', // Adjust color as needed
      textAlign: 'center',
      userSelect: 'none',
      zIndex: 3, // Ensuring label is on top
    },
  };

  return (
    <div 
      ref={dialRef} 
      style={dialStyles.container} 
      onMouseDown={startDrag}
      onTouchStart={startDrag}>
      <div style={dialStyles.circle}></div>
      {renderTicks()}
      <div style={dialStyles.grip}></div>
      <span style={dialStyles.label}>{id}</span>
    </div>
  );
};



export default React.memo(Dial);
