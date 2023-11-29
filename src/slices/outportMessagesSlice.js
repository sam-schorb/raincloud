// outportMessagesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const outportMessagesSlice = createSlice({
  name: 'outportMessages',
  initialState: {},
  reducers: {
    setOutportMessage: (state, action) => {
      state[action.payload.tag] = action.payload.payload;
    },
  },
});

export const { setOutportMessage } = outportMessagesSlice.actions;
export const selectOutportMessages = (state) => state.outportMessages;
export default outportMessagesSlice.reducer;
