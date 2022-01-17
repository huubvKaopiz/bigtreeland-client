import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, LessonType } from "interface";
import request from "utils/request";

interface LessionReducerState {
	lessons: GetResponseType<LessonType> | null;
	getLessonsState: "idle" | "loading" | "success" | "error";
}

interface GetLessonsParmasType {
    period_tion_id?:number,
    employee_id?:number, 
    class_id?:number,
    from_date?:string, 
    to_date?:string
}

export const actionGetLessons = createAsyncThunk("actionGetLessions", async (params:GetLessonsParmasType) => {
    const response = await request({
        url: `/api/lessons/`,
        method: "get",
        params
    })
    return response.data;
})

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
			.addCase(actionGetLessons.rejected, (state) => {
				state.getLessonsState = "error";
				notification.error({ message: "Lấy danh sách buổi học bị lỗi!" });
			});
	},
});

export const { actionSetLessionsStateNull } = lessonSlice.actions;

export default lessonSlice.reducer;
