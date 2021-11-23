import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosResponse } from "axios";
import { FileType } from "interface";
import request, { uploadFile } from "../../utils/request";

export interface FileListType {
	files: FileType[];
	recentUploaded:FileType | null;
	recentFileTestUploaded:FileType | null;
	statusGetFiles: "idle" | "loading" | "success" | "error";
	statusDeleteFile: "idle" | "loading" | "success" | "error";
	statusUploadFile: "idle" | "loading" | "success" | "error";
	statusUploadFileTest: "idle" | "loading" | "success" | "error";

}

const initialState: FileListType = {
	files: [],
	recentUploaded:null,
	recentFileTestUploaded:null,
	statusGetFiles: "idle",
	statusDeleteFile: "idle",
	statusUploadFile: "idle",
	statusUploadFileTest: "idle",

};

export const actionGetListFile = createAsyncThunk("actionGetListFile", async (params?: { search?: string }) => {
	const response: AxiosResponse<any> = await request({
		method: "get",
		url: "/api/files",
		params,
	});
	return response.data.data;
});

export const actionUploadFile = createAsyncThunk("actionUploadFile", async (file: File[] | File | FileList) => {
	const response = await uploadFile(file);
	return response.data;
});

export const actionUploadFileTest = createAsyncThunk("actionUploadFileTest", async (file: File[] | File | FileList) => {
	const response = await uploadFile(file);
	return response.data;
});

export const actionDeleteUploadFile = createAsyncThunk("actionDeleteUploadFile", async (id: number) => {
	const response = await request({
		method: "delete",
		url: `/api/files/${id}`,
	});
	return response.data;
});



export const slice = createSlice({
	name: "files",
	initialState,
	reducers: {
		resetGetFileStatus(state) {
			state.statusGetFiles = "idle";
		},
		resetDeleteFileStatus(state) {
			state.statusDeleteFile = "idle";
		},
		resetUploadFileStatus(state) {
			state.statusUploadFile = "idle";
		},
		resetRecentFileTestUploaded(state){
			state.recentFileTestUploaded = null;
		}
	},

	extraReducers: (builder) => {
		builder
			// Get
			.addCase(actionGetListFile.fulfilled, (state, action) => {
				state.files = action.payload as FileType[];
				state.statusGetFiles = "success";
			})
			.addCase(actionGetListFile.pending, (state) => {
				state.statusGetFiles = "loading";
			})
			.addCase(actionGetListFile.rejected, (state) => {
				state.statusGetFiles = "error";
			})
			// Upload
			.addCase(actionUploadFile.fulfilled, (state, action) => {
				notification.success({ message: `Upload file thành công!` });
				state.recentUploaded  = action.payload as FileType;
				state.statusUploadFile = "success";
			})
			.addCase(actionUploadFile.pending, (state) => {
				state.statusUploadFile = "loading";
			})
			.addCase(actionUploadFile.rejected, (state) => {
				state.statusUploadFile = "error";
			})

			// Upload File Test
			.addCase(actionUploadFileTest.fulfilled, (state, action) => {
				notification.success({ message: `Upload file thành công!` });
				state.recentFileTestUploaded  = action.payload as FileType;
				state.statusUploadFileTest = "success";
			})
			.addCase(actionUploadFileTest.pending, (state) => {
				state.statusUploadFileTest = "loading";
			})
			.addCase(actionUploadFileTest.rejected, (state) => {
				state.statusUploadFileTest = "error";
			})

			// delete
			.addCase(actionDeleteUploadFile.fulfilled, (state) => {
				state.statusDeleteFile = "success";
			})
			.addCase(actionDeleteUploadFile.pending, (state) => {
				state.statusDeleteFile = "loading";
			})
			.addCase(actionDeleteUploadFile.rejected, (state) => {
				state.statusDeleteFile = "error";
			});
	},
});

export const { resetDeleteFileStatus, resetGetFileStatus, resetUploadFileStatus, resetRecentFileTestUploaded } = slice.actions;

export default slice.reducer;
