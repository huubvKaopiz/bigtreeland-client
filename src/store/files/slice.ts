import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { FileType, GetResponseType } from "interface";
import { get } from "lodash";
import request, { uploadFile } from "../../utils/request";

export interface FileListType {
	recentUploaded: FileType | null;
	recentFileTestUploaded: FileType[] | null;
	files: GetResponseType<FileType>;
	statusGetFiles: "idle" | "loading" | "success" | "error";
	statusDeleteFile: "idle" | "loading" | "success" | "error";
	statusUploadFile: "idle" | "loading" | "success" | "error";
}

const initialState: FileListType = {
	recentUploaded: null,
	recentFileTestUploaded: null,
	files: {},
	statusGetFiles: "idle",
	statusDeleteFile: "idle",
	statusUploadFile: "idle",
};

export const actionGetListFile = createAsyncThunk(
	"actionGetListFile",
	async (params: { search?: string; page?: number }, { rejectWithValue }) => {
		try {
			const response = await request({
				method: "get",
				url: "/api/files",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUploadFile = createAsyncThunk(
	"actionUploadFile",
	async (file: File[] | File | FileList, { rejectWithValue }) => {
		try {
			const response = await uploadFile(file);
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUploadFileTest = createAsyncThunk(
	"actionUploadFileTest",
	async (file: File[] | File | FileList, { rejectWithValue }) => {
		try {
			const response = await uploadFile(file);
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteUploadFile = createAsyncThunk(
	"actionDeleteUploadFile",
	async (id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				method: "delete",
				url: `/api/files/${id}`,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

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
		resetRecentFileTestUploaded(state) {
			state.recentFileTestUploaded = null;
		},
	},

	extraReducers: (builder) => {
		builder
			// Get
			.addCase(actionGetListFile.fulfilled, (state, action) => {
				state.files = action.payload as GetResponseType<FileType>;
				state.statusGetFiles = "success";
			})
			.addCase(actionGetListFile.pending, (state) => {
				state.statusGetFiles = "loading";
			})
			.addCase(actionGetListFile.rejected, (state, action) => {
				state.statusGetFiles = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// Upload
			.addCase(actionUploadFile.fulfilled, (state) => {
				notification.success({ message: `Upload file thành công!` });
				state.statusUploadFile = "success";
			})
			.addCase(actionUploadFile.pending, (state) => {
				state.statusUploadFile = "loading";
			})
			.addCase(actionUploadFile.rejected, (state, action) => {
				state.statusUploadFile = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// Upload File Test
			.addCase(actionUploadFileTest.fulfilled, (state, action) => {
				console.log(action.payload);
				notification.success({ message: `Upload file thành công!` });
				state.recentFileTestUploaded = action.payload as FileType[];
				state.statusUploadFile = "success";
			})
			.addCase(actionUploadFileTest.pending, (state) => {
				state.statusUploadFile = "loading";
			})
			.addCase(actionUploadFileTest.rejected, (state, action) => {
				state.statusUploadFile = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// delete
			.addCase(actionDeleteUploadFile.fulfilled, (state) => {
				state.statusDeleteFile = "success";
			})
			.addCase(actionDeleteUploadFile.pending, (state) => {
				state.statusDeleteFile = "loading";
			})
			.addCase(actionDeleteUploadFile.rejected, (state, action) => {
				state.statusDeleteFile = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const {
	resetDeleteFileStatus,
	resetGetFileStatus,
	resetUploadFileStatus,
	resetRecentFileTestUploaded,
} = slice.actions;

export default slice.reducer;
