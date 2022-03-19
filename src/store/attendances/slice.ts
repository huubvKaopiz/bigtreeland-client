import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { ListAttendancesType } from "interface";
import { get, isPlainObject } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface AttendanceReducerState {
	attendances: ListAttendancesType | null;
	getAttendancesStatus: "idle" | "loading" | "success" | "error";
	addAttendanceStatus: "idle" | "loading" | "success" | "error";
	updateAttendanceStatus: "idle" | "loading" | "success" | "error";
}

export interface GetAttendancesPrams {
	class_id: number;
	date?: string;
	from_date?: string;
	to_date?: string;
}

export interface AttendanceStudentComment {
	id: string | number;
	comment: string;
	conduct_point: string;
	reminder: string;
}
export interface AddAttendenceParams {
	class_id?: number;
	teacher_id?: number;
	students: AttendanceStudentComment[];
	lesson_id?: number;
	date?:string;
}

const initialState: AttendanceReducerState = {
	attendances: null,
	getAttendancesStatus: "idle",
	addAttendanceStatus: "idle",
	updateAttendanceStatus: "idle",
};

export const actionGetAttendances = createAsyncThunk(
	"actionGetAttandances",
	async (params: GetAttendancesPrams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/attendances",
				method: "get",
				params,
			});
			return response.data;
		} catch (err) {
			return rejectWithValue(err);
		}
	}
);

export const actionAddAttendance = createAsyncThunk(
	"actionAddAttendance",
	async (data: AddAttendenceParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/attendances",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateAttendance = createAsyncThunk(
	"actionUpdateAttendance",
	async (data: AddAttendenceParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/attendances/many-updates",
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const attendanceSlice = createSlice({
	name: "parent",
	initialState,
	reducers: {
		actionResetGetAttendancesStatus(state) {
			state.getAttendancesStatus = "idle";
		},
		actionResetAddAttendanceStatus(state) {
			state.addAttendanceStatus = "idle";
		},
		actionResetUpdateAttendanceStatus(state) {
			state.updateAttendanceStatus = "idle";
		},
	},
	extraReducers: (builder) => {
		//get attendances
		builder
			.addCase(actionGetAttendances.pending, (state) => {
				state.getAttendancesStatus = "loading";
			})
			.addCase(actionGetAttendances.fulfilled, (state, action) => {
				state.attendances = action.payload as ListAttendancesType;
				state.getAttendancesStatus = "success";
			})
			.addCase(actionGetAttendances.rejected, (state, action) => {
				state.getAttendancesStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			// add attendance
			.addCase(actionAddAttendance.pending, (state) => {
				state.addAttendanceStatus = "loading";
			})
			.addCase(actionAddAttendance.fulfilled, (state) => {
				state.addAttendanceStatus = "success";
				notification.success({ message: "Lưu điểm danh thành công!" });
			})
			.addCase(actionAddAttendance.rejected, (state, action) => {
				state.addAttendanceStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			// update attendance
			.addCase(actionUpdateAttendance.pending, (state) => {
				state.updateAttendanceStatus = "loading";
			})
			.addCase(actionUpdateAttendance.fulfilled, (state) => {
				state.updateAttendanceStatus = "success";
				notification.success({
					message: "Cập nhật danh sách điểm danh thành công!",
				});
			})
			.addCase(actionUpdateAttendance.rejected, (state, action) => {
				state.updateAttendanceStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			});
	},
});

export const {
	actionResetGetAttendancesStatus,
	actionResetAddAttendanceStatus,
	actionResetUpdateAttendanceStatus,
} = attendanceSlice.actions;
export default attendanceSlice.reducer;
