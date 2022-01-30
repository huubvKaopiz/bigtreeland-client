import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, LessonType } from "interface";
import { get } from "lodash";
import request from "utils/request";

interface LessionReducerState {
	lessons: GetResponseType<LessonType> | null;
	getLessonsState: "idle" | "loading" | "success" | "error";
}

interface GetLessonsParmasType {
	period_tion_id?: number;
	employee_id?: number;
	class_id?: number;
	from_date?: string;
	to_date?: string;
}

export const actionGetLessons = createAsyncThunk(
	"actionGetLessions",
	async (params: GetLessonsParmasType, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/lessons/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: LessionReducerState = {
	lessons: null,
	getLessonsState: "idle",
};

export const lessonSlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionResetGetLessionsStatus(state) {
			state.getLessonsState = "idle";
		},
		actionSetLessionsStateNull(state) {
			state.lessons = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetLessons.pending, (state) => {
				state.getLessonsState = "loading";
			})
			.addCase(actionGetLessons.fulfilled, (state, action) => {
				state.getLessonsState = "success";
				state.lessons = action.payload as GetResponseType<LessonType>;
			})
			.addCase(actionGetLessons.rejected, (state, action) => {
				state.getLessonsState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const { actionSetLessionsStateNull } = lessonSlice.actions;

export default lessonSlice.reducer;
