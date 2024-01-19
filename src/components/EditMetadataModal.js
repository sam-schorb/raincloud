import React, { useState, useEffect } from 'react';

function EditMetadataModal({ isOpen, closeModal, patchId, fetchPatchInfo }) {
    // State management
    const [selectedImage, setSelectedImage] = useState(null);
    const [existingImageName, setExistingImageName] = useState('');
    const [primaryTag, setPrimaryTag] = useState('');
    const [secondaryTag, setSecondaryTag] = useState('');
    const [patchName, setPatchName] = useState('');
    const [patchDescription, setPatchDescription] = useState('');
    
    // Available options for tags
    const options = ["synth", "sequencer", "drum machine", "sampler", "effect", "glitch", "utility", "modulation"];

    // Fetching patch data for editing
    useEffect(() => {
        if (isOpen && patchId) {
            fetch(`/getFullPatchInfo/${patchId}`)
                .then(res => res.json())
                .then(data => {
                    setPatchName(data.name);
                    const [primary, secondary] = data.tags.split(", ");
                    setPrimaryTag(primary || '');
                    setSecondaryTag(secondary || '');
                    setPatchDescription(data.description);
                    if (data.image) {
                        setExistingImageName(data.imageName); // Set existing image name
                    }
                });
        }
    }, [isOpen, patchId]);

    // Handle save action
    const handleSave = async () => {
        if (!primaryTag && !secondaryTag) {
            alert('Please select at least one tag.');
            return;
        }

        const combinedTags = [primaryTag, secondaryTag].filter(Boolean).join(", ");
        const formData = new FormData();
        formData.append('name', patchName);
        formData.append('tags', combinedTags);
        formData.append('description', patchDescription);
        if (!selectedImage && existingImageName) {
            formData.append('existingImageName', existingImageName); // Append existing image name
        }
        try {
            const response = await fetch(`/updatePatch/${patchId}`, { method: 'PUT', body: formData });
            if (response.ok) {
                alert('Patch updated successfully!');
                setSelectedImage(null);
                fetchPatchInfo();
                handleCancel();
            } else {
                alert('Failed to update patch.');
            }
        } catch (error) {
            console.error('Error updating patch:', error);
            alert('Failed to update patch.');
        }
    };

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setExistingImageName(file.name); // Update existing image name when new image is selected
        } else {
            alert('Please select a valid image.');
        }
    };

    // Handle cancel action
    const handleCancel = () => {
        setPatchName('');
        setPatchDescription('');
        setSelectedImage(null);
        setPrimaryTag('');
        setSecondaryTag('');
        closeModal();
    };

    return (
        <div id="edit-metadata-modal" className={`fixed z-52 top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'block z-50' : 'hidden'}`} onClick={handleCancel}>
            <div className="bg-gray-400 p-8 rounded-lg max-w-screen-sm w-full text-gray-900 lg:w-1/3" onClick={e => e.stopPropagation()}>
                {/* Name input */}
                <div className="flex flex-col mb-4">
                    <label>Name:</label>
                    <input type="text" value={patchName} onChange={(e) => setPatchName(e.target.value)} className="border border-gray-400 p-2"/>
                </div>

                {/* Primary Tag Selection */}
                <div className="flex flex-col mb-4">
                    <label>Primary Tag:</label>
                    <select value={primaryTag} onChange={(e) => setPrimaryTag(e.target.value)} className="border border-gray-400 p-2">
                        <option value="">Select Primary</option>
                        {options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>

                {/* Secondary Tag Selection */}
                <div className="flex flex-col mb-4">
                    <label>Secondary Tag:</label>
                    <select value={secondaryTag} onChange={(e) => setSecondaryTag(e.target.value)} className="border border-gray-400 p-2">
                        <option value="">Select Secondary</option>
                        {options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>

                {/* Description input */}
                <div className="flex flex-col mb-4">
                    <label>Description:</label>
                    <textarea value={patchDescription} onChange={(e) => setPatchDescription(e.target.value)} className="border border-gray-400 p-2"></textarea>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col mb-4">
                    <label>Change Image (Max 500kb):</label>
                    {existingImageName && <p>Current Image: {existingImageName}</p>} {/* Display existing image name */}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="border border-gray-400 p-2"/>
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex justify-end">
                    <button onClick={handleSave} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">Save</button>
                    <button onClick={handleCancel} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(EditMetadataModal);