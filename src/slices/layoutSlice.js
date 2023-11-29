// src/slices/layoutSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    showLabel: true,
    numColumns: 16,
    dropdownNumColumns: 16,
    isUserInteracted: false,
    hasUiHandlersSetUp: false, // New state for tracking event handler setup
  },
  reducers: {
    setShowLabel: (state, action) => {
      state.showLabel = action.payload;
    },
    setNumColumns: (state, action) => {
      state.numColumns = action.payload;
    },
    setDropdownNumColumns: (state, action) => {
      state.dropdownNumColumns = action.payload;
    },
    setIsUserInteracted: (state, action) => {
      state.isUserInteracted = action.payload;
    },
    setHasUiHandlersSetUp: (state, action) => { // New reducer for event handler setup
      state.hasUiHandlersSetUp = action.payload;
    },
  },
});

export const {
  setShowLabel,
  setNumColumns,
  setDropdownNumColumns,
  setIsUserInteracted,
  setHasUiHandlersSetUp, // Export the new action
} = layoutSlice.actions;

export const selectShowLabel = (state) => state.layout.showLabel;
export const selectNumColumns = (state) => state.layout.numColumns;
export const selectDropdownNumColumns = (state) => state.layout.dropdownNumColumns;
export const selectIsUserInteracted = (state) => state.layout.isUserInteracted;
export const selectHasUiHandlersSetUp = (state) => state.layout.hasUiHandlersSetUp; // New selector

export default layoutSlice.reducer;
