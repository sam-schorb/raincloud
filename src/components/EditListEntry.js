import React, { useState, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';
import { AiFillDelete } from 'react-icons/ai'; // trash can icon
import { MdEdit, MdViewModule } from 'react-icons/md'; // edit icon
import { FaPlay } from 'react-icons/fa'; // play icon
import { setDropdownNumColumns } from '../slices/layoutSlice';

const ImagePlaceholder = () => (
  <div className="animate-pulse bg-gray-300 w-full h-12"></div> // Adjust the size as needed
);

const EditListEntry = (({ singlePatchInfo, handleOpenModal, handlePatchDeleted, setNotificationType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [imageSrc, setImageSrc] = useState(null); // State to hold the image source
  const [isImageLoaded, setIsImageLoaded] = useState(false); // New state to track image loading

  useEffect(() => {
    // Function to fetch the image data
    const fetchImageData = async (patchId) => {
      try {
        const response = await fetch(`/patchImage/${patchId}`);
        if (!response.ok) throw new Error(response.statusText);
        const imageData = await response.json();
        setImageSrc(`data:image/png;base64,${imageData}`);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    if (singlePatchInfo._id && !imageSrc) {
      fetchImageData(singlePatchInfo._id);
    }
  }, [singlePatchInfo._id, imageSrc]);

  const onImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleSetPatchNumber = useCallback(() => {
    console.log('patchNumber set to: ', singlePatchInfo._id)
    dispatch(setPatchNumber(singlePatchInfo._id));
    dispatch(setDropdownNumColumns(null)); // Dispatch the new action
  }, [dispatch, singlePatchInfo._id]);

    const handleDeletePatch = async () => {
        try {
            const response = await fetch(`/deletePatch/${singlePatchInfo._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete patch.');
            }

            console.log('Patch deleted successfully.');
            handlePatchDeleted(singlePatchInfo._id); // Call the handlePatchDeleted function after successful deletion
            setNotificationType("Patch Deleted"); // Set notification type for successful patch deletion
        } catch (error) {
            console.error('Error:', error);
            setNotificationType("Error deleting patch");
        }
    };

    const handleEditButtonClick = () => {
        handleOpenModal(singlePatchInfo._id);
    };

    const handleLoadLayout = () => {
        console.log("Loading patch: ", singlePatchInfo._id);
        handleSetPatchNumber();
        navigate(`/editLayout/${singlePatchInfo._id}`);
    }

    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        const timeIntervals = [
            { seconds: 31536000, text: "yr" },
            { seconds: 2592000, text: "mth" },
            { seconds: 604800, text: "wk" },
            { seconds: 86400, text: "d" },
            { seconds: 3600, text: "hr" },
            { seconds: 60, text: "min" }
        ];

        for (let interval of timeIntervals) {
            const result = Math.floor(seconds / interval.seconds);
            if (result > 1) {
                return result + interval.text;
            }
        }
        return Math.floor(seconds) + "s";
    };

    return (
        <div>
            <li 
              className={`grid grid-cols-12 items-center mx-auto border-b border-true-gray gap-x-1`}
              >
                <div className="col-span-1"></div>
                <div className="col-span-1 w-12 h-12 flex-shrink-0">
                    {!isImageLoaded && <ImagePlaceholder />}
                    {imageSrc && (
                        <img
                            src={imageSrc}
                            alt={singlePatchInfo.name} 
                            className={`w-12 h-12 object-cover ${isImageLoaded ? 'block' : 'hidden'}`}
                            onLoad={onImageLoad}
                        />
                    )}
                </div>
                <span className="col-start-2 md:col-start-4 col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-2 truncate">
                    {singlePatchInfo.name}
                </span>
                <span className="col-span-1 text-right opacity-0 lg:opacity-0 xl:opacity-100 overflow-hidden">
                    {timeSince(new Date(singlePatchInfo.uploadDate))}
                </span>
                <div className="flex justify-end items-center col-span-5">
                    <button 
                        onClick={handleSetPatchNumber}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-true-gray hover:text-green-600"
                    >
                        <FaPlay size="1.5em" />
                        <span className="ml-1 hidden md:inline lg:inline xl:inline text-medium-gray">Load</span>
                    </button>
                    <button 
                        onClick={handleEditButtonClick}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-true-gray hover:text-blue-500 ml-3"
                    >
                        <MdEdit size="1.5em" />
                        <span className="ml-1 hidden md:inline lg:inline xl:inline text-medium-gray">Edit</span>
                    </button>
                     <button 
                    onClick={handleLoadLayout}
                    className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-true-gray hover:text-yellow-500 ml-3"
                    >
                    <MdViewModule size="1.5em" />
                    <span className="ml-1 hidden md:inline lg:inline xl:inline text-medium-gray">Layout</span>
                </button>
                    <button 
                        onClick={handleDeletePatch}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-true-gray hover:text-red-500 ml-3"
                    >
                        <AiFillDelete size="1.5em" />
                        <span className="ml-1 hidden md:inline lg:inline xl:inline text-medium-gray">Delete</span>
                    </button>
                </div>
            </li>
        </div>
    );
});

EditListEntry.propTypes = {
    singlePatchInfo: PropTypes.object.isRequired,
    handleOpenModal: PropTypes.func.isRequired,
    handlePatchDeleted: PropTypes.func.isRequired
};

export default memo(EditListEntry);
