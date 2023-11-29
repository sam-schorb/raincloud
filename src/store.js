import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import patchInfoReducer from './slices/patchInfoSlice';
import recentPatchesReducer from './slices/recentPatchesSlice';
import likedPatchesReducer from './slices/likedPatchesSlice';
import modeReducer from './slices/modeSlice';  // Import the modeReducer
import layoutReducer from './slices/layoutSlice';  // Import the layoutReducer
import outportMessagesReducer from './slices/outportMessagesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    patchInfo: patchInfoReducer,
    recentPatches: recentPatchesReducer,
    likedPatches: likedPatchesReducer,
    outportMessages: outportMessagesReducer,
    mode: modeReducer,  // Add modeReducer to the store
    layout: layoutReducer,  // Add layoutReducer to the store

  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});
