import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, NewsType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface NewsReducerState {
    newsList: GetResponseType<NewsType> | null;
    newInfo: NewsType | null;
    getNewsListStatus: "idle" | "loading" | "success" | "error";
    getNewsInfoStatus: "idle" | "loading" | "success" | "error";
    addNewsStatus: "idle" | "loading" | "success" | "error";
    updateNewsStatus: "idle" | "loading" | "success" | "error";
    deleteNewsStatus: "idle" | "loading" | "success" | "error";
}

export interface GetNewsListPrams {
    search?: string;
    page?: number;
    per_page?: number;
}

export interface AddNewsParams {
    title: string;
    content: string;
}
const initialState: NewsReducerState = {
    newsList: null,
    newInfo: null,
    getNewsListStatus: "idle",
    getNewsInfoStatus: "idle",
    addNewsStatus: "idle",
    updateNewsStatus: "idle",
    deleteNewsStatus: "idle",
}
export const actionGetNewsInfo = createAsyncThunk(
    "actionGetNewsInfo",
    async (newsId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/news/${newsId}`,
                method: "get",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionGetNewsList = createAsyncThunk(
    "actionGetNewsList",
    async (params: GetNewsListPrams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/news`,
                method: "get",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionAddNews = createAsyncThunk(
    "actionAddNews",
    async (data: AddNewsParams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/news`,
                method: "post",
                data
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionUpdateNews = createAsyncThunk(
    "actionUpdateNews",
    async (params: { newId: number, data: AddNewsParams }, { rejectWithValue }) => {
        try {
            const { data, newId } = params;
            const response = await request({
                url: `/api/news/${newId}`,
                method: "put",
                data
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionDeleteNews = createAsyncThunk(
    "actionDeleteNews",
    async (newId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/news/${newId}`,
                method: "delete",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const newsSlice = createSlice({
    name: "news",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        //get news info
        builder
            .addCase(actionGetNewsInfo.pending, (state) => {
                state.getNewsInfoStatus = "loading";
            })
            .addCase(actionGetNewsInfo.fulfilled, (state, action) => {
                state.newInfo = action.payload as NewsType;
                state.getNewsInfoStatus = "success";
            })
            .addCase(actionGetNewsInfo.rejected, (state, action) => {
                state.getNewsInfoStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })
        //get news list
        builder
            .addCase(actionGetNewsList.pending, (state) => {
                state.getNewsListStatus = "loading";
            })
            .addCase(actionGetNewsList.fulfilled, (state, action) => {
                state.newsList = action.payload as GetResponseType<NewsType>;
                state.getNewsListStatus = "success";
            })
            .addCase(actionGetNewsList.rejected, (state, action) => {
                state.getNewsListStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // add news
            .addCase(actionAddNews.pending, (state) => {
                state.addNewsStatus = "loading";
            })
            .addCase(actionAddNews.fulfilled, (state) => {
                state.addNewsStatus = "success";
                notification.success({ message: "Th??m b??i tin th??nh c??ng!" });
            })
            .addCase(actionAddNews.rejected, (state, action) => {
                state.addNewsStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            //update news infomation
            .addCase(actionUpdateNews.pending, (state) => {
                state.updateNewsStatus = "loading";
            })
            .addCase(actionUpdateNews.fulfilled, (state) => {
                state.updateNewsStatus = "success";
                notification.success({
                    message: "S???a b??i tin th??nh c??ng!",
                });
            })
            .addCase(actionUpdateNews.rejected, (state, action) => {
                state.updateNewsStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })

            // delete news
            .addCase(actionDeleteNews.pending, (state) => {
                state.deleteNewsStatus = "loading";
            })
            .addCase(actionDeleteNews.fulfilled, (state) => {
                state.deleteNewsStatus = "success";
                notification.success({ message: "Xo?? b??i tin th??nh c??ng!" });
            })
            .addCase(actionDeleteNews.rejected, (state, action) => {
                state.deleteNewsStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            });
    },
});


export default newsSlice.reducer;