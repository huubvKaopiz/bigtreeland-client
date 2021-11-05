import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ListEmployeeType } from "interface";
import request from "../../utils/request";

export interface UserReducerState {
	employees: ListEmployeeType | null;
}

export interface ParamGetUsers {
	search?: string;
}

export interface EmployeeParams {
	name:string;
	emaul:string;
	password:'password';
	phone:string;
	gender:number;
	birthday:string;
	address:string;
	interests:string;
	disklikes:string;
	identifier:number;
	basic_salary:string;
	sales_salary:string;
	working_day:string;
	position:string;
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

export const actionAddEmployee = createAsyncThunk("addEmployee", async(data:EmployeeParams) => {
	const response = await request({
		url:"/api/employees",
		method:"post",
		data,
	})
	console.log(response)
	return response.data;
});

export const actionUpdateEmployee = createAsyncThunk("updateEmployee", async ( data:EmployeeParams, eID:any) => {
	const response = await request({
		url:`/api/employees/${eID}`,
		method:"put",
		data,
	})
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
