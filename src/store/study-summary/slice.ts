import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { StudySummaryType, GetResponseType } from "interface";
import { StudentGiftType } from "interface";
import { get } from "lodash";
import request from "utils/request";

interface StudySummaryReducerState {
	studySummaryList: GetResponseType<StudySummaryType> | null;
	studentGifts: GetResponseType<StudentGiftType> | null;
	getStudySummaryListState: "idle" | "loading" | "success" | "error";
	getStudyGiftsState: "idle" | "loading" | "success" | "error";
	addStudySummaryState: "idle" | "loading" | "success" | "error";
	updateStudySummaryState: "idle" | "loading" | "success" | "error";
	deleteStudySummaryState: "idle" | "loading" | "success" | "error";
}

interface addStudySummaryParams {
	class_id: number;
	from_date: string;
	to_date: string;
}

export const actionGetStudySummaryList = createAsyncThunk(
	"actionGetStudySummaryList",
	async (
		params: { from_date?: string; to_date?: string; class_id?: number },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: `/api/study-summary-boards/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetStudyGifts = createAsyncThunk(
	"actionGetStudyGifts",
	async (
		params: { study_summary_board_id: number },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: `/api/student-gifts/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddStudySummary = createAsyncThunk(
	"actionAddStudySummary",
	async (data: addStudySummaryParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/study-summary-boards/`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateStudySummary = createAsyncThunk(
	"actionUpdateStudySummary",
	async (data: addStudySummaryParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/study-summary-boards/`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);
export const actionDeleteStudySummary = createAsyncThunk(
	"actionDeleteStudySummary",
	async (sID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/study-summary-boards/${sID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: StudySummaryReducerState = {
	studySummaryList: null,
	studentGifts: null,
	getStudySummaryListState: "idle",
	getStudyGiftsState: "idle",
	addStudySummaryState: "idle",
	updateStudySummaryState: "idle",
	deleteStudySummaryState: "idle",
};

export const studySummarySlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionGetStudySummaryList(state) {
			state.getStudySummaryListState = "idle";
		},
		actionAddStudySummary(state) {
			state.addStudySummaryState = "idle";
		},
		actionUpdateStudySummary(state) {
			state.updateStudySummaryState = "idle";
		},
		actionDeleteStudySummary(state) {
			state.deleteStudySummaryState = "idle";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetStudySummaryList.pending, (state) => {
				state.getStudySummaryListState = "loading";
			})
			.addCase(actionGetStudySummaryList.fulfilled, (state, action) => {
				state.getStudySummaryListState = "success";
				state.studySummaryList =
					action.payload as GetResponseType<StudySummaryType>;
			})
			.addCase(actionGetStudySummaryList.rejected, (state, action) => {
				state.getStudySummaryListState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionGetStudyGifts.pending, (state) => {
				state.getStudyGiftsState = "loading";
			})
			.addCase(actionGetStudyGifts.fulfilled, (state, action) => {
				state.getStudyGiftsState = "success";
				state.studentGifts =
					action.payload as GetResponseType<StudentGiftType>;
			})
			.addCase(actionGetStudyGifts.rejected, (state, action) => {
				state.getStudyGiftsState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionAddStudySummary.pending, (state) => {
				state.addStudySummaryState = "loading";
			})
			.addCase(actionAddStudySummary.fulfilled, (state) => {
				state.addStudySummaryState = "success";
				notification.success({ message: "Lưu bảng tổng kết thành công" });
			})
			.addCase(actionAddStudySummary.rejected, (state, action) => {
				state.addStudySummaryState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionDeleteStudySummary.pending, (state) => {
				state.deleteStudySummaryState = "loading";
			})
			.addCase(actionDeleteStudySummary.fulfilled, (state) => {
				state.deleteStudySummaryState = "success";
				notification.success({ message: "Xoá bảng tổng kết thành công" });
			})
			.addCase(actionDeleteStudySummary.rejected, (state, action) => {
				state.deleteStudySummaryState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export default studySummarySlice.reducer;
