import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { NotificationType, GetResponseType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface NotificationReducerState {
    notificationList: GetResponseType<NotificationType> | null;
    notificationInfo: NotificationType | null;
    getNotificationListStatus: "idle" | "loading" | "success" | "error";
    getNotificationInfoStatus: "idle" | "loading" | "success" | "error";
    addNotificationStatus: "idle" | "loading" | "success" | "error";
    updateNotificationStatus: "idle" | "loading" | "success" | "error";
    deleteNotificationStatus: "idle" | "loading" | "success" | "error";
}

export interface GetNotificationListPrams {
    search?: string;
    page?: number;
    per_page?: number;
}

export interface AddNotificationParams {
    user_ids: number[];
    message: {
        title: string;
        body: string;
        data: {
            uri: string | null;
        }
    }
    role_id?: number
}
const initialState: NotificationReducerState = {
    notificationList: null,
    notificationInfo: null,
    getNotificationListStatus: "idle",
    getNotificationInfoStatus: "idle",
    addNotificationStatus: "idle",
    updateNotificationStatus: "idle",
    deleteNotificationStatus: "idle",
}
export const actionGetNotificationInfo = createAsyncThunk(
    "actionGetNotificationInfo",
    async (notificationId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/notifications/${notificationId}`,
                method: "get",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionGetNotificationList = createAsyncThunk(
    "actionGetNotificationList",
    async (params: GetNotificationListPrams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/notifications`,
                method: "get",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionAddNotification = createAsyncThunk(
    "actionAddNotification",
    async (data: AddNotificationParams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/notifications`,
                method: "post",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionUpdateNotification = createAsyncThunk(
    "actionUpdateNotification",
    async (params: { notiId: number, data: AddNotificationParams }, { rejectWithValue }) => {
        try {
            const { data, notiId } = params;
            const response = await request({
                url: `/api/notifications/${notiId}`,
                method: "put",
                data
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionDeleteNotification = createAsyncThunk(
    "actionDeleteNotification",
    async (notiId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/notifications/${notiId}`,
                method: "delete",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        //get notification info
        builder
            .addCase(actionGetNotificationInfo.pending, (state) => {
                state.getNotificationInfoStatus = "loading";
            })
            .addCase(actionGetNotificationInfo.fulfilled, (state, action) => {
                state.notificationInfo = action.payload as NotificationType;
                state.getNotificationInfoStatus = "success";
            })
            .addCase(actionGetNotificationInfo.rejected, (state, action) => {
                state.getNotificationInfoStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })
        //get Notification list
        builder
            .addCase(actionGetNotificationList.pending, (state) => {
                state.getNotificationListStatus = "loading";
            })
            .addCase(actionGetNotificationList.fulfilled, (state, action) => {
                state.notificationList = action.payload as GetResponseType<NotificationType>;
                state.getNotificationListStatus = "success";
            })
            .addCase(actionGetNotificationList.rejected, (state, action) => {
                state.getNotificationListStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // add Notification
            .addCase(actionAddNotification.pending, (state) => {
                state.addNotificationStatus = "loading";
            })
            .addCase(actionAddNotification.fulfilled, (state) => {
                state.addNotificationStatus = "success";
                notification.success({ message: "Gửi thông báo thành công!" });
            })
            .addCase(actionAddNotification.rejected, (state, action) => {
                state.addNotificationStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            //update Notification infomation
            .addCase(actionUpdateNotification.pending, (state) => {
                state.updateNotificationStatus = "loading";
            })
            .addCase(actionUpdateNotification.fulfilled, (state) => {
                state.updateNotificationStatus = "success";
                notification.success({
                    message: "Sửa thông báo thành công!",
                });
            })
            .addCase(actionUpdateNotification.rejected, (state, action) => {
                state.updateNotificationStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // delete Notification
            .addCase(actionDeleteNotification.pending, (state) => {
                state.deleteNotificationStatus = "loading";
            })
            .addCase(actionDeleteNotification.fulfilled, (state) => {
                state.deleteNotificationStatus = "success";
                notification.success({ message: "Xoá thông báo thành công!" });
            })
            .addCase(actionDeleteNotification.rejected, (state, action) => {
                state.deleteNotificationStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            });
    },
});


export default notificationSlice.reducer;