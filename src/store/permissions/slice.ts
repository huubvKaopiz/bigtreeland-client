import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
	permissions: PermistionType[];
}

const initialState: PermissionsState = {
	permissions: [],
};

export const actionGetPermissions = createAsyncThunk("actionGetPermissions", async () => {
	const response = await request({
		url: "/api/permissions",
		method: "get",
	});
	return response.data;
});

export const slice = createSlice({
	name: "permissions",
	initialState,
	reducers: {},

	extraReducers: (builder) => {
		builder.addCase(actionGetPermissions.fulfilled, (state, action) => {
			state.permissions = action.payload as PermistionType[];
		});
	},
});

export default slice.reducer;
