import { async } from "@firebase/util";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, TestType } from "interface";
import request from "utils/request";

export interface TestReducerState {
	testes: GetResponseType<TestType> | null;
	testInfo: TestType | null;
	getTestStatus: "idle" | "loading" | "success" | "error";
	getTestesStatus: "idle" | "loading" | "success" | "error";
	updateTestStatus: "idle" | "loading" | "success" | "error";
	addTestStatus: "idle" | "loading" | "success" | "error";
}

export interface GetTestsPrams {
	class_id?: number;
	page?: number;
}

export interface AddTestParms {
	class_id: number;
	title: string;
	date: string;
	content_files?: Array<number>;
	content_link?: string;
	result_link?: string;
	result_files?: number[];
}

export interface UpdateTestParams {
	id: number;
	class_id?: number;
	title?: string;
	date?: string;
	content_files?: Array<number>;
	content_link?: string;
	result_link?: string;
	result_files?: number[];
}

const initialState: TestReducerState = {
	testInfo: null,
	testes: null,
	getTestStatus: "idle",
	getTestesStatus: "idle",
	updateTestStatus: "idle",
	addTestStatus: "idle",
};

export const actionGetTest = createAsyncThunk(
	"actionGetTest",
	async (test_id: number) => {
		const response = await request({
			url: `/api/tests/${test_id}`,
			method: "get",
		});
		return response.data;
	}
);

export const actionGetTestes = createAsyncThunk(
	"actionGetTestes",
	async (params: GetTestsPrams = {}) => {
		const response = await request({
			url: "/api/tests",
			method: "get",
			params,
		});
		return response.data;
	}
);

export const actionAddTest = createAsyncThunk(
	"actionAddTest",
	async (data: AddTestParms) => {
		const response = await request({
			url: `/api/tests`,
			method: "post",
			data,
		});
		return response.data;
	}
);

export const actionUpdateTest = createAsyncThunk(
	"actionUpdateTest",
	async (updateData: UpdateTestParams) => {
		const { id, ...data } = updateData;
		const response = await request({
			url: `/api/tests/${id}`,
			method: "put",
			data,
		});
		return response.data;
	}
);

export const testSlice = createSlice({
	name: "parent",
	initialState,
	reducers: {
		actionResetGetTest(state) {
			state.getTestStatus = "idle";
		},
		actionResetGetTestes(state) {
			state.getTestesStatus = "idle";
		},
		actionResetAddTest(state) {
			state.addTestStatus = "idle";
		},
		actionResetUpdateTest(state) {
			state.updateTestStatus = "idle";
		},
		actionResetAddTestStatus(state) {
			state.addTestStatus = "idle";
		},
	},
	extraReducers: (builder) => {
		//get parents
		builder
			.addCase(actionGetTest.pending, (state) => {
				state.getTestStatus = "loading";
			})
			.addCase(actionGetTest.fulfilled, (state, action) => {
				state.testInfo = action.payload as TestType;
				state.getTestStatus = "success";
			})
			.addCase(actionGetTest.rejected, (state) => {
				state.getTestStatus = "error";
				notification.error({ message: "Lấy thông tin bài test bị lỗi" });
			})
			//get class infomation
			.addCase(actionGetTestes.pending, (state) => {
				state.getTestesStatus = "loading";
			})
			.addCase(actionGetTestes.fulfilled, (state, action) => {
				state.testes = action.payload as GetResponseType<TestType>;
				state.getTestesStatus = "success";
			})
			.addCase(actionGetTestes.rejected, (state) => {
				state.getTestesStatus = "error";
				notification.error({ message: "Lấy danh sách lớp học bị lỗi" });
			})

			// add test
			.addCase(actionAddTest.pending, (state) => {
				state.addTestStatus = "loading";
			})
			.addCase(actionAddTest.fulfilled, (state) => {
				state.addTestStatus = "success";
				notification.success({ message: "Tạo bài test thành công!" });
			})
			.addCase(actionAddTest.rejected, (state) => {
				state.addTestStatus = "error";
				notification.error({ message: "Có lỗi xảy ra!" });
			})
			//
			.addCase(actionUpdateTest.pending, (state) => {
				state.updateTestStatus = "loading";
			})
			.addCase(actionUpdateTest.rejected, (state) => {
				state.updateTestStatus = "error";
				notification.error({ message: "Cập nhật bài test bị lỗi!" });
			})
			.addCase(actionUpdateTest.fulfilled, (state) => {
				state.updateTestStatus = "success";
				notification.success({ message: "Cập nhật bài test thành công!" });
			});
	},
});

export const {
	actionResetAddTestStatus,
	actionResetGetTest,
	actionResetGetTestes,
	actionResetAddTest,
	actionResetUpdateTest,
} = testSlice.actions;

export default testSlice.reducer;
