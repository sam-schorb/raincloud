import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/userSlice'; // Importing the selector

function UploadPatch({ setSelectedFile }) {
  const user = useSelector(selectUser);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    
    // Log file contents to console
    const reader = new FileReader();
    reader.onload = function(event) {
        console.log("File contents from UploadPatch:", event.target.result);
    };
    reader.readAsText(file);
}

    const handleButtonClick = () => {
      // Check if user is logged in
      if (!user) {
        alert('Please log in to upload');
        return;
      }
      document.getElementById('file-input').click();
    }

    return (
        <div>
            <button id="upload-btn" onClick={handleButtonClick}>Upload Patch</button>
            <input type="file" id="file-input" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
    );
}

export default UploadPatch;
