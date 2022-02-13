import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { EmployeeType, GetResponseType } from "interface";
import { get } from "lodash";
import request from "../../utils/request";

export interface UserReducerState {
	employeeInfo: EmployeeType | null;
	employees: GetResponseType<EmployeeType> | null;
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
	role_ids?: string;
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
	getEmployeeInfoStatus: "idle",
	getEmployeesStatus: "idle",
	addEmployeeStatus: "idle",
	updateEmployeeStatus: "idle",
	deleteEmployeeStatus: "idle",
};

export const actionGetEmployeeInfo = createAsyncThunk(
	"actionGetEmployeeInfo",
	async (eID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users/${eID}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetEmployees = createAsyncThunk(
	"actionGetEmployees",
	async (params: ParamGetUsers, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/users",
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddEmployee = createAsyncThunk(
	"actionAddEmployee",
	async (data: EmployeeParams, { rejectWithValue }) => {
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

export const actionUpdateEmployee = createAsyncThunk(
	"actionUpdateEmployee",
	async (
		params: { data: EmployeeParams; eID: number },
		{ rejectWithValue }
	) => {
		try {
			const { data, eID } = params;
			const response = await request({
				url: `/api/users/${eID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteEmployee = createAsyncThunk(
	"actionDeleteEmployee",
	async (eID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users/${eID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

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
		actionSetListEmployeesNull(state) {
			state.getEmployeesStatus = "idle";
			state.employees = null;
		},
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
			.addCase(actionGetEmployeeInfo.rejected, (state, action) => {
				state.getEmployeeInfoStatus = "error";
				state.employeeInfo = null;
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			})
			//get employees
			.addCase(actionGetEmployees.pending, (state) => {
				state.getEmployeesStatus = "loading";
			})
			.addCase(actionGetEmployees.fulfilled, (state, action) => {
				state.employees = action.payload as GetResponseType<EmployeeType>;
				state.getEmployeesStatus = "success";
			})
			.addCase(actionGetEmployees.rejected, (state, action) => {
				state.getEmployeesStatus = "error";
				state.employees = null;
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			})
			//add employee
			.addCase(actionAddEmployee.pending, (state) => {
				state.addEmployeeStatus = "loading";
			})
			.addCase(actionAddEmployee.fulfilled, (state) => {
				state.addEmployeeStatus = "success";
				notification.success({ message: "Thêm nhân viên thành công" });
			})
			.addCase(actionAddEmployee.rejected, (state, action) => {
				state.addEmployeeStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			})

			//update employee
			.addCase(actionUpdateEmployee.pending, (state) => {
				state.updateEmployeeStatus = "loading";
			})
			.addCase(actionUpdateEmployee.fulfilled, (state) => {
				state.updateEmployeeStatus = "success";
				notification.success({
					message: "Cập nhật thông tin nhân viên thành công",
				});
			})
			.addCase(actionUpdateEmployee.rejected, (state, action) => {
				state.updateEmployeeStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			})

			//delete employee
			.addCase(actionDeleteEmployee.pending, (state) => {
				state.deleteEmployeeStatus = "loading";
			})
			.addCase(actionDeleteEmployee.fulfilled, (state) => {
				state.deleteEmployeeStatus = "success";
				notification.success({
					message: "Vô hiệu hoá tài khoản viên thành công",
				});
			})
			.addCase(actionDeleteEmployee.rejected, (state, action) => {
				state.deleteEmployeeStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			});
	},
});
export const {
	actionResetAddEmployeeStatus,
	actionResetDeeleteEmployeeSatus,
	actionResetUpdateEmployeeSatus,
	actionSetListEmployeesNull,
} = employeeSlice.actions;

export default employeeSlice.reducer;
