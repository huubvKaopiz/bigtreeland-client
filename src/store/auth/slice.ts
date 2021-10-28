import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get, merge } from "lodash";
import request from "../../utils/request";

export interface User {
  access_token: string;
  expires_in: number;
  token_type: string;
  created_at: "2021-10-27T20:51:36.000000Z";
  deleted_at: null;
  email: "admin@gmail.com";
  email_verified_at: null;
  id: 1;
  name: "admin";
  updated_at: "2021-10-27T20:51:36.000000Z";
}

export interface AuthState {
  user: User | null;
}

export interface PayloadLogin {
  email: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
};

export const actionLogin = createAsyncThunk(
  "auth/actionLogin",
  async (data: PayloadLogin) => {
    const responseLogin = await request({
      url: "/api/auth/login",
      method: "POST",
      data,
    });

    const responseMe = await request({
      url: "/api/auth/me",
      method: "POST",
      data,
      headers: {
        Authorization: `Bearer ${get(responseLogin, "data.access_token", "")}`,
      },
    });

    const response = merge(responseLogin.data, responseMe.data);

    return response;
  }
);

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    actionLogout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(actionLogin.fulfilled, (state, action) => {
      state.user = action.payload as User;
    });
  },
});

export const { actionLogout } = slice.actions;

export default slice.reducer;
