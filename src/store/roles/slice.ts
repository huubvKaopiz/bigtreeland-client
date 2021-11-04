import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ListUserType } from "interface";
import request from "../../utils/request";

export interface RoleState {
	roles: ListUserType | null;
}

const initialState: RoleState = {
	roles: null,
};

export const actionGetRoles = createAsyncThunk("actionGetRoles", async () => {
	const response = await request({
		url: "/api/roles",
		method: "get",
	});
	return response.data;
});

export const slice = createSlice({
	name: "roles",
	initialState,
	reducers: {},

	extraReducers: (builder) => {
		builder.addCase(actionGetRoles.fulfilled, (state, action) => {
			state.roles = action.payload as ListUserType;
		});
	},
});

export default slice.reducer;
