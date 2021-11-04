import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ListUserType } from "interface";
import request from "../../utils/request";

export interface PermissionsState {
	permissions: ListUserType | null;
}

const initialState: PermissionsState = {
	permissions: null,
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
			state.permissions = action.payload as ListUserType;
		});
	},
});

export default slice.reducer;
