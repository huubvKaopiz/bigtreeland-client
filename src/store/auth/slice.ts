import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { get, merge } from "lodash";
import request from "../../utils/request";
import Cookies from "js-cookie";
export interface User {
	access_token: string;
	expires_in: number;
	token_type: string;
	created_at: string;
	deleted_at: string;
	email: string;
	email_verified_at: string;
	id: number;
	name: string;
	updated_at: string;
}

export interface AuthState {
	user: User | null;
	statusUserVerified: "idle" | "waiting";
}

export interface PayloadLogin {
	phone: string;
	password: string;
}

const initialState: AuthState = {
	user: null,
	statusUserVerified: "idle",
};

export const actionLogin = createAsyncThunk("auth/actionLogin", async (data: PayloadLogin, { rejectWithValue }) => {
	try {
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

		Cookies.set("auth", JSON.stringify(response));

		return response;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const actionVerifyAccount = createAsyncThunk("verifyAccount", async (data: any) => {
	const reponseVerify = await request({
		url: "/api/auth/verify-account",
		method: "POST",
		data,
	});

	const responseMe = await request({
		url: "/api/auth/me",
		method: "POST",
		headers: {
			Authorization: `Bearer ${get(reponseVerify, "data.access_token", "")}`,
		},
	});
	const response = merge(reponseVerify.data, responseMe.data);
	return response;
});

export const slice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		actionLogout: (state) => {
			state.user = null;
		},
		actionResetStatusUserVerified: (state) => {
			state.statusUserVerified = "idle";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionLogin.fulfilled, (state, action) => {
				state.user = action.payload as User;
			})
			.addCase(actionLogin.rejected, (state, action) => {
				const error = action.payload as AxiosError;
				if (error.response?.status === 400) state.statusUserVerified = "waiting";
			});
	},
});

export const { actionLogout, actionResetStatusUserVerified } = slice.actions;

export default slice.reducer;
