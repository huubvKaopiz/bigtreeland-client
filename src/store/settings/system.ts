import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { SystemSettingsType } from "interface";
import request from "utils/request";

interface SystemSettingReducerState {
    systemSettingInfo: SystemSettingsType | null;
    getSystemSettingState: "idle" | "loading" | "success" | "error";
    updateSystemSettingState: "idle" | "loading" | "success" | "error";
}

interface UpdateParams {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_file?: number;
    permission_configuration_file?: number;
}

export const actionGetSystemSettingInfo = createAsyncThunk("actionGetSystemSettingInfo", async () => {
    const response = await request({
        url: `/api/settings/1`,
        method: "get",
    })
    return response.data;
})

export const actionUpdateSystemSetting = createAsyncThunk("actionUpdateSystemSetting", async (data: UpdateParams) => {
    const response = await request({
        url: `/api/settings/1`,
        method: "put",
        data
    })
    return response.data;
})

const initialState: SystemSettingReducerState = {
    systemSettingInfo: null,
    getSystemSettingState: "idle",
    updateSystemSettingState: "idle",
};

export const systemSettingSlice = createSlice({
    name: "tuitionFeeSlice",
    initialState,
    reducers: {
        actionGetSystemSettingInfo(state) {
            state.getSystemSettingState = "idle";
        },
        actionUpdateSystemSettingInfo(state) {
            state.getSystemSettingState = "idle";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(actionGetSystemSettingInfo.pending, state => {
            state.getSystemSettingState = "loading";
        }).addCase(actionGetSystemSettingInfo.fulfilled, (state, action) => {
            state.getSystemSettingState = "success";
            state.systemSettingInfo = action.payload as SystemSettingsType;
        }).addCase(actionGetSystemSettingInfo.rejected, state => {
            state.getSystemSettingState = "error";
            notification.error({ message: "Lấy thông tin hệ thống bị lỗi!" });
        })

            .addCase(actionUpdateSystemSetting.pending, state => {
                state.updateSystemSettingState = "loading";
            }).addCase(actionUpdateSystemSetting.fulfilled, (state) => {
                state.updateSystemSettingState = "success";
                notification.success({ message: "Cập nhật thông tin hệ thống thành công" });
            }).addCase(actionUpdateSystemSetting.rejected, state => {
                state.updateSystemSettingState = "error";
                notification.error({ message: "Cập nhật thông tin hệ thống bị lỗi!" });
            })
    }
})


export default systemSettingSlice.reducer;