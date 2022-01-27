import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { SystemSettingsType } from "interface";
import { get } from "lodash";
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

export const actionGetSystemSettingInfo = createAsyncThunk(
	"actionGetSystemSettingInfo",
	async (param: unknown, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/settings/1`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateSystemSetting = createAsyncThunk(
	"actionUpdateSystemSetting",
	async (data: UpdateParams, { rejectWithValue }) => {
        try {
            
            const response = await request({
                url: `/api/settings/1`,
                method: "put",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error)    
        }
	}
);

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
		builder
			.addCase(actionGetSystemSettingInfo.pending, (state) => {
				state.getSystemSettingState = "loading";
			})
			.addCase(actionGetSystemSettingInfo.fulfilled, (state, action) => {
				state.getSystemSettingState = "success";
				state.systemSettingInfo = action.payload as SystemSettingsType;
			})
			.addCase(actionGetSystemSettingInfo.rejected, (state, action) => {
				state.getSystemSettingState = "error";
				const error = action.payload as AxiosError;
				notification.error({message:get(error,"response.data","Có lỗi xảy ra!")})
			})

            .addCase(actionUpdateSystemSetting.pending, state => {
                state.updateSystemSettingState = "loading";
            }).addCase(actionUpdateSystemSetting.fulfilled, (state, action) => {
                state.updateSystemSettingState = "success";
                state.systemSettingInfo = action.payload as SystemSettingsType;
                notification.success({ message: "Cập nhật thông tin hệ thống thành công" });
            }).addCase(actionUpdateSystemSetting.rejected, state => {
                state.updateSystemSettingState = "error";
                notification.error({ message: "Cập nhật thông tin hệ thống bị lỗi!" });
            })
    }
})

export default systemSettingSlice.reducer;
