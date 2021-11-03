import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListEmployeeType } from "interface";
import request from "../../utils/request";

export interface UserReducerState {
	employees: ListEmployeeType | null;
}

export interface ParamGetUsers {
	search?: string;
}

const initialState: UserReducerState = {
	employees: null,
};

export const actionGetEmployees = createAsyncThunk("getEmployees", async (params: ParamGetUsers) => {
	const response = await request({
		url: "/api/employees",
		method: "get",
		params,
	});
	return response.data;
});

export const employeeSlice = createSlice({
	name: "employee",
	initialState,
	reducers: {},

	extraReducers: (builder) => {
		builder.addCase(actionGetEmployees.fulfilled, (state, action) => {
			state.employees = action.payload as ListEmployeeType;
		});
	},
});

export default employeeSlice.reducer;
