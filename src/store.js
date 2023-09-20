// store.js

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import patchInfoReducer from './slices/patchInfoSlice';
import recentPatchesReducer from './slices/recentPatchesSlice';
import likedPatchesReducer from './slices/likedPatchesSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    patchInfo: patchInfoReducer,
    recentPatches: recentPatchesReducer,
    likedPatches: likedPatchesReducer,
  },
});