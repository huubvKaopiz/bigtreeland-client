import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { StudySummaryType, GetResponseType } from "interface";
import request from "utils/request";

interface StudySummaryReducerState {
    studySummaryList: GetResponseType<StudySummaryType> | null;
    getStudySummaryListState: "idle" | "loading" | "success" | "error";
    addStudySummaryState: "idle" | "loading" | "success" | "error";
    updateStudySummaryState: "idle" | "loading" | "success" | "error";
    deleteStudySummaryState: "idle" | "loading" | "success" | "error";
}

interface addStudySummaryParams {
    class_id: number;
    from_date: string;
    to_date: string;
}

export const actionGetStudySummaryList = createAsyncThunk("actionGetStudySummaryList", async (params: { from_date?: string, to_date?: string, class_id?: number }) => {
    const response = await request({
        url: `/api/study-summary-boards/`,
        method: "get",
        params
    })
    return response.data;
})

export const actionAddStudySummary = createAsyncThunk("actionAddStudySummary", async (data: addStudySummaryParams) => {
    const response = await request({
        url: `/api/study-summary-boards/`,
        method: "post",
        data
    })
    return response.data;
})

export const actionUpdateStudySummary = createAsyncThunk("actionUpdateStudySummary", async (data: addStudySummaryParams) => {
    const response = await request({
        url: `/api/study-summary-boards/`,
        method: "put",
        data
    })
    return response.data;
})
export const actionDeleteStudySummary = createAsyncThunk("actionDeleteStudySummary", async (sID: number) => {
    const response = await request({
        url: `/api/study-summary-boards/${sID}`,
        method: "delete",
    })
    return response.data;
})

const initialState: StudySummaryReducerState = {
    studySummaryList: null,
    getStudySummaryListState: "idle",
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
        builder.addCase(actionGetStudySummaryList.pending, state => {
            state.getStudySummaryListState = "loading";
        }).addCase(actionGetStudySummaryList.fulfilled, (state, action) => {
            state.getStudySummaryListState = "success";
            state.studySummaryList = action.payload as GetResponseType<StudySummaryType>;
        }).addCase(actionGetStudySummaryList.rejected, state => {
            state.getStudySummaryListState = "error";
            notification.error({ message: "Lấy danh sách bảng tổng kết bị lỗi!" });
        })

            .addCase(actionAddStudySummary.pending, state => {
                state.addStudySummaryState = "loading";
            }).addCase(actionAddStudySummary.fulfilled, (state) => {
                state.addStudySummaryState = "success";
                notification.success({ message: "Lưu bảng tổng kết thành công" });
            }).addCase(actionAddStudySummary.rejected, state => {
                state.addStudySummaryState = "error";
                notification.error({ message: "Lưu bảng tổng kết bị lỗi!" });
            })

            .addCase(actionDeleteStudySummary.pending, state => {
                state.deleteStudySummaryState = "loading";
            }).addCase(actionDeleteStudySummary.fulfilled, (state) => {
                state.deleteStudySummaryState = "success";
                notification.success({ message: "Xoá bảng tổng kết thành công" });
            }).addCase(actionDeleteStudySummary.rejected, state => {
                state.deleteStudySummaryState = "error";
                notification.error({ message: "Xoá bảng tổng kết bị lỗi!" });
            })
    }
})

export default studySummarySlice.reducer;