import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import {GetResponseType, ListTestType, TestType } from "interface";
import request from "utils/request";

export interface TestReducerState {
    testes: GetResponseType<TestType> | null;
    testInfo: TestType | null;
    getTestStatus: "idle" | "loading" | "success" | "error";
    getTestesStatus: "idle" | "loading" | "success" | "error";
    updateTestStatus: "idle" | "loading" | "success" | "error";
    addTestStatus: "idle" | "loading" | "success" | "error";

}

export interface GetTestsPrams {
    class_id?: number;
    page?: number;
}

export interface AddTestParms {
    class_id:number;
    title:string;
    date:string;
    content_file:number;
}


const initialState: TestReducerState = {
    testInfo: null,
    testes:null,
    getTestStatus: "idle",
    getTestesStatus: "idle",
    updateTestStatus: "idle",
    addTestStatus:"idle",
};

export const actionGetTest = createAsyncThunk("actionGetTest", async (test_id: number) => {
    const response = await request({
        url: `/api/tests/${test_id}`,
        method: "get",
    })
    return response.data;
})


export const actionGetTestes = createAsyncThunk("actionGetTestes", async (params: GetTestsPrams = {}) => {
    const response = await request({
        url: "/api/tests",
        method: "get",
        params
    })
    return response.data;
})

export const actionAddTest = createAsyncThunk("actionAddTest", async (data:AddTestParms) => {
    console.log(data)
    const response = await request({
        url: `/api/tests`,
        method: "post",
        data
    })
    return response.data;
})

export const testSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        actionGetTest(state) {
            state.getTestStatus = "idle";
        },
        actionGetTestes(state) {
            state.getTestesStatus = "idle";
        },
        actionAddTest(state) {
            state.addTestStatus = "idle";
        },
        actionResetAddTestStatus(state) {
            state.addTestStatus = "idle";
        }

    },
    extraReducers: (builder) => {
        //get parents
        builder.addCase(actionGetTest.pending, (state) => {
            state.getTestStatus = "loading";
        })
            .addCase(actionGetTest.fulfilled, (state, action) => {
                state.testInfo = action.payload as TestType;
                state.getTestStatus = "success";
            })
            .addCase(actionGetTest.rejected, (state) => {
                state.getTestStatus = "error";
                notification.error({ message: "Lấy thông tin bài test bị lỗi" })
            })
            //get class infomation
            .addCase(actionGetTestes.pending, (state) => {
                state.getTestesStatus = "loading";
            })
            .addCase(actionGetTestes.fulfilled, (state, action) => {
                state.testes = action.payload as GetResponseType<TestType>;
                state.getTestesStatus = "success";
            })
            .addCase(actionGetTestes.rejected, (state) => {
                state.getTestesStatus = "error";
                notification.error({ message: "Lấy danh sách lớp học bị lỗi" })
            })

             // add test
             .addCase(actionAddTest.pending, (state) => {
                state.addTestStatus = "loading";
            })
            .addCase(actionAddTest.fulfilled, (state) => {
                state.addTestStatus = "success";
                notification.success({ message: "Tạo bài test thành công!" })

            })
            .addCase(actionAddTest.rejected, (state) => {
                state.addTestStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

    }
})

export const {actionResetAddTestStatus} = testSlice.actions;

export default testSlice.reducer;
