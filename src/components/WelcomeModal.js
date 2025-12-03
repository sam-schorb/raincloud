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

  const animationDurationMs = 550;

  const closeModalWithTransitionAndSelectRandomPatch = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
      if (!isUserInteracted && patchNumber == null) {
        selectRandomPatchId();
      }
    }, animationDurationMs);
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
            transform: translateY(16px) scale(0.94);
            opacity: 0;
            clip-path: inset(32% 18% 32% 18%);
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }
        @keyframes modalCloseAnimation {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
          to {
            transform: translateY(16px) scale(0.94);
            opacity: 0;
            clip-path: inset(32% 18% 32% 18%);
          }
        }
        #info-container {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 80;
          font-family: 'Chivo', sans-serif;
          transition: opacity ${animationDurationMs}ms ease;
        }
        #modal {
          position: relative;
          width: min(820px, 82vw);
          min-width: 320px;
          min-height: 320px;
          max-height: 80vh;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.6), 0 12px 30px rgba(0, 0, 0, 0.4);
          color: #e8ecf3;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation-duration: ${animationDurationMs}ms;
          animation-timing-function: ease;
          animation-fill-mode: forwards;
        }
        #modal.opening {
          animation-name: modalOpenAnimation;
        }
        #modal.closing {
          animation-name: modalCloseAnimation;
        }
        #modal-body {
          width: 100%;
          flex: 1;
          overflow-y: auto;
        }
        #modal-content {
          padding: 32px 42px 38px 42px;
          display: grid;
          gap: 14px;
        }
        #modal-content h1 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.01em;
        }
        #modal-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: #cdd5df;
        }
        .steps {
          display: grid;
          gap: 8px;
          padding-left: 18px;
        }
        .step {
          list-style: decimal;
          color: #cdd5df;
          line-height: 1.5;
        }
        .step em {
          color: #ffffff;
          font-style: normal;
          font-weight: 600;
        }
        #close-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          color: #e8ecf3;
          font-size: 18px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 120ms ease, transform 120ms ease;
        }
        #close-button:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: scale(1.03);
        }
        @media (max-width: 768px) {
          #modal {
            width: 94%;
            height: 70vh;
            min-height: 320px;
          }
          #modal-content {
            padding: 26px 22px 30px 22px;
          }
          #modal-content h1 {
            font-size: 24px;
          }
        }
      `}</style>

      <div
        id="info-container"
        className={isClosing ? 'closing' : 'opening'}
        style={{ opacity: isClosing ? 0 : 1 }}
        onClick={handleContainerClick}
      >
        <div id="modal" className={isClosing ? 'closing' : 'opening'}>
          <button id="close-button" aria-label="Close" onClick={closeModalWithTransitionAndSelectRandomPatch}>
            ×
          </button>
          <div id="modal-body">
            <div id="modal-content">
              <h1>RainCloud</h1>
              <p>
                A quick guide to get playing and uploading RNBO patches in the browser:
              </p>
              <ol className="steps">
                <li className="step">
                  Load a patch fast with <em>Random</em> in the top bar or the Start button.
                </li>
                <li className="step">
                  Use <em>Explore</em> to search by name/artist, filter by tags, and sort by newest, popular, or random.
                </li>
                <li className="step">
                  Play the grid of knobs, sliders, switches, and buttons—each is mapped to RNBO parameters or outports.
                </li>
                <li className="step">
                  Sign in to favourite patches, leave comments, and manage your own uploads and layouts.
                </li>
                <li className="step">
                  Upload your RNBO export, add tags, an image, and an optional link; RainCloud auto-builds a starter layout you can refine.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeModal;
