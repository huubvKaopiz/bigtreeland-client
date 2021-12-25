import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, LessonType } from "interface";
import request from "utils/request";

interface LessionReducerState {
    lessions: GetResponseType<LessonType> | null;
    getLessionsState: "idle" | "loading" | "success" | "error";
}

export const actionGetLessions = createAsyncThunk("actionGetLessions", async (params:{period_tion_id:number}) => {
    const response = await request({
        url: `/api/lessons/`,
        method: "get",
        params
    })
    return response.data;
})

const initialState: LessionReducerState = {
    lessions: null,
    getLessionsState: "idle",
};

export const lessionSlice = createSlice({
    name: "tuitionFeeSlice",
    initialState,
    reducers: {
        actionGetLessions(state) {
            state.getLessionsState = "idle";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(actionGetLessions.pending, state => {
            state.getLessionsState = "loading";
        }).addCase(actionGetLessions.fulfilled, (state, action) => {
            state.getLessionsState = "success";
            state.lessions = action.payload as GetResponseType<LessonType>;
        }).addCase(actionGetLessions.rejected, state => {
            state.getLessionsState = "error";
            notification.error({ message: "Lấy danh sách buổi học bị lỗi!" });
        })
    }
})


export default lessionSlice.reducer;