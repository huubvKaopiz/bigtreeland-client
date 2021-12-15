import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message, notification } from "antd";
import { GetResponseType, TuitionFeeType } from "interface";
import request from "utils/request";

interface TuitionFeeReducerState {
    tuitionFee: TuitionFeeType | null;
    tuitionFees: GetResponseType<TuitionFeeType> | null;
    getTuitionFeeState: "idle" | "loading" | "success" | "error";
    getTuitionFeesState: "idle" | "loading" | "success" | "error";
    addTuitionFeeState: "idle" | "loading" | "success" | "error";
    updateTuitionFeeState: "idle" | "loading" | "success" | "error";
}

interface addTuitionFeeParams {
    priod_id: 1;
    student_id: 1;
    fixed_deduction: "";
    flexible_deduction: "";
    debt: "";
    residual: "";
    note: ""
}

export const actionGetTuitionFee = createAsyncThunk("actionGetTuitionFee", async (tuition_id: number) => {
    const response = await request({
        url: `/api/tuition-fees/${tuition_id}`,
        method: "get",
    })
    return response.data;
})

export const actionGetTuitionFees = createAsyncThunk("actionGetTuitionFees", async (params: { period_id?: number }) => {
    const response = await request({
        url: `/api/tuition-fees/`,
        method: "get",
        params
    })
    return response.data;
})

export const actionAddTuitionFee = createAsyncThunk("actionAddTuitionFee", async (data: addTuitionFeeParams) => {
    const response = await request({
        url: `/api/tuition-fees/`,
        method: "post",
        data
    })
    return response.data;
})

export const actionUpdateTuitionFee = createAsyncThunk("actionUpdateTuitionFee", async (params: { data: addTuitionFeeParams, tuition_id: number }) => {
    const { data, tuition_id } = params;
    const response = await request({
        url: `/api/tuition-fees/${tuition_id}`,
        method: "put",
        data
    })
    return response.data;
})

const initialState: TuitionFeeReducerState = {
    tuitionFee: null,
    tuitionFees: null,
    getTuitionFeeState: "idle",
    getTuitionFeesState: "idle",
    addTuitionFeeState: "idle",
    updateTuitionFeeState: "idle",
};

export const tuitionFeeSlice = createSlice({
    name: "tuitionFeeSlice",
    initialState,
    reducers: {
        actionGetTuitionFee(state) {
            state.getTuitionFeeState = "idle";
        },
        actionGetTuitionFees(state) {
            state.getTuitionFeesState = "idle";
        },
        actionAddTuitionFee(state) {
            state.addTuitionFeeState = "idle";
        },
        actionUpdateTuitionFee(state) {
            state.updateTuitionFeeState = "idle";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(actionGetTuitionFee.pending, state => {
            state.getTuitionFeeState = "loading";
        }).addCase(actionGetTuitionFee.fulfilled, (state, action) => {
            state.getTuitionFeeState = "success";
            state.tuitionFee = action.payload as TuitionFeeType;
        }).addCase(actionGetTuitionFee.rejected, state => {
            state.getTuitionFeeState = "error";
            notification.error({ message: "Lấy thông tin học phí bị lỗi!" });
        })

            .addCase(actionGetTuitionFees.pending, state => {
                state.getTuitionFeesState = "loading";
            }).addCase(actionGetTuitionFees.fulfilled, (state, action) => {
                state.getTuitionFeesState = "success";
                state.tuitionFees = action.payload as GetResponseType<TuitionFeeType>;
            }).addCase(actionGetTuitionFees.rejected, state => {
                state.getTuitionFeesState = "error";
                notification.error({ message: "Lấy danh sách học phí bị lỗi!" });
            })

            .addCase(actionAddTuitionFee.pending, state => {
                state.addTuitionFeeState = "loading";
            }).addCase(actionAddTuitionFee.fulfilled, (state) => {
                state.addTuitionFeeState = "success";
            }).addCase(actionAddTuitionFee.rejected, state => {
                state.addTuitionFeeState = "error";
                notification.error({ message: "Lấy danh sách học phí bị lỗi!" });
            })

            .addCase(actionUpdateTuitionFee.pending, state => {
                state.updateTuitionFeeState = "loading";
            }).addCase(actionUpdateTuitionFee.fulfilled, (state) => {
                state.updateTuitionFeeState = "success";
            }).addCase(actionUpdateTuitionFee.rejected, state => {
                state.updateTuitionFeeState = "error";
                notification.error({ message: "Lấy danh sách học phí bị lỗi!" });
            })
    }
})

export default tuitionFeeSlice.reducer;