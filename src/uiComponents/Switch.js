// Now, modify the Switch component
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const SWITCH_MODE = 'adapt';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: SWITCH_MODE === 'fixed' ? '80px' : '100%',
    height: SWITCH_MODE === 'fixed' ? '80px' : '100%',
    border: '4px solid #262626',
    borderRadius: '50%',
    backgroundClip: 'padding-box',
    boxSizing: 'border-box',
  },
  switch: (isOn) => ({
    width: SWITCH_MODE === 'fixed' ? '72px' : 'calc(100% - 2px)',
    height: SWITCH_MODE === 'fixed' ? '72px' : 'calc(100% - 2px)',
    border: '4px solid #6b6a6a',
    borderRadius: '50%',
    backgroundColor: isOn ? '#6b6a6a' : 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
  }),
  label: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px', // Smaller font size to fit the button
    color: 'black', // Color of the label text
    textAlign: 'center',
    userSelect: 'none', // Prevents text selection
  }
};

const Switch = ({ id, paramId, handleSwitchClick }) => { 
  const [isOn, setIsOn] = useState(false);  // Rename state to reflect on/off state
  const editMode = useSelector(selectEditMode);

  const handleClick = useCallback(() => {
    if (!editMode) {
      setIsOn(prevState => !prevState); // Toggle the state
      handleSwitchClick && handleSwitchClick(paramId);
    }
  }, [editMode, paramId, handleSwitchClick]);

  return (
    <div style={styles.container} onClick={handleClick}>
      <div style={styles.switch(isOn)} />
      <span style={styles.label}>{id}</span>
    </div>
  );
};




export default React.memo(Switch);