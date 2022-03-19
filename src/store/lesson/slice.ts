import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, LessonType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

interface LessionReducerState {
	lessonInfo: LessonType | null;
	lessons: GetResponseType<LessonType> | null;
	getLessonsState: "idle" | "loading" | "success" | "error";
	getLessonInfoSate: "idle" | "loading" | "success" | "error";
}

interface GetLessonsParmasType {
	period_tion_id?: number;
	employee_id?: number;
	class_id?: number;
	from_date?: string;
	to_date?: string;
}

export const actionGetLessonInfo = createAsyncThunk(
	"actionGetLessonInfo",
	async (lessonId: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/lessons/${lessonId}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

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
	lessonInfo: null,
	lessons: null,
	getLessonsState: "idle",
	getLessonInfoSate: "idle"
};

export const lessonSlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionGetLessonInfo(state) {
			state.getLessonInfoSate = "idle" ;
		},
		actionResetGetLessionsStatus(state) {
			state.getLessonsState = "idle";
		},
		actionSetLessionsStateNull(state) {
			state.lessons = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetLessonInfo.pending, (state) => {
				state.getLessonInfoSate = "loading";
			})
			.addCase(actionGetLessonInfo.fulfilled, (state, action) => {
				state.getLessonInfoSate = "success";
				state.lessonInfo = action.payload as LessonType;
			})
			.addCase(actionGetLessonInfo.rejected, (state, action) => {
				state.getLessonInfoSate = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
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
				handleResponseError(error);
			});
	},
});

export const { actionSetLessionsStateNull } = lessonSlice.actions;

export default lessonSlice.reducer;
