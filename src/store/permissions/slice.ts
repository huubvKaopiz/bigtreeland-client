import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, User, UserType } from "interface";
import React from "react";
import request from "../../utils/request";

export interface PermistionType {
	description: null | string | number;
	guard_name: 'string';
	name: string;
	id: number;
	key?: React.Key;
	created_at: string;
	updated_at: string;
}
export interface PermissionsState {
	permissions: PermistionType[]|null;
	userPermissions:UserType|null;
	getPermissionsState: "idle" | "loading" | "success" | "error";
	getUserPermissionsState: "idle" | "loading" | "success" | "error";
	setPermissionsState: "idle" | "loading" | "success" | "error"
}

const initialState: PermissionsState = {
	permissions: [],
	userPermissions:null,
	getUserPermissionsState:"idle",
	setPermissionsState: "idle",
	getPermissionsState:"idle",
};

export const actionGetPermissions = createAsyncThunk("actionGetPermissions", async () => {
	const response = await request({
		url: "/api/permissions",
		method: "get",
	});
	return response.data;
});

export const actionGetUserPermissions = createAsyncThunk("actionGetUserPermissions", async (user_id:number) => {
	const response = await request({
		url: `/api/permissions/list-permission-of-user/${user_id}`,
		method: "get",
	});
	return response.data;
});

export const actionSetRolePermissions = createAsyncThunk("actionSetRolePermissions", async (data: {
	role_id: number,
	permission_add_ids: number[],
	permission_delete_ids: number[]
}) => {
	const response = await request({
		url: "/api/permissions/set-permission-for-role",
		method: "post",
		data
	});
	return response.data;
});

export const actionSetUserPermissions = createAsyncThunk("actionSetUserPermissions", async (data: {
	user_id: number,
	permission_add_ids: number[],
	permission_delete_ids: number[]
}) => {
	const response = await request({
		url: "/api/permissions/set-permission-for-user",
		method: "post",
		data
	});
	return response.data;
});

export const permissionSlice = createSlice({
	name: "permissions",
	initialState,
	reducers:{
		actionGetPermissions(state){
			state.getPermissionsState="idle";
		},
		actionSetRolePermissions(state) {
			state.setPermissionsState = "idle";
		}, 
		actionSetUserPermissions(state) {
			state.setPermissionsState = "idle";
		}, 
		actionGetUserPermissions(state){
			state.getUserPermissionsState = "idle";
		}
	},

	extraReducers: (builder) => {
		builder.addCase(actionGetPermissions.fulfilled, (state, action) => {
			state.getPermissionsState = "success";
			state.permissions = action.payload as PermistionType[];
		})
		.addCase(actionGetPermissions.rejected, (state) => {
			state.getPermissionsState = "error",
			notification.error({message:"Lấy danh sách quyền bị lỗi"})
		})

		.addCase(actionGetUserPermissions.pending, (state) => {
			state.getUserPermissionsState = "loading";
		})
		.addCase(actionGetUserPermissions.fulfilled, (state, action) => {
			state.userPermissions = action.payload as UserType;
			state.getUserPermissionsState = "success";
		})
		.addCase(actionGetUserPermissions.rejected, (state) => {
			state.getUserPermissionsState="error";
			notification.error({message:"Lấy danh sách quyền bị lỗi"})
		})

		.addCase(actionSetRolePermissions.pending, (state) => {
			state.setPermissionsState = "loading";
		})
		.addCase(actionSetRolePermissions.fulfilled, (state) => {
			state.setPermissionsState = "success";
			notification.success({message:"Set quyền thành công!"})
		})
		.addCase(actionSetRolePermissions.rejected, (state) => {
			state.setPermissionsState = "error";
		})

		.addCase(actionSetUserPermissions.pending, (state) => {
			state.setPermissionsState = "loading";
		})
		.addCase(actionSetUserPermissions.fulfilled, (state) => {
			state.setPermissionsState = "success";
			notification.success({message:"Set quyền thành công!"})
		})
		.addCase(actionSetUserPermissions.rejected, (state) => {
			state.setPermissionsState = "error";
		})
	},
});

export default permissionSlice.reducer;
