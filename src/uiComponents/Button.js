import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEditMode } from '../slices/modeSlice';

const BUTTON_MODE = 'adapt';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: BUTTON_MODE === 'fixed' ? '80px' : '100%',
    height: BUTTON_MODE === 'fixed' ? '80px' : '100%',
    border: '4px solid #262626',
    borderRadius: '50%',
    backgroundClip: 'padding-box',
    boxSizing: 'border-box',
  },
  button: (isClicked) => ({
    width: BUTTON_MODE === 'fixed' ? '72px' : 'calc(100% - 2px)',  // Adjusted size for fixed mode
    height: BUTTON_MODE === 'fixed' ? '72px' : 'calc(100% - 2px)',  // Adjusted size for fixed mode
    border: '4px solid #6b6a6a',
    borderRadius: '50%',
    backgroundColor: isClicked ? '#6b6a6a' : 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
    position: 'relative', // Added to position label
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

const Button = ({ id, paramId, handleButtonClick }) => {
  const [isClicked, setIsClicked] = useState(false);
  const editMode = useSelector(selectEditMode);

  const handleClick = useCallback(() => {
    if (!editMode) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 100);
      handleButtonClick && handleButtonClick(paramId);
    }
  }, [editMode, paramId, handleButtonClick]);

  return (
    <div style={styles.container} onClick={handleClick}>
      <div style={styles.button(isClicked)}>
        <span style={styles.label}>{id}</span>
      </div>
    </div>
  );
};

export default React.memo(Button);
