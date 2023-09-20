// slices/likedPatchesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLikedPatches = createAsyncThunk('likedPatches/fetchLikedPatches', async (userId) => {
    const response = await fetch(`/likedPatchesInfo/${userId}`);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
});

export const likePatch = createAsyncThunk('likedPatches/likePatch', async ({ userId, patchId }) => {
    const response = await fetch('/likePatch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, patchId }),
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
});

export const unlikePatch = createAsyncThunk('likedPatches/unlikePatch', async ({ userId, patchId }) => {
    const response = await fetch('/unlikePatch', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, patchId }),
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
});

const likedPatchesSlice = createSlice({
    name: 'likedPatches',
    initialState: {
        likedPatches: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLikedPatches.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchLikedPatches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.likedPatches = action.payload;
            })
            .addCase(fetchLikedPatches.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(likePatch.fulfilled, (state, action) => {
                state.likedPatches.push(action.payload.patchId);  // Add the liked patch ID to the state
            })
            .addCase(unlikePatch.fulfilled, (state, action) => {
                state.likedPatches = state.likedPatches.filter(id => id !== action.payload.patchId); // Remove the unliked patch ID from the state
            })
    },
});

export default likedPatchesSlice.reducer;
export const selectLikedPatches = (state) => state.likedPatches.likedPatches;
export const selectIsLoading = (state) => state.likedPatches.isLoading;
