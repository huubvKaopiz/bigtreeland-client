import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { ListParentType } from "interface";
import request from "utils/request";

export interface ParentReducerState {
    parents: ListParentType | null;
    getParentsStatus: "idle" | "loading" | "success" | "error";
    addParentStatus: "idle" | "loading" | "success" | "error";
    updateParentStatus: "idle" | "loading" | "success" | "error";
    updateParentStatusStatus: "idle" | "loading" | "success" | "error";
}

export interface GetParentsPrams {
    search?: string;
    page?: number;
}

export interface ParentParams {
    name: string;
    email: string;
    password: string;
}


const initialState: ParentReducerState = {
    parents: null,
    getParentsStatus: "idle",
    addParentStatus: "idle",
    updateParentStatus: "idle",
    updateParentStatusStatus: "idle",
};


export const actionGetParents = createAsyncThunk("actionGetParents", async (params: GetParentsPrams) => {
    const response = await request({
        url: "/api/parents",
        method: "get",
        params
    })
    return response.data;
})


export const actionAddParent = createAsyncThunk("actionAddParent", async (data: ParentParams) => {
    const response = await request({
        url: "/api/parents",
        method: "post",
        data
    })
    return response.data;
})


export const actionUpdateParent = createAsyncThunk("actionUdpateParent", async (params: { data: GetParentsPrams, pID: number }) => {
    const { data, pID } = params;
    const response = await request({
        url: `/api/parents/${pID}`,
        method: "put",
        data
    })
    return response.data;
})

export const parentSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        actionGetParents(state) {
            state.getParentsStatus = "idle";
        },
        actionAddParent(state) {
            state.addParentStatus = "idle";
        },
        actionUpdateParent(state) {
            state.updateParentStatus = "idle";
        },

    },
    extraReducers: (builder) => {
        //get parents
        builder.addCase(actionGetParents.pending, (state) => {
            state.getParentsStatus = "loading";
        })
            .addCase(actionGetParents.fulfilled, (state, action) => {
                state.parents = action.payload as ListParentType;
                state.getParentsStatus = "success";
            })
            .addCase(actionGetParents.rejected, (state) => {
                state.getParentsStatus = "error";
                notification.error({ message: "Lấy danh sách phụ huynh bị lỗi" })
            })

            // add parent
            .addCase(actionAddParent.pending, (state) => {
                state.addParentStatus = "loading";
            })
            .addCase(actionAddParent.fulfilled, (state) => {
                state.addParentStatus = "success";
                notification.success({ message: "Thêm phụ huynh thành công!" })

            })
            .addCase(actionAddParent.rejected, (state) => {
                state.addParentStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

            //update parent infomation
            .addCase(actionUpdateParent.pending, (state) => {
                state.updateParentStatus = "loading";
            })
            .addCase(actionUpdateParent.fulfilled, (state) => {
                state.updateParentStatus = "success";
                notification.success({ message: "Sửa thông tin phụ huynh thành công!" })

            })
            .addCase(actionUpdateParent.rejected, (state) => {
                state.updateParentStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

    }
})