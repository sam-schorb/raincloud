// slices/recentPatchesSlice.js

import { createSlice } from '@reduxjs/toolkit';

export const recentPatchesSlice = createSlice({
  name: 'recentPatches',
  initialState: {
    recentPatches: Array(8).fill({}), // define 5 empty objects
    isLoading: true,
},
reducers: {
    setRecentPatches: (state, action) => {
        state.recentPatches = action.payload;
    },
    setLoading: (state, action) => {
        state.isLoading = action.payload;
    },
  },
});

export const { setRecentPatches, setLoading } = recentPatchesSlice.actions;

export const selectRecentPatches = state => state.recentPatches.recentPatches;
export const selectIsLoading = state => state.recentPatches.isLoading;

export default recentPatchesSlice.reducer;