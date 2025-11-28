import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsUserInteracted } from '../slices/layoutSlice';
import { selectPatchNumber, setPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';

function WelcomeModal({ isOpen, closeModal }) {
  const [isClosing, setIsClosing] = useState(false);

  const dispatch = useDispatch();
  const isUserInteracted = useSelector(selectIsUserInteracted);
  const patchNumber = useSelector(selectPatchNumber);
  const patchInfo = useSelector(selectPatchInfoData);

  const closeModalWithTransitionAndSelectRandomPatch = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
      if (!isUserInteracted && patchNumber == null) {
        selectRandomPatchId();
      }
    }, 1000);
  };

  const selectRandomPatchId = () => {
    if (patchInfo.length > 0) {
      const randomPatch = patchInfo[Math.floor(Math.random() * patchInfo.length)];
      dispatch(setPatchNumber(randomPatch._id));
    } else {
      console.error('No patches available for random selection.');
    }
  };

  const handleContainerClick = (e) => {
    if (e.target.id === 'info-container') {
      closeModalWithTransitionAndSelectRandomPatch();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <style jsx>{`
        @keyframes modalOpenAnimation {
          from {
            width: 100%;
            height: 0;
            background: rgba(0, 0, 0, 0);
            border: 0px;
          }
          to {
            width: 70%;
            height: 70%;
            background: rgba(0, 0, 0, 1);
            border: 1px solid white;
          }
        }
        #info-container {
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: height 1s;
          font-family: 'Chivo', sans-serif;
        }

        #info-container.hidden {
          height: 40px;
          padding: 0px;
          pointer-events: none;
        }

        #modal {
          position: relative;
          width: 70%;
          height: 70%;
          min-width: 800px;
          min-height: 300px;
          background: rgba(0, 0, 0, 1);
          border: 1px solid white;
          padding: 0px;
          margin: 0px;
          display: flex;
          flex-flow: column;
          transition: background 1s, width 1s, height 1s, border 1s;
        }

        @media (max-width: 768px) {
          #modal {
            width: 100%;
            min-width: 0px;
          }
        }

        .hidden > #modal {
          width: 100%;
          min-height: 0px;
          background: rgba(0, 0, 0, 0);
          border: 0px;
          pointer-events: none;
        }

        #modal-body {
          font-family: 'Chivo', sans-serif;
          width: 100%;
          flex: 1;
          overflow-y: auto;
        }

        #modal-content {
          margin: 40px;
          margin-left: 65px;
          margin-right: 65px;
          font-weight: 300;
        }

        #modal-content > h1 {
          font-size: 40px;
          margin: 0px;
          font-weight: 400;
        }

        #modal-content > h3 {
          margin: 0px;
          text-transform: uppercase;
          font-weight: 400;
        }

        #modal-content > h4 {
          font-weight: 300;
          font-size: 18px;
        }

        #modal-content > p {
          font-size: 18px;
          font-weight: 300;
        }

        ::-webkit-scrollbar {
          width: 20px;
        }

        #modal-body::-webkit-scrollbar-track {
          background-color: black;
          border: 1px solid white;
        }

        #modal-body::-webkit-scrollbar-thumb {
          background: black;
          border: 2px solid white;
          cursor: pointer;
        }

        #modal.opening {
          animation: modalOpenAnimation 1s forwards;
        }

        #close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          font-size: 24px;
          color: white;
        }
      `}</style>

      <div id="info-container" className={isClosing ? 'hidden' : ''} onClick={handleContainerClick}>
        <div id="modal" className={isOpen ? 'opening' : ''}>
          <div id="modal-header"></div>
          <div id="modal-body">
            <div id="modal-content">
              <h1>I am a Modal Window</h1>
              <p>Your Welcome modal content here.</p>
            </div>
          </div>
          <div id="close-button" onClick={closeModalWithTransitionAndSelectRandomPatch}>X</div>
        </div>
      </div>
    </>
  );
}

export default WelcomeModal;
