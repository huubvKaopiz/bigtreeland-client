import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { ListAttendancesType } from "interface";
import request from "utils/request";

export interface AttendanceReducerState {
    attendances: ListAttendancesType | null;
    getAttendancesStatus: "idle" | "loading" | "success" | "error";
    addAttendanceStatus: "idle" | "loading" | "success" | "error";
    updateAttendanceStatus: "idle" | "loading" | "success" | "error";
}

export interface GetAttendancesPrams {
    class_id: number,
    date?: string
}

export interface AttendanceStudentComment {
    id: string,
    comment: string,
    conduct_point: string
}
export interface AddAttendenceParams {
    class_id: number;
    teacher_id: number;
    students: AttendanceStudentComment[];
    date: string;
}

const initialState: AttendanceReducerState = {
    attendances: null,
    getAttendancesStatus: "idle",
    addAttendanceStatus: "idle",
    updateAttendanceStatus: "idle",
};

export const actionGetAttendances = createAsyncThunk("actionGetAttandances", async (params: GetAttendancesPrams) => {
    const response = await request({
        url: "/api/attendances",
        method: "get",
        params
    })
    return response.data;
})

export const actionAddAttendance = createAsyncThunk("actionAddAttendance", async (data: AddAttendenceParams) => {
    const response = await request({
        url: "/api/attendances",
        method: "post",
        data
    })
    return response.data;
})

export const attendanceSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        actionGetParents(state) {
            state.getAttendancesStatus = "idle";
        },
        actionAddClass(state) {
            state.addAttendanceStatus = "idle";
        },
        actionUpdateClass(state) {
            state.updateAttendanceStatus = "idle";
        },

    },
    extraReducers: (builder) => {
        //get attendances
        builder.addCase(actionGetAttendances.pending, (state) => {
            state.getAttendancesStatus = "loading";
        })
            .addCase(actionGetAttendances.fulfilled, (state, action) => {
                state.attendances = action.payload as ListAttendancesType;
                state.getAttendancesStatus = "success";
            })
            .addCase(actionGetAttendances.rejected, (state) => {
                state.getAttendancesStatus = "error";
                notification.error({ message: "Lấy danh sách bị lỗi" })
            })
            // add attendance
            .addCase(actionAddAttendance.pending, (state) => {
                state.addAttendanceStatus = "loading";
            })
            .addCase(actionAddAttendance.fulfilled, (state) => {
                state.addAttendanceStatus = "success";
                notification.success({ message: "Lưu điểm danh thành công!" })

            })
            .addCase(actionAddAttendance.rejected, (state) => {
                state.addAttendanceStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })
    }
});


export default attendanceSlice.reducer;
