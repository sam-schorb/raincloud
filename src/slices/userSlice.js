import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async action to get patches uploaded by a specific user
export const fetchUserPatchInfo = createAsyncThunk(
  'user/fetchUserPatchInfo',
  async (userId, { rejectWithValue }) => {
      try {
          // Change the fetch URL to match the Express route
          const response = await fetch(`/getUserPatchInfo/${userId}`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return await response.json();
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);

// userSlice.js
export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        recentlyPlayed: [],
        userPatches: [],         // List of patches uploaded by the user
        loadingUserPatches: 'idle' // Loading state for the user patches
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.recentlyPlayed = state.recentlyPlayed || [];
        },
        clearUser: (state) => {
            state.user = null;
            state.recentlyPlayed = [];
            state.userPatches = [];
        },
        updateRecentlyPlayed: (state, action) => {
            if (state.recentlyPlayed) {
                state.recentlyPlayed = [action.payload, ...state.recentlyPlayed].slice(0, 8);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPatchInfo.pending, (state) => {
                state.loadingUserPatches = 'loading';
            })
            .addCase(fetchUserPatchInfo.fulfilled, (state, action) => {
                state.loadingUserPatches = 'idle';
                state.userPatches = action.payload;
            })
            .addCase(fetchUserPatchInfo.rejected, (state) => {
                state.loadingUserPatches = 'failed';
                state.userPatches = [];
            });
    }
});

export const { setUser, clearUser, updateRecentlyPlayed } = userSlice.actions;

export const selectUser = state => state.user.user;
export const selectUserPatches = state => state.user.userPatches;    // Selector for the user patches

export default userSlice.reducer;
