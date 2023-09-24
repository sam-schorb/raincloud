import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';
import { AiFillDelete } from 'react-icons/ai'; // trash can icon
import { MdEdit } from 'react-icons/md'; // edit icon
import { FaPlay } from 'react-icons/fa'; // play icon
import Notification from './Notification';

const EditListEntry = ({ singlePatchInfo, handleOpenModal, handlePatchDeleted }) => {
    const dispatch = useDispatch();

    const [notificationType, setNotificationType] = useState(null);

    const handleSetPatchNumber = useCallback(() => {
        dispatch(setPatchNumber(singlePatchInfo._id));
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
            setNotificationType("patchDeleted"); // Set notification type for successful patch deletion
        } catch (error) {
            console.error('Error:', error);
            setNotificationType("errorDelete");
        }
    };

    const handleEditButtonClick = () => {
        handleOpenModal(singlePatchInfo._id);
    };

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
            {notificationType === 'errorDelete' && <Notification message="Error deleting patch." setType={setNotificationType} />}
            <li 
              className={`grid grid-cols-12 md:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-12 items-center mx-auto py-1 border-b border-gray-400 gap-x-1`}
              >
                <div className="col-span-1"></div>
                <img 
                    src={`data:image/jpeg;base64,${singlePatchInfo.image.toString('base64')}`} 
                    alt={singlePatchInfo.name} 
                    className="col-span-1 w-12 h-12 object-cover"
                />
                <span className="col-span-3 md:col-span-2 lg:col-span-3 xl:col-span-3 truncate">
                    {singlePatchInfo.name}
                </span>
                <span className="col-span-1 text-right opacity-0 md:opacity-0 lg:opacity-100 overflow-hidden">
                    {timeSince(new Date(singlePatchInfo.uploadDate))}
                </span>
                <div className="flex justify-end items-center col-span-5">
                    <button 
                        onClick={handleSetPatchNumber}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-green-500 hover:text-green-400"
                    >
                        <FaPlay size="1.5em" />
                        <span className="ml-1 sm:hidden md:inline">Play</span>
                    </button>
                    <button 
                        onClick={handleEditButtonClick}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-blue-500 hover:text-blue-400 ml-3"
                    >
                        <MdEdit size="1.5em" />
                        <span className="ml-1 sm:hidden md:inline">Edit</span>
                    </button>
                    <button 
                        onClick={handleDeletePatch}
                        className="flex items-center px-2 py-1 bg-transparent border-0 rounded text-red-500 hover:text-red-400 ml-3"
                    >
                        <AiFillDelete size="1.5em" />
                        <span className="ml-1 sm:hidden md:inline">Delete</span>
                    </button>
                </div>
            </li>
        </div>
    );
};

EditListEntry.propTypes = {
    singlePatchInfo: PropTypes.object.isRequired,
    handleOpenModal: PropTypes.func.isRequired,
    handlePatchDeleted: PropTypes.func.isRequired
};

export default EditListEntry;