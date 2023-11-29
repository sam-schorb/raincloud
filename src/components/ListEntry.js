import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';
import { likePatch, unlikePatch } from '../slices/likedPatchesSlice';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import Notification from './Notification';
import { Link } from 'react-router-dom';

const ImagePlaceholder = () => (
  <div className="animate-pulse bg-gray-300 w-full h-12"></div> // Adjust the size as needed
);

const ListEntry = (({ singlePatchInfo, userId, hasLiked, likeCount, isArtistPage }) => {
  const dispatch = useDispatch();

const [isLoading] = useState(false);
const [isHovered, setIsHovered] = useState(false);
const [localHasLiked, setLocalHasLiked] = useState(hasLiked);
const [localLikeCount, setLocalLikeCount] = useState(likeCount);
const [notificationType, setNotificationType] = useState(null);
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

  useEffect(() => {
    setLocalHasLiked(hasLiked);
    setLocalLikeCount(likeCount);
  }, [hasLiked, likeCount]);

  const handleLikeToggle = useCallback((e) => {
    e.stopPropagation();
    if (!userId) {
      setNotificationType("login");
    } else {
      const action = localHasLiked ? unlikePatch : likePatch;
      const oppositeActionType = localHasLiked ? "removed" : "added";

      dispatch(action({ userId, patchId: singlePatchInfo._id }))
        .then(() => {
          setLocalHasLiked(!localHasLiked);
          setLocalLikeCount(localHasLiked ? localLikeCount - 1 : localLikeCount + 1);
          setNotificationType(oppositeActionType);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [userId, dispatch, localHasLiked, singlePatchInfo._id, localLikeCount]);

  const handleSetPatchNumber = useCallback(() => {
    dispatch(setPatchNumber(singlePatchInfo._id));
  }, [dispatch, singlePatchInfo._id]);

    const handleUsernameClick = (e) => {
        // Stop the event from propagating to the parent elements
        e.stopPropagation();
    };

    const timeSince = useCallback((date) => {
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
    }, []);


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
                {/* Placeholder div */}
                <div className="md:col-span-1 hidden md:block"></div>
                {/* Image */}
                {singlePatchInfo.image && !isLoading && (
                <div className="col-span-1 w-12 h-12 flex-shrink-0">
                    {!isImageLoaded && <ImagePlaceholder />}
                    {imageSrc && (
                        <img
                            src={imageSrc}
                            alt="Patch"
                            className={`w-12 h-12 object-cover ${isImageLoaded ? 'block' : 'hidden'}`}
                            onLoad={onImageLoad}
                        />
                    )}
                </div>
                )}
                {/* Patch name */}
                <span className="col-span-4 md:col-span-3 lg:col-span-3 truncate">
                    {!isLoading ? singlePatchInfo.name : 'Loading...'}
                </span>
                {/* Username */}
                <span 
                    className="col-span-3 md:col-span-3 lg:col-span-3 text-center truncate hover:underline"
                    onClick={handleUsernameClick}
                >
                    {!isLoading && (
                        isArtistPage ? (
                            <span>{singlePatchInfo.username}</span>
                        ) : (
                        // Inside the ListEntry component
                        <Link to={`/artist/${singlePatchInfo.username}`}>
                        {singlePatchInfo.username}
                        </Link>
                        )
                    )}
                </span>
                {/* Upload time */}
                <span className="col-span-2 text-right opacity-0 sm:opacity-100">
                    {!isLoading ? timeSince(new Date(singlePatchInfo.uploadDate)) : 'Loading...'}
                </span>
                {/* Like button */}
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
});

ListEntry.propTypes = {
  singlePatchInfo: PropTypes.object.isRequired,
  userId: PropTypes.string,
  hasLiked: PropTypes.bool.isRequired,
  likeCount: PropTypes.number.isRequired,
  isArtistPage: PropTypes.bool,
};

export default memo(ListEntry);
