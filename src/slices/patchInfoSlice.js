import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  patchNumber: null,
  playingPatch: null,  // Add a playingPatch variable in initialState
};

const patchInfoSlice = createSlice({
  name: 'patchInfo',
  initialState,
  reducers: {
    setPatchInfoData: (state, action) => {
      state.data = action.payload;
    },
    setPatchNumber: (state, action) => {
      state.patchNumber = action.payload;
      if (action.payload !== null) {
        state.playingPatch = action.payload;
      }
    },
  }
});

export const { setPatchInfoData, setPatchNumber } = patchInfoSlice.actions;
export const selectPatchInfoData = (state) => state.patchInfo.data;
export const selectPatchNumber = (state) => state.patchInfo.patchNumber;
export const selectPlayingPatch = (state) => state.patchInfo.playingPatch; // export the selector for playingPatch

export default patchInfoSlice.reducer;







