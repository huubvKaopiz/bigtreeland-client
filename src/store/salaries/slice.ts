import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, SalaryType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

interface SalariesReducerState {
	salary: SalaryType | null;
	salaries: GetResponseType<SalaryType> | null;
	getSalary: "idle" | "loading" | "success" | "error";
	getSalaries: "idle" | "loading" | "success" | "error";
	addSalaryStatus: "idle" | "loading" | "success" | "error";
	updateSalaryStatus: "idle" | "loading" | "success" | "error";
	deleteSalaryStatus: "idle" | "loading" | "success" | "error";
}

export interface AddSalaryData {
	employee_id: 1;
	basic_salary: "";
	revenue_salary: "";
	debt: "";
	bonus: "";
	fines: "";
	period_id?: number;
	from_date: string;
	to_date: string;
	note: "";
	status: 0;
	type: number;
}

export const actionGetSalary = createAsyncThunk(
	"actionGetSalary",
	async (sID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/salaries/${sID}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetSalaries = createAsyncThunk(
	"actionGetSalaries",
	async (params: { employee_id?: number }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/salaries/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddSalary = createAsyncThunk(
	"actionAddSalary",
	async (data: AddSalaryData, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/salaries/`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateSalary = createAsyncThunk(
	"actionUpdateSalary",
	async (
		params: {
			sID: number;
			data: { bonus: string; fines: string; note: string };
		},
		{ rejectWithValue }
	) => {
		try {
			const { sID, data } = params;
			const response = await request({
				url: `/api/salaries/${sID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionSalaryPaymentConfirmed = createAsyncThunk(
	"actionSalaryPaymentConfirmed",
	async (sID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/salaries/${sID}`,
				method: "put",
				data: {
					status: 1,
				},
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteSalary = createAsyncThunk(
	"actionDeleteSalary",
	async (sID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/salaries/${sID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: SalariesReducerState = {
	salary: null,
	salaries: null,
	getSalary: "idle",
	getSalaries: "idle",
	addSalaryStatus: "idle",
	updateSalaryStatus: "idle",
	deleteSalaryStatus: "idle",
};

export const salariesSlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionGetSalary(state) {
			state.getSalary = "idle";
		},
		actionGetSalaries(state) {
			state.getSalaries = "idle";
		},
		actionAddSalary(state) {
			state.addSalaryStatus = "idle";
		},
		actionupdateSalary(state) {
			state.updateSalaryStatus = "idle";
		},
		actionDeleteSalary(state) {
			state.deleteSalaryStatus = "idle";
		},
		actionSetUpdateSalaryStateIdle(state) {
			state.updateSalaryStatus = "idle";
		},
		actionSetDeleteSalaryStateIdle(state) {
			state.deleteSalaryStatus = "idle";
		},
		actionSetAddSalaryStateIdle(state) {
			state.addSalaryStatus = 'idle';
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetSalary.pending, (state) => {
				state.getSalary = "loading";
			})
			.addCase(actionGetSalary.fulfilled, (state, action) => {
				state.getSalary = "success";
				state.salary = action.payload as SalaryType;
			})
			.addCase(actionGetSalary.rejected, (state, action) => {
				state.getSalary = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionGetSalaries.pending, (state) => {
				state.getSalaries = "loading";
			})
			.addCase(actionGetSalaries.fulfilled, (state, action) => {
				state.getSalaries = "success";
				state.salaries = action.payload as GetResponseType<SalaryType>;
			})
			.addCase(actionGetSalaries.rejected, (state, action) => {
				state.getSalaries = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionAddSalary.pending, (state) => {
				state.addSalaryStatus = "loading";
			})
			.addCase(actionAddSalary.fulfilled, (state) => {
				state.addSalaryStatus = "success";
				// notification.success({ message: "Thêm bảng lương thành công" });
			})
			.addCase(actionAddSalary.rejected, (state, action) => {
				state.addSalaryStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionUpdateSalary.pending, (state) => {
				state.updateSalaryStatus = "loading";
			})
			.addCase(actionUpdateSalary.fulfilled, (state) => {
				state.updateSalaryStatus = "success";
				notification.success({ message: "Cập nhật bảng lương thành công" });
			})
			.addCase(actionUpdateSalary.rejected, (state, action) => {
				state.updateSalaryStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionSalaryPaymentConfirmed.pending, (state) => {
				state.updateSalaryStatus = "loading";
			})
			.addCase(actionSalaryPaymentConfirmed.fulfilled, (state) => {
				state.updateSalaryStatus = "success";
				notification.success({ message: "Cập nhật bảng lương thành công" });
			})
			.addCase(actionSalaryPaymentConfirmed.rejected, (state, action) => {
				state.updateSalaryStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionDeleteSalary.pending, (state) => {
				state.deleteSalaryStatus = "loading";
			})
			.addCase(actionDeleteSalary.fulfilled, (state) => {
				state.deleteSalaryStatus = "success";
				notification.success({ message: "Xoá bảng lương thành công" });
			})
			.addCase(actionDeleteSalary.rejected, (state, action) => {
				state.deleteSalaryStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			});
	},
});

export const {
	actionSetDeleteSalaryStateIdle,
	actionSetUpdateSalaryStateIdle,
	actionSetAddSalaryStateIdle,
} = salariesSlice.actions;

export default salariesSlice.reducer;
