import React, { useEffect } from 'react';
import ListEntry from './ListEntry';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/userSlice';
import { fetchLikedPatches, selectLikedPatches, selectIsLoading } from '../slices/likedPatchesSlice';

// LikedList component
const LikedList = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const userId = user ? user.id : null;
    const likedPatches = useSelector(selectLikedPatches);
    const isLoading = useSelector(selectIsLoading);

    useEffect(() => {
        if (userId) {
            dispatch(fetchLikedPatches(userId));
        }
    }, [userId, dispatch]);

    if (!user) {
        return <div className="text-xl"><br />Sign in to show favourites</div>;
    }

    if (likedPatches.length === 0) {
        return <div className="text-xl"><br />Add favourites</div>;
    }

    return (
        
        <div className="w-full mx-auto text-left">
            <div className="text-2xl mb-5"><br />Favourites</div>
            <ul className="list-none p-0">
                {likedPatches.filter(Boolean).map((singlePatchInfo, index) => (
                    <ListEntry
                        key={singlePatchInfo._id}
                        singlePatchInfo={singlePatchInfo}
                        userId={userId}
                        hasLiked={true}
                        isLoading={isLoading}
                    />
                ))}
            </ul>
        </div>
    );
};

export default React.memo(LikedList);
