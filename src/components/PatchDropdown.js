import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Import the necessary selectors and actions
import { 
    setPatchNumber, 
    selectPatchInfoData, 
    selectPatchNumber 
} from '../slices/patchInfoSlice';

function PatchDropdown() {
    const dispatch = useDispatch();

    // Use the selectors to get the current state values from the Redux store
    const patchInfo = useSelector(selectPatchInfoData);
    const patchNumber = useSelector(selectPatchNumber);

    const handlePatchChange = (event) => {
        const selectedPatchNumber = event.target.value;
        dispatch(setPatchNumber(selectedPatchNumber));
    };

    return (
        <div>
            <select 
                id="patch-dropdown" 
                onChange={handlePatchChange} 
                value={patchNumber || ''}>
                <option value="">Select Patch</option>
                {patchInfo.map(patch => (
                    <option key={patch._id} value={patch._id}>
                        {patch.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default PatchDropdown;
