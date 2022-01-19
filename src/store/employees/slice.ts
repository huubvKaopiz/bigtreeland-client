import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { EmployeeType, ListEmployeeType } from "interface";
import request from "../../utils/request";

export interface UserReducerState {
	employeeInfo: EmployeeType | null;
	employees: ListEmployeeType | null;
	getEmployeeInfoStatus: "idle" | "loading" | "success" | "error";
	getEmployeesStatus: "idle" | "loading" | "success" | "error";
	addEmployeeStatus: "idle" | "loading" | "success" | "error";
	updateEmployeeStatus: "idle" | "loading" | "success" | "error";
	deleteEmployeeStatus: "idle" | "loading" | "success" | "error";
}

export interface ParamGetUsers {
	search?: string;
	per_page?: number;
	class_id?: number;
	role_name?: string;
	role_ids?:string;
}

export interface EmployeeParams {
	name: string;
	email: string;
	phone: string;
	gender: number;
	birthday: string;
	address: string;
	interests: string;
	disklikes: string;
	identifier: number;
	basic_salary: string;
	sales_salary: string;
	working_day: string;
	position: string;
}

const initialState: UserReducerState = {
	employeeInfo: null,
	employees: null,
	getEmployeeInfoStatus:'idle',
	getEmployeesStatus: "idle",
	addEmployeeStatus: "idle",
	updateEmployeeStatus: "idle",
	deleteEmployeeStatus: "idle",
};

export const actionGetEmployeeInfo = createAsyncThunk("actionGetEmployeeInfo", async (eID: number) => {
	const response = await request({
		url: `/api/users/${eID}`,
		method: "get",
	});
	return response.data;
});

export const actionGetEmployees = createAsyncThunk("actionGetEmployees", async (params?: ParamGetUsers) => {
	const response = await request({
		url: "/api/users",
		method: "get",
		params,
	});
	return response.data;
});

export const actionAddEmployee = createAsyncThunk("actionAddEmployee", async (data: EmployeeParams) => {
	const response = await request({
		url: "/api/users",
		method: "post",
		data,
	});
	return response.data;
});

export const actionUpdateEmployee = createAsyncThunk(
	"actionUpdateEmployee",
	async (params: { data: EmployeeParams; eID: number }) => {
		const { data, eID } = params;
		const response = await request({
			url: `/api/users/${eID}`,
			method: "put",
			data,
		});
		return response.data;
	}
);

export const actionDeleteEmployee = createAsyncThunk("actionDeleteEmployee", async (eID: number) => {
	const response = await request({
		url: `/api/users/${eID}`,
		method: "delete",
	});
	return response.data;
});

export const employeeSlice = createSlice({
	name: "employee",
	initialState,
	reducers: {
		actionGetEmployees(state) {
			state.getEmployeesStatus = "idle";
		},
		actionAddEmployee(state) {
			state.addEmployeeStatus = "idle";
		},
		actionUpdateEmployee(state) {
			state.updateEmployeeStatus = "idle";
		},
		actionResetAddEmployeeStatus(state) {
			state.addEmployeeStatus = "idle";
		},
		actionResetUpdateEmployeeSatus(state) {
			state.updateEmployeeStatus = "idle";
		},
		actionResetDeeleteEmployeeSatus(state) {
			state.deleteEmployeeStatus = "idle";
		},
		actionSetListEmployeesNull(state){
			state.getEmployeesStatus = "idle";
			state.employees = null;
		}
	},

	extraReducers: (builder) => {
		builder
			.addCase(actionGetEmployeeInfo.pending, (state) => {
				state.getEmployeeInfoStatus = "loading";
			})
			.addCase(actionGetEmployeeInfo.fulfilled, (state, action) => {
				state.employeeInfo = action.payload as EmployeeType;
				state.getEmployeeInfoStatus = "success";
			})
			.addCase(actionGetEmployeeInfo.rejected, (state) => {
				state.getEmployeeInfoStatus = "error";
				state.employeeInfo = null;
			})
			//get employees
			.addCase(actionGetEmployees.pending, (state) => {
				state.getEmployeesStatus = "loading";
			})
			.addCase(actionGetEmployees.fulfilled, (state, action) => {
				state.employees = action.payload as ListEmployeeType;
				state.getEmployeesStatus = "success";
			})
			.addCase(actionGetEmployees.rejected, (state) => {
				state.getEmployeesStatus = "error";
				state.employees = null;
			})
			//add employee
			.addCase(actionAddEmployee.pending, (state) => {
				state.addEmployeeStatus = "loading";
			})
			.addCase(actionAddEmployee.fulfilled, (state) => {
				state.addEmployeeStatus = "success";
				notification.success({ message: "Thêm nhân viên thành công" });
			})
			.addCase(actionAddEmployee.rejected, (state) => {
				state.addEmployeeStatus = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			//update employee
			.addCase(actionUpdateEmployee.pending, (state) => {
				state.updateEmployeeStatus = "loading";
			})
			.addCase(actionUpdateEmployee.fulfilled, (state) => {
				state.updateEmployeeStatus = "success";
				notification.success({ message: "Cập nhật thông tin nhân viên thành công" });
			})
			.addCase(actionUpdateEmployee.rejected, (state) => {
				state.updateEmployeeStatus = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			//delete employee
			.addCase(actionDeleteEmployee.pending, (state) => {
				state.deleteEmployeeStatus = "loading";
			})
			.addCase(actionDeleteEmployee.fulfilled, (state) => {
				state.deleteEmployeeStatus = "success";
				notification.success({ message: "Xoá nhân viên thành công" });
			})
			.addCase(actionDeleteEmployee.rejected, (state) => {
				state.deleteEmployeeStatus = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			});
	},
});
export const { actionResetAddEmployeeStatus, actionResetDeeleteEmployeeSatus, actionResetUpdateEmployeeSatus, actionSetListEmployeesNull } =
	employeeSlice.actions;

export default employeeSlice.reducer;
