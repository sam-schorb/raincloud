import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectPlayingPatch, setPatchNumber, selectPatchNumber } from '../slices/patchInfoSlice';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { MdPlayArrow, MdStop } from 'react-icons/md';
import { selectUser } from '../slices/userSlice';
import { likePatch, unlikePatch } from '../slices/likedPatchesSlice';

function PlayBar({ setNotificationType }) {
    const dispatch = useDispatch();
    const playingPatch = useSelector(selectPlayingPatch);
    const patchNumber = useSelector(selectPatchNumber);
    const user = useSelector(selectUser);
    const userId = user ? user.id : null;
    const likedPatches = useSelector(state => state.likedPatches);
    const [isPlaying, setIsPlaying] = useState(false);
    const [patchInfo, setPatchInfo] = useState(null);
    const [hasLiked, setHasLiked] = useState(Array.isArray(likedPatches) ? likedPatches.includes(playingPatch) : false);
    // eslint-disable-next-line no-unused-vars
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const fetchPatchInfo = async () => {
            try {
                const response = await fetch(`/getPatchInfo?id=${playingPatch}`);
                const data = await response.json();
                setPatchInfo(data[0]);
            } catch (error) {
                console.error('Error fetching patch info:', error);
            }
        };

        setPatchInfo(null);

        if (playingPatch) {
            fetchPatchInfo();
        }
    }, [playingPatch]);

    const triggerNotification = (type) => {
        setNotificationType(type);
        
        // Display the notification for 5 seconds
        setTimeout(() => {
            setNotificationType(null);
        }, 5000);
    };

    const handleLikeToggle = () => {
        if (!userId) {
            triggerNotification("Sign in to add Favourites");
            return;
        }
    
        const wasLiked = hasLiked; // Capture current liked state
    
        // Optimistically update the UI
        setHasLiked(!wasLiked);
    
        // Dispatch Redux action
        if (wasLiked) {
            dispatch(unlikePatch({ userId, patchId: playingPatch }))
                .then(action => {
                    if (action.type === 'likedPatches/unlikePatch/fulfilled') {
                        setLikeCount(action.payload.updatedLikeCount);
                        triggerNotification("Removed from Favourites");
                    }
                })
                .catch(error => {
                    console.error('Error unliking patch:', error);
                    setHasLiked(wasLiked); // Revert on error
                });
        } else {
            dispatch(likePatch({ userId, patchId: playingPatch }))
                .then(action => {
                    if (action.type === 'likedPatches/likePatch/fulfilled') {
                        setLikeCount(action.payload.updatedLikeCount);
                        triggerNotification("Added to Favourites");
                    }
                })
                .catch(error => {
                    console.error('Error liking patch:', error);
                    setHasLiked(wasLiked); // Revert on error
                });
        }
    };
    

    const handlePlayStopClick = () => {
        setIsPlaying(prevIsPlaying => {
            const newIsPlaying = !prevIsPlaying;
            console.log('Setting patchNumber to:', newIsPlaying ? playingPatch : null);
            dispatch(setPatchNumber(newIsPlaying ? playingPatch : null));
            return newIsPlaying;
        });
    };

    useEffect(() => {
        if (playingPatch) {
            document.body.classList.add('playbar-visible');
            console.log('playbarVisible')
        } else {
            document.body.classList.remove('playbar-visible');
            console.log('playbarInvisible')
        }
    }, [playingPatch]);

    useEffect(() => {
        console.log('Patch Number:', patchNumber);
        setIsPlaying(patchNumber !== null);
    }, [patchNumber]);

    if (!playingPatch) return null;

    return (
<div key={playingPatch} className="fixed z-40 bottom-0 w-full h-18 bg-vdark-gray grid grid-cols-11 items-center p-4 transition-transform transform duration-500 z-0">
    <div className="col-span-4 flex items-center justify-center pr-8">
        <div className="w-full flex items-center">
            {patchInfo && (
                <>
                    <img 
                        src={`data:image/jpeg;base64,${patchInfo.image.toString('base64')}`} 
                        alt={patchInfo.name} 
                        className="w-12 h-12 mr-5"
                    />
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="text-white">{patchInfo.username}</div>
                            <div className="text-gray-300">{patchInfo.name}</div>
                        </div>
                        <button onClick={handleLikeToggle} className="p-2">
                            {hasLiked ? <AiFillHeart color="white" size={24} /> : <AiOutlineHeart color="white" size={24} />}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
    <div className="xl:col-start-6 lg:col-start6 md:col-start-6 sm:col-start-10 col-start-10 flex items-center justify-center">
        <button
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full"
            onClick={handlePlayStopClick}
        >
            {isPlaying ? <MdStop size={24} /> : <MdPlayArrow size={24} />}
        </button>
    </div>
    <div className="col-span-4 flex items-center justify-center">
    </div>
</div>










    );
}

export default PlayBar;
