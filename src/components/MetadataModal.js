import React, { useState, useEffect } from 'react';

function MetadataModal({ isOpen, closeModal, fetchPatchInfo }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [primaryTag, setPrimaryTag] = useState('');
    const [secondaryTag, setSecondaryTag] = useState('');
    const options = ["synth", "sequencer", "drum machine", "sampler", "effect", "glitch", "utility", "modulation"];

    useEffect(() => {
        if (selectedFile) {
            setTimeout(() => {
                document.getElementById('metadata-modal').classList.add('opacity-100');
            }, 50);
        }
    }, [selectedFile]);

    useEffect(() => {
        if (isOpen) {
          document.getElementById('metadata-modal').classList.add('opacity-100');
        } else {
          document.getElementById('metadata-modal').classList.remove('opacity-100');
        }
      }, [isOpen]);


      const handleSave = async () => {
        console.log("handleSave called!");
    
        const patchName = document.getElementById('patch-name').value;
        const patchDescription = document.getElementById('patch-description').value;
    
        if (!primaryTag && !secondaryTag) {
            alert('Please select at least one tag.');
            return;
        }
    
        const combinedTags = [primaryTag, secondaryTag].filter(Boolean).join(", ");
    
        const formData = new FormData();
        formData.append('patchFile', selectedFile);
        formData.append('name', patchName);
        formData.append('tags', combinedTags);
        formData.append('description', patchDescription);
        if (selectedImage) {
            formData.append('imageFile', selectedImage);
        }
    
        try {
            const response = await fetch('/uploadPatch', {
                method: 'POST',
                body: formData
            });
    
            if (response.ok) {
                alert('Patch uploaded successfully!');
                setSelectedFile(null);
                fetchPatchInfo();
    
                // Close the modal if the patch upload was successful.
                handleCancel();
            } else {
                alert('Failed to upload patch.');
            }
        } catch (error) {
            console.error('Error uploading patch:', error);
            alert('Failed to upload patch.');
        }
    };
    

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/jpeg') {
            setSelectedImage(file);
        } else {
            alert('Please select a valid JPG image.');
        }
    };

    const handleCancel = () => {
        document.getElementById('metadata-modal').classList.remove('opacity-100');
        setTimeout(() => {
          setSelectedImage(null);
          setSelectedFile(null);
          setPrimaryTag('');
          setSecondaryTag('');
          document.getElementById('patch-name').value = '';
          document.getElementById('patch-description').value = '';
          document.getElementById('patch-file').value = '';
          document.getElementById('patch-image').value = '';
          closeModal();
        }, 300);
      };
    

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        // Log file contents to console
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log("File contents from MetadataModal:", event.target.result);
        };
        reader.readAsText(file);
    };
    

    return (
        <div id="metadata-modal" className={`fixed  z-51 top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'block opacity-0' : 'hidden opacity-100'}`} onClick={handleCancel}>
        <div className="bg-gray-400 p-8 rounded-lg max-w-screen-sm w-full text-gray-900 lg:w-1/3" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col mb-4">
                    <label>Patch File (Max 2mb):</label>
                    <input type="file" id="patch-file" accept=".json" onChange={handleFileChange} className="border border-gray-400 p-2"/>
                </div>
                <div className="flex flex-col mb-4">
                    <label>Name:</label>
                    <input type="text" id="patch-name" className="border border-gray-400 p-2"/>
                </div>
                <div className="flex flex-col mb-4">
                    <label>Primary Tag:</label>
                    <select value={primaryTag} onChange={(e) => setPrimaryTag(e.target.value)} className="border border-gray-400 p-2">
                        <option value="">Select Primary</option>
                        {options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col mb-4">
                    <label>Secondary Tag:</label>
                    <select value={secondaryTag} onChange={(e) => setSecondaryTag(e.target.value)} className="border border-gray-400 p-2">
                        <option value="">Select Secondary</option>
                        {options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col mb-4">
                    <label>Description:</label>
                    <textarea id="patch-description" className="border border-gray-400 p-2"></textarea>
                </div>
                <div className="flex flex-col mb-4">
                <label>Image (Max 500kb):</label>
                    <input type="file" id="patch-image" accept="image/jpeg" onChange={handleImageUpload} className="border border-gray-400 p-2"/>
                </div>
                <div className="flex justify-end">
                    <button id="save-btn" onClick={handleSave} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">Save</button>
                    <button onClick={handleCancel} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(MetadataModal);
