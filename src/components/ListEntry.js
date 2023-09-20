import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';
import { likePatch, unlikePatch } from '../slices/likedPatchesSlice';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import Notification from './Notification';


const ListEntry = ({ singlePatchInfo, userId, hasLiked, likeCount }) => {
    const dispatch = useDispatch();

    const [localHasLiked, setLocalHasLiked] = useState(hasLiked);
    
    const [isLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [notificationType, setNotificationType] = useState(null);

    // Keeping localLikeCount for potential future use
    // eslint-disable-next-line no-unused-vars
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    


    useEffect(() => {
        setLocalHasLiked(hasLiked);
        setLocalLikeCount(likeCount);
    }, [hasLiked, likeCount, setLocalLikeCount]);
    
    

    const handleLikeToggle = (e) => {
        e.stopPropagation();
        if (!userId) {
            setNotificationType("login");
        } else {
            if (localHasLiked) {
                setLocalHasLiked(false);
                setLocalLikeCount(prevCount => prevCount - 1);
                dispatch(unlikePatch({ userId, patchId: singlePatchInfo._id }))
                    .then(() => {
                        setNotificationType("removed");
                    })
                    .catch((error) => {
                        setLocalHasLiked(true);
                        setLocalLikeCount(prevCount => prevCount + 1);
                        console.error('Error:', error);
                    });
            } else {
                setLocalHasLiked(true);
                setLocalLikeCount(prevCount => prevCount + 1);
                dispatch(likePatch({ userId, patchId: singlePatchInfo._id }))
                    .then(() => {
                        setNotificationType("added");
                    })
                    .catch((error) => {
                        setLocalHasLiked(false);
                        setLocalLikeCount(prevCount => prevCount - 1);
                        console.error('Error:', error);
                    });
            }
        }
    };

    const handleSetPatchNumber = useCallback(() => {
        dispatch(setPatchNumber(singlePatchInfo._id));
    }, [dispatch, singlePatchInfo._id]);

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
            {notificationType === 'login' && <Notification message="Sign in to add Favourites" setType={setNotificationType} />}
            {notificationType === 'added' && <Notification message="Added to your Favourites" setType={setNotificationType} />}
            {notificationType === 'removed' && <Notification message="Removed from your Favourites" setType={setNotificationType} />}
            <li 
                onClick={handleSetPatchNumber} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`grid grid-cols-12 items-center mx-auto py-1 border-b border-gray-400 gap-x-1 cursor-pointer ${isHovered ? 'bg-medium-gray' : ''}`}
                >
                    <div className="md:col-span-1 hidden md:block"></div> {/* this placeholder div takes up space only on larger screens */}
                    {singlePatchInfo.image && !isLoading && (
                        <div className="col-span-1 w-12 h-12 flex-shrink-0">
                            <img 
                                src={`data:image/jpeg;base64,${singlePatchInfo.image.toString('base64')}`} 
                                alt={singlePatchInfo.name} 
                                className="w-full h-full object-cover hidden md:block"
                            />
                        </div>
                    )}
                    {/* Name column span adjusted to take up the space on smaller screens */}
                    <span className="col-span-4 md:col-span-3 lg:col-span-3 truncate">
                        {!isLoading ? singlePatchInfo.name : 'Loading...'}
                    </span>
                <span className="col-span-3 md:col-span-3 lg:col-span-3 text-center truncate">
                    {!isLoading ? singlePatchInfo.username : 'Loading...'}
                </span>
                <span className="col-span-2 text-right opacity-0 sm:opacity-0 md:opacity-100">
                    {!isLoading ? timeSince(new Date(singlePatchInfo.uploadDate)) : 'Loading...'}
                </span>
                <div className="flex justify-end items-center col-span-1">
                <button 
                    onClick={(e) => { handleLikeToggle(e); }} 
                    disabled={isLoading} 
                    className="flex items-center px-2 py-1 bg-transparent border-0 rounded"
                    style={{ opacity: isHovered ? 1 : 0 }}
                >
                    {localHasLiked ? <AiFillHeart color="white" size="2em" /> : <AiOutlineHeart color="white" size="2em" />}
                </button>
                </div>
            </li>
        </div>
    );
};

ListEntry.propTypes = {
    singlePatchInfo: PropTypes.object.isRequired,
    userId: PropTypes.string,
    hasLiked: PropTypes.bool.isRequired,
};

export default ListEntry