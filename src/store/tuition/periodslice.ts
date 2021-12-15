import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, PeriodTuitionType } from "interface";
import request from "utils/request";

export interface PeriodTuitionReducerState {
    periodTuitions: GetResponseType<PeriodTuitionType> | null;
    periodTuition: PeriodTuitionType | null;
    getPeriodTuitionStatus: "idle" | "loading" | "success" | "error";
    getPeriodTuitionsStatus: "idle" | "loading" | "success" | "error";
    addPeriodTuitionStatus: "idle" | "loading" | "success" | "error";
    updatePeriodTuitionStatus: "idle" | "loading" | "success" | "error";
}

export interface GetPeriodTuionsPrams {
    class_id?: number;
    page?: number;
}

export interface AddPeriodTuionParms {
    class_id: number;
    from_date: string;
    to_date: string;
    est_session_num: number;
    tuition_fees:{
        student_id:1;
        fixed_deduction:"";
        flexible_deduction:"";
        debt:"";
        residual:"";
        note:""
    }[];
}

const initialState: PeriodTuitionReducerState = {
    periodTuitions: null,
    periodTuition: null,
    getPeriodTuitionStatus: "idle",
    getPeriodTuitionsStatus: "idle",
    addPeriodTuitionStatus:"idle",
    updatePeriodTuitionStatus: "idle",
};

export const actionGetPeriodTuion = createAsyncThunk("actionGetPeriodTuion", async (period_tuion_id: number) => {
    const response = await request({
        url: `/api/period-tuions/${period_tuion_id}`,
        method: "get",
    })
    return response.data;
})

export const actionGetPeriodTuions = createAsyncThunk("actionGetPeriodTuions", async (params: GetPeriodTuionsPrams) => {
    const response = await request({
        url: `/api/period-tuions`,
        method: "get",
        params
    })
    return response.data;
})

export const actionAddPeriodTuion = createAsyncThunk("actionAddPeriodTuion", async (data: AddPeriodTuionParms) => {
    const response = await request({
        url: `/api/period-tuions`,
        method: "post",
        data
    })
    return response.data;
})

export const actionUpdatePeriodTuion = createAsyncThunk("actionUpdatePeriodTuion", async (params: { data: AddPeriodTuionParms, pID: number }) => {
    const response = await request({
        url: `/api/period-tuions/${params.pID}`,
        method: "put",
        data: params.data
    })
    return response.data;
})

export const periodTuitionSlice = createSlice({
    name:"periodTuition",
    initialState,
    reducers:{
        actionGetPeriodTuions(state){
            state.getPeriodTuitionsStatus = "idle";
        },
        actionGetPeriodTuion(state){
            state.getPeriodTuitionStatus = "idle";
        },
        actionAddPeriodTuion(state){
            state.addPeriodTuitionStatus = "idle";
        },
        actionUpdatePeriodTuion(state){
            state.updatePeriodTuitionStatus = "idle";
        }
    },
    extraReducers:(builder) =>{
        builder.addCase(actionGetPeriodTuion.pending, state => {
            state.getPeriodTuitionStatus = "loading";
        })
        .addCase(actionGetPeriodTuion.fulfilled, (state, action) => {
            state.getPeriodTuitionStatus = "success";
            state.periodTuition = action.payload as PeriodTuitionType;
        })
        .addCase(actionGetPeriodTuion.rejected, (state) => {
            state.getPeriodTuitionStatus = "error";
            notification.error({message:"Lấy thông tin chu kỳ học phí thất bại!"});
        })

        .addCase(actionGetPeriodTuions.pending, state => {
            state.getPeriodTuitionsStatus = "loading";
        })
        .addCase(actionGetPeriodTuions.fulfilled, (state, action) => {
            state.getPeriodTuitionsStatus = "success";
            state.periodTuitions = action.payload as GetResponseType<PeriodTuitionType>;
        })
        .addCase(actionGetPeriodTuions.rejected, (state) => {
            state.getPeriodTuitionsStatus = "error";
            notification.error({message:"Lấy DS chu kỳ học phí thất bại!"});
        })

        .addCase(actionAddPeriodTuion.pending, state => {
            state.addPeriodTuitionStatus = "loading";
        })
        .addCase(actionAddPeriodTuion.fulfilled, (state) => {
            state.addPeriodTuitionStatus = "success";
        })
        .addCase(actionAddPeriodTuion.rejected, (state) => {
            state.addPeriodTuitionStatus = "error";
            notification.error({message:"Thêm chu kỳ học phí thất bại!"});
        })

        .addCase(actionUpdatePeriodTuion.pending, state => {
            state.updatePeriodTuitionStatus = "loading";
        })
        .addCase(actionUpdatePeriodTuion.fulfilled, (state) => {
            state.updatePeriodTuitionStatus = "success";
        })
        .addCase(actionUpdatePeriodTuion.rejected, (state) => {
            state.updatePeriodTuitionStatus = "error";
            notification.error({message:"Cập nhật chu kỳ học phí thất bại!"});
        })
    }
})

export default periodTuitionSlice.reducer;