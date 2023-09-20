import React, { useState, useEffect } from 'react';
import ListEntry from './ListEntry';
import { useSelector } from 'react-redux';
import { FixedSizeList as VirtualList } from 'react-window';
import { selectUser } from '../slices/userSlice';
import {  setPatchNumber } from '../slices/patchInfoSlice'; 
import usePaginatedPatches from '../utils/usePaginatedPatches'; // Import the hook here

const List = ({ searchTerm }) => {
    const user = useSelector(selectUser);
    const userId = user ? user.id : null;

    const { patches, loadMore, hasMore } = usePaginatedPatches(); // Use the hook

    const [userLikedPatches, setUserLikedPatches] = useState([]);
    const [likeCountsMap, setLikeCountsMap] = useState({});

    useEffect(() => {
        if (!userId) {
            setUserLikedPatches([]); // Reset liked patches when a user logs out.
        }
    }, [userId]);

    useEffect(() => {
        const fetchLikeCounts = async () => {
            try {
                const response = await fetch(`/likeCounts`);
                const data = await response.json();
                const counts = {};
                data.forEach(item => {
                    counts[item.patchId] = item.likeCount;
                });
                setLikeCountsMap(counts);
            } catch (error) {
                console.error("Error fetching like counts:", error.message);
            }
        };

        const fetchUserLikes = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`/userLikes/${userId}`);
                const data = await response.json();
                setUserLikedPatches(data.likes);
            } catch (error) {
                console.error("Error fetching user likes:", error.message);
            }
        };

        fetchLikeCounts();
        fetchUserLikes();

    }, [userId, patches]);

    const filteredPatchInfo = patches.filter(patch =>
        patch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patch.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const Row = ({ index, style }) => (
        <div style={style}>
            <ListEntry
                key={filteredPatchInfo[index]._id}
                singlePatchInfo={filteredPatchInfo[index]}
                setPatchNumber={setPatchNumber}
                userId={userId}
                hasLiked={userLikedPatches.includes(filteredPatchInfo[index]._id)}
                likeCount={likeCountsMap[filteredPatchInfo[index]._id] || 0}
            />
        </div>
    );

    return (
        <div className="w-full mx-auto text-left">
            <VirtualList
                height={600}
                itemCount={filteredPatchInfo.length}
                itemSize={65}
                onItemsRendered={({ visibleStopIndex }) => {
                    if (visibleStopIndex === filteredPatchInfo.length - 1) {
                        loadMore(); // Use the loadMore function from the hook
                    }
                }}
                width="100%"
            >
                {Row}
            </VirtualList>
            {hasMore && <div>Loading more patches...</div>}
        </div>
    );
};

export default React.memo(List);
