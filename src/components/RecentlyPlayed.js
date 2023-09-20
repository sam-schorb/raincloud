import React, { useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/userSlice';
import { setRecentPatches, setLoading, selectRecentPatches, selectIsLoading } from '../slices/recentPatchesSlice';
import ListEntryCard from './ListEntryCard';

const RecentlyPlayed = ({ searchTerm }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const userId = user ? user.id : null;
    const recentPatches = useSelector(selectRecentPatches);
    const isLoading = useSelector(selectIsLoading);

    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            if (userId) {
                dispatch(setLoading(true));
                try {
                    const response = await axios.get(`/getRecentlyPlayed/${userId}`);
                    const recentPatchesData = response.data.map(patch => {
                        return {
                            id: patch.id,
                            username: patch.username,
                            name: patch.name,
                            picture: patch.picture,
                        }
                    });
                    dispatch(setRecentPatches(recentPatchesData));
                } catch (error) {
                    console.error('Error loading recently played patches:', error);
                }
                dispatch(setLoading(false));
            } else {
                dispatch(setRecentPatches([]));
                dispatch(setLoading(false));
            }
        };

        fetchRecentlyPlayed();
    }, [userId, dispatch]);

    if (searchTerm || !userId) {
        return null;
    }

    if (isLoading && recentPatches.length === 0) {
        return <div className="text-xl mb-5 mt-5">Loading...<br /></div>;
    }

    return (
        <div>
            <h1 className='text-2xl mb-5 mt-5'>Recently Played</h1>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-hidden">
                {recentPatches.slice(0, 8).map((patch, index) => (
                    <div
                        key={index}
                        className={`xs:${index > 1 ? 'hidden' : 'block'}
                                    sm:${index > 3 ? 'hidden' : 'block'} 
                                    md:${index > 5 ? 'hidden' : 'block'}`}
                    >
                        <ListEntryCard patch={patch} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyPlayed;
