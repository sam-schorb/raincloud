import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TempDataContext } from './App';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';


function ParametersModal({ isOpen, closeModal, fetchPatches, fetchPatchInfo, selectedFile, setNotificationType }) {

  const navigate = useNavigate();
  const [paramUIAssociations, setParamUIAssociations] = useState({});
  const [parameters, setParameters] = useState([]);
  const [outports, setOutports] = useState([]);
  const { tempData } = useContext(TempDataContext);
  const dispatch = useDispatch();


  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target.result;
          const parsedContent = JSON.parse(fileContent);
          if (parsedContent.desc) {
            if (parsedContent.desc.parameters) {
              setParameters(parsedContent.desc.parameters);
            }
            if (parsedContent.desc.outports) {
              setOutports(parsedContent.desc.outports);
            }
          }
        } catch (error) {
          console.error('Error parsing selectedFile:', error);
        }
      };
      reader.onerror = () => {
        console.error('Error reading selectedFile:', reader.error);
      };
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

  const handleDropdownChange = (paramId, event) => {
    const updatedAssociations = {
      ...paramUIAssociations,
      [paramId]: event.target.value,
    };
    setParamUIAssociations(updatedAssociations);
  };

  // Add this function inside ParametersModal component
function generateDefaultLayout(uiAssociations) {
  const layout = [];
  let xPosition = 0, yPosition = 0;
  let vSliderHeightInColumn = {};

  Object.entries(uiAssociations).forEach(([id, type], index) => {
    const widgetId = `${type}${index + 1}`;
    const content = `<div id="${widgetId}" style="width:100%; height:100%;"></div>`;

    // Adjust x and y based on vSliders
    if (vSliderHeightInColumn[xPosition]) {
      yPosition = vSliderHeightInColumn[xPosition];
    }

    const layoutItem = {
      content,
      x: xPosition,
      y: yPosition,
      association: { id, type },
      id: widgetId
    };

    if (type === 'vslider') {
      layoutItem.h = 3;
      vSliderHeightInColumn[xPosition] = (vSliderHeightInColumn[xPosition] || 0) + 3;
    }

    if (type === 'hslider') {
      layoutItem.w = 3;
      xPosition += 2; // hslider takes 3 columns, already incremented by 1 below
    }

    layout.push(layoutItem);

    // Increment x and wrap around if necessary
    xPosition = (xPosition + 1) % 16;
    if (xPosition === 0) yPosition++;
  });

  return layout;
}

  const handleFinalSave = async () => {
    const formData = new FormData();
    formData.append('patchFile', selectedFile);
    formData.append('name', tempData.patchName);
    formData.append('tags', tempData.combinedTags);
    formData.append('description', tempData.patchDescription);
    formData.append('url', tempData.url);  // <-- Add the URL to the FormData
    formData.append('uiAssociations', JSON.stringify(paramUIAssociations));
    if (tempData.selectedImage) {
      formData.append('imageFile', tempData.selectedImage);
    }
    const defaultLayout = generateDefaultLayout(paramUIAssociations);
    formData.append('layout', JSON.stringify(defaultLayout));
  

    try {
      const response = await fetch('/uploadPatch', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        closeModal(); // Close modal on successful save
        fetchPatches();
        const patchInfo = await fetchPatchInfo();
        console.log('fetched patchInfo: ', patchInfo);
        setNotificationType('Patch uploaded successfully'); // Set success notification
        return patchInfo; // Here you return the fetched patch info
      } else {
        const errorText = await response.text();
        console.error('Failed to upload patch:', errorText);
        setNotificationType('Failed to upload patch'); // Set failure notification
        return null; // Here you return null to indicate failure
      }
    } catch (error) {
      console.error('Error uploading patch:', error);
      setNotificationType('Failed to upload patch'); // Set failure notification
      return null; // Also return null in the catch block
    }
  };
  
  const handleCustomLayoutSave = async () => {
    // Call handleFinalSave and wait for it to finish
    const patchInfo = await handleFinalSave();
  
    // After handleFinalSave has finished, check the patchInfo
    if (patchInfo && patchInfo.length > 0) {
      console.log('First patch _id: ', patchInfo[0]._id);
  
      // Dispatch the setPatchNumber with the first patch id
      dispatch(setPatchNumber(patchInfo[0]._id));
  
      // Use a timeout to allow the notification to be set and shown before navigating
      setTimeout(() => {
        // Navigate to the edit layout page
        navigate(`/editLayout/${patchInfo[0]._id}`);
      }, 100); // Delay the navigation by 100 milliseconds
    } else {
      console.error('No patch info returned or patch list is empty');
      // If patchInfo is not returned or the array is empty, set a failure notification
      setNotificationType('Failed to upload patch');
    }
  };
  
  

  return (
    <div
      id="parameters-modal"
      className={`fixed z-50 top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
      onClick={closeModal}
    >
      <div 
        className="bg-gray-400 p-8 rounded-lg max-w-screen-sm w-full text-gray-900 lg:w-1/3 overflow-y-auto max-h-3/4" 
        onClick={e => e.stopPropagation()}
      > 
        <h3 className="text-xl font-bold mb-4">Inputs</h3>
        {parameters.map((parameter) => (
          <div key={parameter.paramId} className="flex flex-col mb-4">
            <label>{parameter.name}:</label>
            <select onChange={(e) => handleDropdownChange(parameter.paramId, e)} className="border border-gray-400 p-2">
              <option value="">Select device</option>
              <option value="button">Button</option>
              <option value="dial">Dial</option>
              <option value="switch">Switch</option>
              <option value="vslider">VSlider</option>
              <option value="hslider">HSlider</option>
            </select>
          </div>
        ))}
        <h3 className="text-xl font-bold mb-4 mt-6">Outports</h3>
        {outports.map((outport, idx) => (
          <div key={idx} className="flex flex-col mb-4">
            <label>{outport.tag}:</label>
            <select onChange={(e) => handleDropdownChange(`${outport.tag}`, e)} className="border border-gray-400 p-2">
              <option value="">Select type</option>
              <option value="light">Light</option>
              <option value="numberBox">Number box</option>
            </select>
          </div>
        ))}
        <div className="flex justify-end">
          <button id="default-save-btn" onClick={handleFinalSave} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">
            Save (default)
          </button>
          <button id="custom-layout-save-btn" onClick={handleCustomLayoutSave} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">
            Save (custom layout)
          </button>
          <button id="cancel-btn" onClick={closeModal} className="bg-gray-100 text-gray-900 py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParametersModal;
