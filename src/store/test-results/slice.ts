import { async } from "@firebase/util";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { FileType, GetResponseType, TestResultsType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface TestResultsState {
	testResults: GetResponseType<TestResultsType> | null;
	getTestResultsStatus: "idle" | "loading" | "success" | "error";
	addTestResultStatus: "idle" | "loading" | "success" | "error";
	updateTestResultStatus: "idle" | "loading" | "success" | "error";
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
	correct_link?:string;
}

export interface AddTestResultParam {
	test_id: number;
	student_id: number;
	teacher_comment?: string;
	point?: string;
	correct_files?:number[];
	correct_link?:string;
}

export const actionGetTestResults = createAsyncThunk(
	"actionGetTestResults",
	async (params: GetTestResultsParam, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "api/test-results",
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddTestResult = createAsyncThunk(
	"actionAddTestResult",
	async (data: AddTestResultParam, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "api/test-results",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateTestResult = createAsyncThunk(
	"actionUpdateTestResults",
	async (params: UpdateTestResultsParam, { rejectWithValue }) => {
		try {
			const { id, ...data } = params;
			const response = await request({
				url: `api/test-results/${id}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: TestResultsState = {
	testResults: null,
	getTestResultsStatus: "idle",
	addTestResultStatus: "idle",
	updateTestResultStatus: "idle",
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
			.addCase(actionGetTestResults.rejected, (state, action) => {
				state.getTestResultsStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			// add new
			.addCase(actionAddTestResult.pending, (state) => {
				state.addTestResultStatus = "loading";
			})
			.addCase(actionAddTestResult.rejected, (state, action) => {
				state.addTestResultStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			.addCase(actionAddTestResult.fulfilled, (state) => {
				state.addTestResultStatus = "success";
			})
			//update
			.addCase(actionUpdateTestResult.pending, (state) => {
				state.updateTestResultStatus = "loading";
			})
			.addCase(actionUpdateTestResult.rejected, (state, action) => {
				state.updateTestResultStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			.addCase(actionUpdateTestResult.fulfilled, (state) => {
				state.updateTestResultStatus = "success";
			});
	},
});
export const {
	resetGetTestResultsStatus,
	resetAddTestResultsStatus,
	resetUpdateTestResultsStatus,
} = testResults.actions;
export default testResults.reducer;
