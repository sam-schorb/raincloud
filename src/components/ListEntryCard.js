// ListEntryCard.js

import React from 'react';
import { useDispatch } from 'react-redux';
import { setPatchNumber } from '../slices/patchInfoSlice';

const ListEntryCard = ({ patch }) => {
    const dispatch = useDispatch();

    const handleSetPatchNumber = () => {
        dispatch(setPatchNumber(patch.id));
    };

    return (
        <div onClick={handleSetPatchNumber} className="card p-4 border border-gray-400 cursor-pointer bg-vdark-gray rounded-xl hover:bg-medium-gray">
            <img src={patch.picture ? `data:image/jpeg;base64,${patch.picture}` : ''} alt={patch.name} className="w-full h-24 mb-3 object-cover" />
            <h2 className="text-xl mb-2 truncate">{patch.name}</h2>
            <p className="text-gray-500 truncate">{patch.username}</p>
        </div>
    );
};

export default ListEntryCard;
