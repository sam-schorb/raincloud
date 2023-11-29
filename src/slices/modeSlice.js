// modeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const modeSlice = createSlice({
  name: 'mode',
  initialState: {
    editMode: false,
  },
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
  },
});

export const { toggleEditMode, setEditMode } = modeSlice.actions;
export const selectEditMode = (state) => state.mode.editMode;

export default modeSlice.reducer;
