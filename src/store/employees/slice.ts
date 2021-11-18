import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { ListEmployeeType } from "interface";
import request from "../../utils/request";

export interface UserReducerState {
	employees: ListEmployeeType | null;
	getEmployeesStatus:"idle" | "loading" | "success" | "error";
	addEmployeeStatus:"idle" | "loading" | "success" | "error";
	updateEmployeeStatus:"idle" | "loading" | "success" | "error";
	deleteEmployeeStatus:"idle" | "loading" | "success" | "error";
}

export interface ParamGetUsers {
	search?: string;
	page?:number;
	class_id?:number;
}

export interface EmployeeParams {
	name:string;
	email:string;
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
	getEmployeesStatus:"idle",
	addEmployeeStatus:"idle",
	updateEmployeeStatus:"idle",
	deleteEmployeeStatus:"idle",
};

export const actionGetEmployees = createAsyncThunk("actionGetEmployees", async (params: ParamGetUsers) => {
	const response = await request({
		url: "/api/employees",
		method: "get",
		params,
	});
	return response.data;
});

export const actionAddEmployee = createAsyncThunk("actionAddEmployee", async(data:EmployeeParams) => {
	const response = await request({
		url:"/api/employees",
		method:"post",
		data,
	})
	console.log(response)
	return response.data;
});

export const actionUpdateEmployee = createAsyncThunk("actionUpdateEmployee", async ( params:{data:EmployeeParams, eID:number}) => {
	const {data, eID} = params;
	const response = await request({
		url:`/api/employees/${eID}`,
		method:"put",
		data,
	})
	return response.data;
});


export const actionDeleteEmployee = createAsyncThunk("actionDeleteEmployee", async (eID:number) => {
	const response = await request({
		url:`/api/employees/${eID}`,
		method:"delete",
	})
	return response.data;
});

export const employeeSlice = createSlice({
	name: "employee",
	initialState,
	reducers: {
		actionGetEmployees(state){
			state.getEmployeesStatus="idle";
		},
		actionAddEmployee(state){
			state.addEmployeeStatus="idle";
		},
		actionUpdateEmployee(state){
			state.updateEmployeeStatus="idle";
		}
	},

	extraReducers: (builder) => {
		builder.addCase(actionGetEmployees.pending, (state) => {
			state.getEmployeesStatus="loading";
		})
		.addCase(actionGetEmployees.fulfilled, (state, action) => {
			state.employees = action.payload as ListEmployeeType;
			state.getEmployeesStatus="success"
		})
		.addCase(actionGetEmployees.rejected, (state) => {
			state.getEmployeesStatus="error";
			state.employees=null;
		})
		//add employee
		.addCase(actionAddEmployee.pending, (state) => {
			state.addEmployeeStatus="loading";
		})
		.addCase(actionAddEmployee.fulfilled, (state, action) => {
			state.addEmployeeStatus="success"
			notification.success({ message: "Thêm nhân viên thành công" });
		})
		.addCase(actionAddEmployee.rejected, (state) => {
			state.addEmployeeStatus="error";
			notification.error({message:"Có lỗi xảy ra"});
			
		})

		//update employee
		.addCase(actionUpdateEmployee.pending, (state) => {
			state.updateEmployeeStatus="loading";
			
		})
		.addCase(actionUpdateEmployee.fulfilled, (state, action) => {
			state.updateEmployeeStatus="success";
			notification.success({ message: "Cập nhật thông tin nhân viên thành công" });
		})
		.addCase(actionUpdateEmployee.rejected, (state) => {
			state.updateEmployeeStatus="error";
			notification.error({message:"Có lỗi xảy ra"});
		
		})

		//delete employee
		.addCase(actionDeleteEmployee.pending, (state) => {
			state.deleteEmployeeStatus="loading";
			
		})
		.addCase(actionDeleteEmployee.fulfilled, (state, action) => {
			state.deleteEmployeeStatus="success";
			notification.success({ message: "Xoá nhân viên thành công" });
		})
		.addCase(actionDeleteEmployee.rejected, (state) => {
			state.deleteEmployeeStatus="error";
			notification.error({message:"Có lỗi xảy ra"});
		
		})
		
	},
});

export default employeeSlice.reducer;
