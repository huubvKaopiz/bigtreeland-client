import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { ListUserType } from "interface";
import { AddNewUser } from "interface/interfaces";
import request from "../../utils/request";

export interface UserReducerState {
	users: ListUserType | null;
	statusGetUser: "idle" | "loading" | "success" | "error";
	statusChangePassword: "idle" | "loading" | "success" | "error";
	statusDeactiveUser: "idle" | "loading" | "success" | "error";
	statusSetPermissionsForUser: "idle" | "loading" | "success" | "error";
	statusAddUser: "idle" | "loading" | "success" | "error";
}

export interface ParamGetUsers {
	search?: string;
	page?: number;
}

const initialState: UserReducerState = {
	users: null,
	statusGetUser: "idle",
	statusChangePassword: "idle",
	statusDeactiveUser: "idle",
	statusSetPermissionsForUser: "idle",
	statusAddUser: "idle",
};

export const actionGetUsers = createAsyncThunk("actionGetUsers", async (params?: ParamGetUsers) => {
	const response = await request({
		url: "/api/users",
		method: "get",
		params: params,
	});
	return response.data;
});

export const actionChangePassworfOfUser = createAsyncThunk(
	"actionChangePassworfOfUser",
	async (data: { new_password: string; user_id: number }) => {
		const response = await request({
			url: "/api/users/change-password-of-user",
			method: "post",
			data,
		});
		return response.data;
	}
);

export const actionDeactiveUser = createAsyncThunk("actionDeactiveUser", async (userId: number) => {
	const response = await request({
		url: `/api/users/${userId}`,
		method: "delete",
	});
	return response.data;
});

export const actionSetPermissionsForUser = createAsyncThunk(
	"actionSetPermissionsForUser",
	async (data: { user_id: number; permission_add_ids: number[]; permission_delete_ids: number[] }) => {
		const response = await request({
			url: "/api/permissions/set-permission-for-user",
			method: "post",
			data,
		});
		return response.data;
	}
);

export const actionAddUser = createAsyncThunk("actionAddUser", async (data: AddNewUser) => {
	const response = await request({
		url: "/api/users",
		method: "post",
		data,
	});
	return response.data;
});

export const slice = createSlice({
	name: "users",
	initialState,
	reducers: {
		actionResetStatusAddUser(state) {
			state.statusAddUser = "idle";
		},
		actionResetStatusDeactiveUser(state) {
			state.statusDeactiveUser = "idle";
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
				state.users = action.payload as ListUserType;
				state.statusGetUser = "success";
			})
			.addCase(actionGetUsers.rejected, (state) => {
				state.statusGetUser = "error";
				state.users = null;
			})

			// CHANGE PASSWORD FOR USER
			.addCase(actionChangePassworfOfUser.pending, (state) => {
				state.statusChangePassword = "loading";
			})
			.addCase(actionChangePassworfOfUser.fulfilled, (state) => {
				state.statusChangePassword = "success";
				notification.success({ message: "Đổi mật khẩu thành công" });
			})
			.addCase(actionChangePassworfOfUser.rejected, (state) => {
				state.statusChangePassword = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			//  DEACTIVE USER
			.addCase(actionDeactiveUser.pending, (state) => {
				state.statusDeactiveUser = "loading";
			})
			.addCase(actionDeactiveUser.fulfilled, (state) => {
				state.statusDeactiveUser = "success";
				notification.success({ message: "Vô hiệu hoá tài khoản thành công" });
			})
			.addCase(actionDeactiveUser.rejected, (state) => {
				state.statusDeactiveUser = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			// SET PERMISSIONS FOR USER
			.addCase(actionSetPermissionsForUser.pending, (state) => {
				state.statusSetPermissionsForUser = "loading";
			})
			.addCase(actionSetPermissionsForUser.fulfilled, (state) => {
				state.statusSetPermissionsForUser = "success";
				notification.success({ message: "Cập nhật quyền cho tài khoản thành công" });
			})
			.addCase(actionSetPermissionsForUser.rejected, (state) => {
				state.statusSetPermissionsForUser = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			// ADD USER
			.addCase(actionAddUser.pending, (state) => {
				state.statusAddUser = "loading";
			})
			.addCase(actionAddUser.fulfilled, (state) => {
				state.statusAddUser = "success";
				notification.success({ message: "Thêm user thành công" });
			})
			.addCase(actionAddUser.rejected, (state) => {
				state.statusAddUser = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			});
	},
});

export const { actionResetStatusAddUser, actionResetStatusDeactiveUser, actionResetStatusChangePassword } =
	slice.actions;

export default slice.reducer;
