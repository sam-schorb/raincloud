import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  patchNumber: null,
  loaderPatchNumber: null, // Add a new state variable for loaderPatchNumber
  playingPatch: null,
  currentDevice: null,  // Added currentDevice to initialState
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
    setLoaderPatchNumber: (state, action) => {
      state.loaderPatchNumber = action.payload;
      if (action.payload !== null) {
        state.playingPatch = action.payload;
      }
    },
    setCurrentDevice: (state, action) => { // Added reducer to handle setting currentDevice
      state.currentDevice = action.payload;
    },
  }
});

export const { setPatchInfoData, setPatchNumber, setLoaderPatchNumber, setCurrentDevice } = patchInfoSlice.actions;
export const selectPatchInfoData = (state) => state.patchInfo.data;
export const selectPatchNumber = (state) => state.patchInfo.patchNumber;
export const selectLoaderPatchNumber = (state) => state.patchInfo.loaderPatchNumber;
export const selectPlayingPatch = (state) => state.patchInfo.playingPatch;
export const selectCurrentDevice = (state) => state.patchInfo.currentDevice; // export the selector for currentDevice

export default patchInfoSlice.reducer;
