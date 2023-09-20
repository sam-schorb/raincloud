import React, { useState, useEffect } from 'react';

function EditMetadataModal({ isOpen, closeModal, patchId, fetchPatchInfo }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [primaryTag, setPrimaryTag] = useState('');
    const [secondaryTag, setSecondaryTag] = useState('');
    const [patchName, setPatchName] = useState('');
    const [patchDescription, setPatchDescription] = useState('');
    
    const options = ["synth", "sequencer", "drum machine", "sampler", "effect", "glitch", "utility", "modulation"];

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
                    setSelectedImage(null); // This might need further logic for images
                });
        }
    }, [isOpen, patchId]);

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
        if (selectedImage) {
            formData.append('imageFile', selectedImage);
        }

        try {
            const response = await fetch(`/updatePatch/${patchId}`, {
                method: 'PUT',
                body: formData
            });

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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/jpeg') {
            setSelectedImage(file);
        } else {
            alert('Please select a valid JPG image.');
        }
    };

    const handleCancel = () => {
        setPatchName('');
        setPatchDescription('');
        setSelectedImage(null);
        setPrimaryTag('');
        setSecondaryTag('');
        closeModal();
    };

    return (
        <div id="metadata-modal" className={`fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'block z-50' : 'hidden'}`} onClick={handleCancel}>
            <div className="bg-gray-400 p-8 rounded-lg w-1/3 text-gray-900" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col mb-4">
                    <label>Name:</label>
                    <input type="text" value={patchName} onChange={(e) => setPatchName(e.target.value)} className="border border-gray-400 p-2"/>
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
                    <textarea value={patchDescription} onChange={(e) => setPatchDescription(e.target.value)} className="border border-gray-400 p-2"></textarea>
                </div>
                <div className="flex flex-col mb-4">
                    <label>Image (Max 500kb):</label>
                    <input type="file" accept="image/jpeg" onChange={handleImageUpload} className="border border-gray-400 p-2"/>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSave} className="bg-gray-100 text-gray-900 py-2 px-4 mr-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(EditMetadataModal);
