import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { DayoffType, GetResponseType } from "interface";
import { get } from "lodash";
import request from "utils/request";

interface DayoffReducerState {
	dayoffs: GetResponseType<DayoffType> | null;
	getDayoffsState: "idle" | "loading" | "success" | "error";
	addDayoffState: "idle" | "loading" | "success" | "error";
	deleteDayoffState: "idle" | "loading" | "success" | "error";
}

interface addDayoffParams {
	from_date: string;
	to_date: string;
}

export const actionGetDayoffs = createAsyncThunk(
	"actionGetDayoffs",
	async (
		params: { from_date?: string; to_date?: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: `/api/day-offs/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddDayoff = createAsyncThunk(
	"actionAddDayoff",
	async (data: addDayoffParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/day-offs/`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteDayoff = createAsyncThunk(
	"actionDeleteDayoff",
	async (dID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/day-offs/${dID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: DayoffReducerState = {
	dayoffs: null,
	getDayoffsState: "idle",
	addDayoffState: "idle",
	deleteDayoffState: "idle",
};

export const dayoffSlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionResetDayOffs(state) {
			state.dayoffs = null;
		},
		actionGetDayoffs(state) {
			state.getDayoffsState = "idle";
		},
		actionAddDayoff(state) {
			state.addDayoffState = "idle";
		},
		actionDeleteDayoff(state) {
			state.deleteDayoffState = "idle";
		},
		actionSetAddDayoffStateIdle(state) {
			state.addDayoffState = "idle";
		},
		actionSetDeleteDayoffStateIdle(state) {
			state.deleteDayoffState = "idle";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetDayoffs.pending, (state) => {
				state.getDayoffsState = "loading";
			})
			.addCase(actionGetDayoffs.fulfilled, (state, action) => {
				state.getDayoffsState = "success";
				state.dayoffs = action.payload as GetResponseType<DayoffType>;
			})
			.addCase(actionGetDayoffs.rejected, (state, action) => {
				state.getDayoffsState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionAddDayoff.pending, (state) => {
				state.addDayoffState = "loading";
			})
			.addCase(actionAddDayoff.fulfilled, (state) => {
				state.addDayoffState = "success";
				notification.success({ message: "Thêm ngày nghỉ thành công" });
			})
			.addCase(actionAddDayoff.rejected, (state, action) => {
				state.addDayoffState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionDeleteDayoff.pending, (state) => {
				state.deleteDayoffState = "loading";
			})
			.addCase(actionDeleteDayoff.fulfilled, (state) => {
				state.deleteDayoffState = "success";
				notification.success({ message: "Xoá ngày nghỉ thành công" });
			})
			.addCase(actionDeleteDayoff.rejected, (state, action) => {
				state.deleteDayoffState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const {
	actionSetAddDayoffStateIdle,
	actionSetDeleteDayoffStateIdle,
	actionResetDayOffs,
} = dayoffSlice.actions;

export default dayoffSlice.reducer;
