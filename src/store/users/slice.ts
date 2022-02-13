import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { AddNewUser, GetResponseType, UserType } from "interface";
import { get } from "lodash";
import request from "../../utils/request";

export interface UserReducerState {
	users: GetResponseType<UserType> | null;
	statusGetUser: "idle" | "loading" | "success" | "error";
	statusChangePassword: "idle" | "loading" | "success" | "error";
	statusUpdateUserState: "idle" | "loading" | "success" | "error";
	statusSetPermissionsForUser: "idle" | "loading" | "success" | "error";
	statusAddUser: "idle" | "loading" | "success" | "error";
}

export interface ParamGetUsers {
	search?: string;
	page?: number;
	per_page?: number;
	status?: string;
}

const initialState: UserReducerState = {
	users: null,
	statusGetUser: "idle",
	statusChangePassword: "idle",
	statusUpdateUserState: "idle",
	statusSetPermissionsForUser: "idle",
	statusAddUser: "idle",
};

export const actionGetUsers = createAsyncThunk(
	"actionGetUsers",
	async (params: ParamGetUsers, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/users",
				method: "get",
				params: params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionChangePassworfOfUser = createAsyncThunk(
	"actionChangePassworfOfUser",
	async (
		data: { new_password: string; user_id: number },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: "/api/users/change-password-of-user",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeactiveUser = createAsyncThunk(
	"actionDeactiveUser",
	async (userId: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users/${userId}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionRestoreUser = createAsyncThunk(
	"actionRestoreUser",
	async (userId: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users/${userId}/restore`,
				method: "post",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionSetPermissionsForUser = createAsyncThunk(
	"actionSetPermissionsForUser",
	async (
		data: {
			user_id: number;
			permission_add_ids: number[];
			permission_delete_ids: number[];
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: "/api/permissions/set-permission-for-user",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddUser = createAsyncThunk(
	"actionAddUser",
	async (data: AddNewUser, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/users",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const slice = createSlice({
	name: "users",
	initialState,
	reducers: {
		actionResetStatusAddUser(state) {
			state.statusAddUser = "idle";
		},
		actionResetStatusDeactiveUser(state) {
			state.statusUpdateUserState = "idle";
		},
		actionRestoreUser(state) {
			state.statusUpdateUserState = "idle";
		},
		actionResetStatusChangePassword(state) {
			state.statusChangePassword = "idle";
		},
	},

	extraReducers: (builder) => {
		builder
			// GET USERS
			.addCase(actionGetUsers.pending, (state) => {
				state.statusGetUser = "loading";
			})
			.addCase(actionGetUsers.fulfilled, (state, action) => {
				state.users = action.payload as GetResponseType<UserType>;
				state.statusGetUser = "success";
			})
			.addCase(actionGetUsers.rejected, (state, action) => {
				state.statusGetUser = "error";
				state.users = null;
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// CHANGE PASSWORD FOR USER
			.addCase(actionChangePassworfOfUser.pending, (state) => {
				state.statusChangePassword = "loading";
			})
			.addCase(actionChangePassworfOfUser.fulfilled, (state) => {
				state.statusChangePassword = "success";
				notification.success({ message: "Đổi mật khẩu thành công" });
			})
			.addCase(actionChangePassworfOfUser.rejected, (state, action) => {
				state.statusChangePassword = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//  DEACTIVE USER
			.addCase(actionDeactiveUser.pending, (state) => {
				state.statusUpdateUserState = "loading";
			})
			.addCase(actionDeactiveUser.fulfilled, (state) => {
				state.statusUpdateUserState = "success";
				notification.success({ message: "Vô hiệu hoá tài khoản thành công" });
			})
			.addCase(actionDeactiveUser.rejected, (state, action) => {
				state.statusUpdateUserState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//  RESTORE USER
			.addCase(actionRestoreUser.pending, (state) => {
				state.statusUpdateUserState = "loading";
			})
			.addCase(actionRestoreUser.fulfilled, (state) => {
				state.statusUpdateUserState = "success";
				notification.success({ message: "Khôi phục tài khoản thành công" });
			})
			.addCase(actionRestoreUser.rejected, (state, action) => {
				state.statusUpdateUserState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// SET PERMISSIONS FOR USER
			.addCase(actionSetPermissionsForUser.pending, (state) => {
				state.statusSetPermissionsForUser = "loading";
			})
			.addCase(actionSetPermissionsForUser.fulfilled, (state) => {
				state.statusSetPermissionsForUser = "success";
				notification.success({
					message: "Cập nhật quyền cho tài khoản thành công",
				});
			})
			.addCase(actionSetPermissionsForUser.rejected, (state, action) => {
				state.statusSetPermissionsForUser = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// ADD USER
			.addCase(actionAddUser.pending, (state) => {
				state.statusAddUser = "loading";
			})
			.addCase(actionAddUser.fulfilled, (state) => {
				state.statusAddUser = "success";
				notification.success({ message: "Thêm user thành công" });
			})
			.addCase(actionAddUser.rejected, (state, action) => {
				state.statusAddUser = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const {
	actionResetStatusAddUser,
	actionResetStatusDeactiveUser,
	actionResetStatusChangePassword,
} = slice.actions;

export default slice.reducer;
