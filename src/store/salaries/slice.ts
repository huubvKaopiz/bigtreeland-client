import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, SalaryType } from "interface";
import request from "utils/request";

interface SalariesReducerState {
    salary: SalaryType | null;
    salaries: GetResponseType<SalaryType> | null;
    getSalary: "idle" | "loading" | "success" | "error";
    getSalaries: "idle" | "loading" | "success" | "error";
    addSalaryStatus: "idle" | "loading" | "success" | "error";
    updateSalaryStatus: "idle" | "loading" | "success" | "error";
    deleteSalaryStatus: "idle" | "loading" | "success" | "error";
}

export interface AddSalaryData {
    employee_id: 1;
    basic_salary: "";
    revenue_salary: "";
    debt: "";
    bonus: "";
    fines: "";
    period_id: number;
    from_date:string;
    to_date:string;
    note: "";
    status: 0;
    type:number;
}

export const actionGetSalary = createAsyncThunk("actionGetSalary", async (sID: number) => {
    const response = await request({
        url: `/api/salaries/${sID}`,
        method: "get",
    })
    return response.data;
})

export const actionGetSalaries = createAsyncThunk("actionGetSalaries", async (params?: { employee_id?: number }) => {
    const response = await request({
        url: `/api/salaries/`,
        method: "get",
        params
    })
    return response.data;
})

export const actionAddSalary = createAsyncThunk("actionAddSalary", async (data: AddSalaryData) => {
    const response = await request({
        url: `/api/salaries/`,
        method: "post",
        data
    })
    return response.data;
})

export const actionUpdateSalary = createAsyncThunk("actionUpdateSalary", async (params: { sID: number, data:{bonus:string, fines:string, note:string} }) => {
    const { sID, data } = params;
    const response = await request({
        url: `/api/salaries/${sID}`,
        method: "put",
        data
    })
    return response.data;
})

export const actionSalaryPaymentConfirmed = createAsyncThunk("actionSalaryPaymentConfirmed", async (sID:number) => {
    const response = await request({
        url: `/api/salaries/${sID}`,
        method: "put",
        data:{
            status:1
        }
    })
    return response.data;
})

export const actionDeleteSalary = createAsyncThunk("actionDeleteSalary", async (sID: number) => {
    const response = await request({
        url: `/api/salaries/${sID}`,
        method: "delete",
    })
    return response.data;
})


const initialState: SalariesReducerState = {
    salary: null,
    salaries: null,
    getSalary: "idle",
    getSalaries: "idle",
    addSalaryStatus: "idle",
    updateSalaryStatus: "idle",
    deleteSalaryStatus: "idle",
};

export const salariesSlice = createSlice({
    name: "tuitionFeeSlice",
    initialState,
    reducers: {
        actionGetSalary(state) {
            state.getSalary = "idle";
        },
        actionGetSalaries(state) {
            state.getSalaries = "idle";
        },
        actionAddSalary(state) {
            state.addSalaryStatus = "idle";
        },
        actionupdateSalary(state) {
            state.updateSalaryStatus = "idle";
        },
        actionDeleteSalary(state) {
            state.deleteSalaryStatus = "idle";
        },
        actionSetUpdateSalaryStateIdle(state){
            state.updateSalaryStatus = "idle";
        },
        actionSetDeleteSalaryStateIdle(state){
            state.deleteSalaryStatus = "idle";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(actionGetSalary.pending, state => {
            state.getSalary = "loading";
        }).addCase(actionGetSalary.fulfilled, (state, action) => {
            state.getSalary = "success";
            state.salary = action.payload as SalaryType
        }).addCase(actionGetSalary.rejected, state => {
            state.getSalary = "error";
            notification.error({ message: "Lấy thông tin bảng lương bị lỗi!" });
        })

            .addCase(actionGetSalaries.pending, state => {
                state.getSalaries = "loading";
            }).addCase(actionGetSalaries.fulfilled, (state, action) => {
                state.getSalaries = "success";
                state.salaries = action.payload as GetResponseType<SalaryType>
            }).addCase(actionGetSalaries.rejected, state => {
                state.getSalaries = "error";
                notification.error({ message: "Lầy danh sách bảng lương bị lỗi!" });
            })

            .addCase(actionAddSalary.pending, state => {
                state.addSalaryStatus = "loading";
            }).addCase(actionAddSalary.fulfilled, (state) => {
                state.addSalaryStatus = "success";
                // notification.success({ message: "Thêm bảng lương thành công" });
            }).addCase(actionAddSalary.rejected, state => {
                state.addSalaryStatus = "error";
                notification.error({ message: "Thêm bảng lương bị lỗi!" });
            })

            .addCase(actionUpdateSalary.pending, state => {
                state.updateSalaryStatus = "loading";
            }).addCase(actionUpdateSalary.fulfilled, (state) => {
                state.updateSalaryStatus = "success";
                notification.success({ message: "Cập nhật bảng lương thành công" });
            }).addCase(actionUpdateSalary.rejected, state => {
                state.updateSalaryStatus = "error";
                notification.error({ message: "Cập nhật bảng lương bị lỗi!" });
            })

            .addCase(actionSalaryPaymentConfirmed.pending, state => {
                state.updateSalaryStatus = "loading";
            }).addCase(actionSalaryPaymentConfirmed.fulfilled, (state) => {
                state.updateSalaryStatus = "success";
                notification.success({ message: "Cập nhật bảng lương thành công" });
            }).addCase(actionSalaryPaymentConfirmed.rejected, state => {
                state.updateSalaryStatus = "error";
                notification.error({ message: "Cập nhật bảng lương bị lỗi!" });
            })

            .addCase(actionDeleteSalary.pending, state => {
                state.deleteSalaryStatus = "loading";
            }).addCase(actionDeleteSalary.fulfilled, (state) => {
                state.deleteSalaryStatus = "success";
                notification.success({ message: "Xoá bảng lương thành công" });
            }).addCase(actionDeleteSalary.rejected, state => {
                state.deleteSalaryStatus = "error";
                notification.error({ message: "Xoá bảng lương bị lỗi!" });
            })
    }
})

export const { actionSetDeleteSalaryStateIdle, actionSetUpdateSalaryStateIdle } = salariesSlice.actions;

export default salariesSlice.reducer;