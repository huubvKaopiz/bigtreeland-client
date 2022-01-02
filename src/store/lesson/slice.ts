import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, LessonType } from "interface";
import request from "utils/request";

interface LessionReducerState {
    lessons: GetResponseType<LessonType> | null;
    getLessonsState: "idle" | "loading" | "success" | "error";
}

export const actionGetLessons = createAsyncThunk("actionGetLessions", async (params:{period_tion_id?:number,employee_id?:number, from_date?:string, to_date?:string}) => {
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
        actionGetLessions(state) {
            state.getLessonsState = "idle";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(actionGetLessons.pending, state => {
            state.getLessonsState = "loading";
        }).addCase(actionGetLessons.fulfilled, (state, action) => {
            state.getLessonsState = "success";
            state.lessons = action.payload as GetResponseType<LessonType>;
        }).addCase(actionGetLessons.rejected, state => {
            state.getLessonsState = "error";
            notification.error({ message: "Lấy danh sách buổi học bị lỗi!" });
        })
    }
})


export default lessonSlice.reducer;