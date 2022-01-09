import { async } from "@firebase/util";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { FileType, GetResponseType } from "interface";
import request from "utils/request";

export interface TestResultsType {
	id: number;
	student_id: number;
	test_id: number;
	result_files: FileType[];
	result_link: string;
	correct_files: FileType[];
	correct_link: string;
	point: string;
	teacher_comment: string;
	parent_feedback: string;
	updated_at: string;
}

export interface TestResultsState {
	testResults: GetResponseType<TestResultsType> | null;
	getTestResultsStatus: "idle" | "loading" | "success" | "error";
	addTestResultsStatus: "idle" | "loading" | "success" | "error";
	updateTestResultsStatus: "idle" | "loading" | "success" | "error";
}

export interface GetTestResultsParam {
	student_id?: number;
	test_id?: number;
}

export interface UpdateTestResultsParam {
	id: number;
	correct_files?: number[];
	teacher_comment?: string;
	point?: string;
	parent_feedback?: string;
}

export const actionGetTestResults = createAsyncThunk(
	"actionGetTestResults",
	async (params: GetTestResultsParam) => {
		const response = await request({
			url: "api/test-results",
			method: "get",
			params,
		});
		return response.data;
	}
);

export const actionUpdateTestResults = createAsyncThunk(
	"actionUpdateTestResults",
	async (params: UpdateTestResultsParam) => {
        const {id, ...data} = params
		const response = await request({
			url: `api/test-results/${id}`,
			method: "put",
			data,
		});
		return response.data;
	}
);

const initialState: TestResultsState = {
	testResults: null,
	getTestResultsStatus: "idle",
	addTestResultsStatus: "idle",
	updateTestResultsStatus: "idle",
};

export const testResults = createSlice({
	name: "testResult",
	initialState,
	reducers: {
		resetGetTestResultsStatus(status) {
			status.getTestResultsStatus = "idle";
		},
		resetAddTestResultsStatus(status) {
			status.getTestResultsStatus = "idle";
		},
		resetUpdateTestResultsStatus(status) {
			status.getTestResultsStatus = "idle";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetTestResults.fulfilled, (state, action) => {
				state.testResults = action.payload as GetResponseType<TestResultsType>;
				state.getTestResultsStatus = "success";
			})
			.addCase(actionGetTestResults.pending, (state) => {
				state.getTestResultsStatus = "loading";
			})
			.addCase(actionGetTestResults.rejected, (state) => {
				state.getTestResultsStatus = "error";
				notification.error({ message: "Lấy kết quả bài kiểm tra bị lỗi!" });
			})
			//
			.addCase(actionUpdateTestResults.pending, (state) => {
				state.updateTestResultsStatus = "loading";
			})
			.addCase(actionUpdateTestResults.rejected, (state) => {
				state.updateTestResultsStatus = "error";
				notification.error({ message: "Cập nhật bài kiểm tra bị lỗi!" });
			})
			.addCase(actionUpdateTestResults.fulfilled, (state) => {
				state.updateTestResultsStatus = "success";
			});
	},
});
export const {
	resetGetTestResultsStatus,
	resetAddTestResultsStatus,
	resetUpdateTestResultsStatus,
} = testResults.actions;
export default testResults.reducer;
