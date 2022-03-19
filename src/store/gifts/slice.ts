import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, GiftType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface NewsReducerState {
    giftList: GetResponseType<GiftType> | null;
    giftInfo: GiftType | null;
    getGiftListStatus: "idle" | "loading" | "success" | "error";
    getGiftInfoStatus: "idle" | "loading" | "success" | "error";
    addGiftStatus: "idle" | "loading" | "success" | "error";
    updateGiftStatus: "idle" | "loading" | "success" | "error";
    deleteGiftStatus: "idle" | "loading" | "success" | "error";
}

export interface GetGiftListPrams {
    search?: string;
    page?: number;
    per_page?: number;
    type?: number
}

export interface AddGiftParams {
    name: string;
    type: number;
    photo: number;
    description: string;
    status: 0;
    quantity: number
}
const initialState: NewsReducerState = {
    giftList: null,
    giftInfo: null,
    getGiftListStatus: "idle",
    getGiftInfoStatus: "idle",
    addGiftStatus: "idle",
    updateGiftStatus: "idle",
    deleteGiftStatus: "idle",
}
export const actionGetGiftInfo = createAsyncThunk(
    "actionGetGiftInfo",
    async (giftId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/gifts/${giftId}`,
                method: "get",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionGetGiftList = createAsyncThunk(
    "actionGetGiftList",
    async (params: GetGiftListPrams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/gifts`,
                method: "get",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionAddGift = createAsyncThunk(
    "actionAddGift",
    async (data: AddGiftParams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/gifts`,
                method: "post",
                data
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionUpdateGift = createAsyncThunk(
    "actionUpdateGift",
    async (params: { giftId: number, data: AddGiftParams }, { rejectWithValue }) => {
        try {
            const { data, giftId } = params;
            const response = await request({
                url: `/api/gifts/${giftId}`,
                method: "put",
                data
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionDeleteGift = createAsyncThunk(
    "actionDeleteGift",
    async (giftId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/gifts/${giftId}`,
                method: "delete",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const giftstSlice = createSlice({
    name: "gifts",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        //get gift info
        builder
            .addCase(actionGetGiftInfo.pending, (state) => {
                state.getGiftInfoStatus = "loading";
            })
            .addCase(actionGetGiftInfo.fulfilled, (state, action) => {
                state.giftInfo = action.payload as GiftType;
                state.getGiftInfoStatus = "success";
            })
            .addCase(actionGetGiftInfo.rejected, (state, action) => {
                state.getGiftInfoStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })
        //get gift list
        builder
            .addCase(actionGetGiftList.pending, (state) => {
                state.getGiftListStatus = "loading";
            })
            .addCase(actionGetGiftList.fulfilled, (state, action) => {
                state.giftList = action.payload as GetResponseType<GiftType>;
                state.getGiftListStatus = "success";
            })
            .addCase(actionGetGiftList.rejected, (state, action) => {
                state.getGiftListStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // add gift
            .addCase(actionAddGift.pending, (state) => {
                state.addGiftStatus = "loading";
            })
            .addCase(actionAddGift.fulfilled, (state) => {
                state.addGiftStatus = "success";
                notification.success({ message: "Thêm thành công!" });
            })
            .addCase(actionAddGift.rejected, (state, action) => {
                state.addGiftStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            //update gift infomation
            .addCase(actionUpdateGift.pending, (state) => {
                state.updateGiftStatus = "loading";
            })
            .addCase(actionUpdateGift.fulfilled, (state) => {
                state.updateGiftStatus = "success";
                notification.success({
                    message: "Sửa thông tin quà tặng thành công!",
                });
            })
            .addCase(actionUpdateGift.rejected, (state, action) => {
                state.updateGiftStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // delete gift
            .addCase(actionDeleteGift.pending, (state) => {
                state.deleteGiftStatus = "loading";
            })
            .addCase(actionDeleteGift.fulfilled, (state) => {
                state.deleteGiftStatus = "success";
                notification.success({ message: "Xoá thành công!" });
            })
            .addCase(actionDeleteGift.rejected, (state, action) => {
                state.deleteGiftStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            });
    },
});


export default giftstSlice.reducer;