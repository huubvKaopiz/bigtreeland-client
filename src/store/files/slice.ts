import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosResponse } from "axios";
import request, { uploadFile } from "../../utils/request";

export interface FileType {
    "id": number;
    "name": string;
    "url": string;
}

export interface FileListType {
    "files": FileType[]
}

const initialState: FileListType  = {
    "files": []
}

export const actionGetListFile = createAsyncThunk("actionGetListFile", async () => {
    const response: AxiosResponse<any> = await request({
        method: 'get',
        url: "/api/files",
    })
    return response.data.data;
})

export const actionUploadFile = createAsyncThunk("actionUploadFile", async (file:File| FileList) => {
    const response = await uploadFile(file)
    return response.data
})

export const slice = createSlice({
    name: "files",
    initialState,
    reducers: {},

    extraReducers: builder => {
        builder.addCase(actionGetListFile.fulfilled, (state, action) => {
            state.files = action.payload as FileType[]
        })
        .addCase(actionUploadFile.fulfilled, () => {
            // notification.success({ message: `Upload file ${action.payload.name} thành công!` })
        })
    }
})

// export const {} = slice.actions

export default slice.reducer;