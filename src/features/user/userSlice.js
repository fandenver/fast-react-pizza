import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getAddress } from '../../services/apiGeocoding.js';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export const fetchAddress = createAsyncThunk(
  'user/fetchAddress',
  async function () {
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    const addressObj = await getAddress(position);

    const countrySlice = addressObj?.countryName.includes('(the)')
      ? addressObj?.countryName.slice(0, -6)
      : addressObj?.countryName;

    const address = `${addressObj?.city}, ${countrySlice}`;

    return { position, address };
  },
);

const initialState = {
  username: '',
  status: 'idle',
  position: {},
  address: '',
  error: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchAddress.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = 'idle';
        state.error = '';
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          'There was a problem getting your address. Make sure to fill this field.';
      }),
});

export const { updateName } = userSlice.actions;

export default userSlice.reducer;
