import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import notification from "antd/lib/notification";
import { AxiosError } from "axios";
import { BirthdayListType, ClassType, StudentStatType } from "interface";
import { get } from "lodash";
import request from "utils/request";

export interface StatisticalState {
	revenueStat: { receipts: number, payment_slips: number } | null;
	getRevenueStatStatus: "idle" | "loading" | "success" | "error";
	studentStat: StudentStatType | null;
	getStudentStatStatus: "idle" | "loading" | "success" | "error";
	classesToday: ClassType[] | [];
	getClassesTodayStatus: "idle" | "loading" | "success" | "error";
	birthdayList: BirthdayListType | null;
	getBirthdayListStatus: "idle" | "loading" | "success" | "error";

}

const initialState: StatisticalState = {
	revenueStat: null,
	studentStat: null,
	classesToday: [],
	birthdayList: null,
	getRevenueStatStatus: "idle",
	getStudentStatStatus: 'idle',
	getClassesTodayStatus: 'idle',
	getBirthdayListStatus: 'idle'
};


export const actionGetRevenueStat = createAsyncThunk(
	"actionGetRevenueStat",
	async (params: { from_date?: string, to_date?: string }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/statistical/revenue",
				method: "get",
				params
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetStudentStat = createAsyncThunk(
	"actionGetStudentStat",
	async (params: { from_date?: string, to_date?: string }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/statistical/students",
				method: "get",
				params
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetClassesToday = createAsyncThunk(
	"actionGetClassesToday",
	async (params: { from_date?: string, to_date?: string }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/statistical/class",
				method: "get",
				params
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetBirthdayList = createAsyncThunk(
	"actionGetBirthdayList",
	async (params: { from_date?: string, to_date?: string }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/statistical/birthday",
				method: "get",
				params
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const statisticalSlice = createSlice({
	name: "revenues",
	initialState,
	reducers: {
		actionGetRevenueStat(state) {
			state.getRevenueStatStatus = "idle";
		},
		actionGetStudentStat(state) {
			state.getStudentStatStatus = 'idle';
		},
		actionGetClassesToday(state) {
			state.getClassesTodayStatus = 'idle';
		},
		actionGetBirthdayList(state) {
			state.getBirthdayListStatus = 'idle';
		}

	},

	extraReducers: (builder) => {
		builder
			// get
			.addCase(actionGetRevenueStat.fulfilled, (state, action) => {
				state.getRevenueStatStatus = "success";
				state.revenueStat = action.payload as { receipts: number, payment_slips: number };
			})
			.addCase(actionGetRevenueStat.pending, (state) => {
				state.getRevenueStatStatus = "loading";
			})
			.addCase(actionGetRevenueStat.rejected, (state, action) => {
				state.getRevenueStatStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// get
			.addCase(actionGetStudentStat.fulfilled, (state, action) => {
				state.getStudentStatStatus = "success";
				state.studentStat = action.payload as StudentStatType;
			})
			.addCase(actionGetStudentStat.pending, (state) => {
				state.getStudentStatStatus = "loading";
			})
			.addCase(actionGetStudentStat.rejected, (state, action) => {
				state.getStudentStatStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// get
			.addCase(actionGetClassesToday.fulfilled, (state, action) => {
				state.getClassesTodayStatus = "success";
				state.classesToday = action.payload as ClassType[];
			})
			.addCase(actionGetClassesToday.pending, (state) => {
				state.getClassesTodayStatus = "loading";
			})
			.addCase(actionGetClassesToday.rejected, (state, action) => {
				state.getClassesTodayStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// get
			.addCase(actionGetBirthdayList.fulfilled, (state, action) => {
				state.getBirthdayListStatus = "success";
				state.birthdayList = action.payload as BirthdayListType;
			})
			.addCase(actionGetBirthdayList.pending, (state) => {
				state.getBirthdayListStatus = "loading";
			})
			.addCase(actionGetBirthdayList.rejected, (state, action) => {
				state.getBirthdayListStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	}
});

export default statisticalSlice.reducer;