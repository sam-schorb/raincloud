import React, { useState, useEffect } from 'react';
import ListEntry from './ListEntry';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/userSlice';
import { selectPatchInfoData, setPatchNumber } from '../slices/patchInfoSlice';

const List = ({ searchTerm }) => {
    const user = useSelector(selectUser);
    const userId = user ? user.id : null;


    // Get patch info from Redux store
    const patchInfo = useSelector(selectPatchInfoData);

    // State to keep track of liked patches for the user
    const [userLikedPatches, setUserLikedPatches] = useState([]);
    const [likeCountsMap, setLikeCountsMap] = useState({});

    useEffect(() => {
        if (!userId) {
            setUserLikedPatches([]); // Reset liked patches when a user logs out.
        }
    }, [userId]);

    useEffect(() => {
        console.log("patchInfo in List: ", patchInfo);

        /**
         * Fetches the like counts for all patches.
         * 
         * @returns {Promise}
         */
        const fetchLikeCounts = () => fetch(`/likeCounts`)
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                const counts = {};
                data.forEach(item => {
                    counts[item.patchId] = item.likeCount;
                });
                setLikeCountsMap(counts);
            });

        /**
         * Fetches the patches liked by the user.
         * 
         * @returns {Promise}
         */
        const fetchUserLikes = () => {
            if (userId) {
                return fetch(`/userLikes/${userId}`)
                    .then(response => {
                        if (!response.ok) throw new Error(response.statusText);
                        return response.json();
                    })
                    .then(data => {
                        setUserLikedPatches(data.likes);
                    });
            }
            return Promise.resolve(); // If no userId, resolve the promise immediately.
        };

        Promise.all([fetchLikeCounts(), fetchUserLikes()])
            .catch(err => {
                console.error("Error during parallel fetch:", err.message);
            });

    }, [patchInfo, userId]);

    // handleSearch function is not needed anymore

    // Filtering patches based on the search term
    const filteredPatchInfo = patchInfo.filter(patch =>
        patch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patch.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full mx-auto text-left">
            <div className="text-2xl mb-5"><br />All Patches</div>
            <ul className="list-none p-0">
                {filteredPatchInfo.map((singlePatchInfo) => (
                    <ListEntry
                        key={singlePatchInfo._id}
                        singlePatchInfo={singlePatchInfo}
                        setPatchNumber={setPatchNumber}
                        userId={userId}
                        hasLiked={userLikedPatches.includes(singlePatchInfo._id)}
                        likeCount={likeCountsMap[singlePatchInfo._id] || 0}
                    />
                ))}
            </ul>
        </div>
    );    
};

export default React.memo(List);
