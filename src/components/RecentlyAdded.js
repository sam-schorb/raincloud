import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatchInfoData } from '../slices/patchInfoSlice';
import ListEntryCard from './ListEntryCard';

const RecentlyAdded = () => {
    const patchInfoData = useSelector(selectPatchInfoData);

    if (!patchInfoData || patchInfoData.length === 0) {
        return <div className="text-xl">Loading...<br /></div>;
    }

    const recentPatches = [...patchInfoData]
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 8)
        .map(patch => ({
            id: patch._id,
            username: patch.username,
            name: patch.name,
            picture: patch.image,
        }));

    return (
        <div>
            <h1 className='text-2xl mb-5 mt-5'>Recently Added</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-hidden">
                {recentPatches.map((patch, index) => (
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

export default RecentlyAdded;
