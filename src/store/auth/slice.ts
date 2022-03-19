import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError, AxiosResponse } from "axios";
import { get, merge } from "lodash";
import { handleResponseError } from "utils/ultil";
import request from "../../utils/request";
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
	statusChangePassword: "idle" | "loading" | "success" | "error";
}

export interface PayloadLogin {
	phone: string;
	password: string;
}

const initialState: AuthState = {
	user: null,
	statusUserVerified: "idle",
	statusChangePassword:"idle",
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

export const actionChangePassword = createAsyncThunk("changePassword", async (data: {current_password:string, new_password:string},{rejectWithValue}) => {
	try {
		const response = await request({
			url: "/api/auth/change-password",
			method: "POST",
			data,
		});
		return response;
	} catch (error) {
		return rejectWithValue(error);
	}
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
			})

			.addCase(actionChangePassword.pending, (state) => {
				state.statusChangePassword="loading";
			})
			.addCase(actionChangePassword.fulfilled, (state) => {
				state.statusChangePassword="success";
				notification.success({message:"Thay đổi mật khẩu thành công!"})
			})
			.addCase(actionChangePassword.rejected, (state, action) => {
				state.statusChangePassword="error";
				const error = action.payload as AxiosError<AxiosResponse>;
				handleResponseError(error)
			});
	},
});

export const { actionLogout, actionResetStatusUserVerified } = slice.actions;

export default slice.reducer;
