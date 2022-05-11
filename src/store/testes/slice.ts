import { async } from "@firebase/util"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { notification } from "antd"
import { AxiosError } from "axios"
import { GetResponseType, TestType } from "interface"
import { get } from "lodash"
import request from "utils/request"
import { handleResponseError } from "utils/ultil"

export interface TestReducerState {
	testes: GetResponseType<TestType> | null
	testInfo: TestType | null
	getTestStatus: "idle" | "loading" | "success" | "error"
	getTestesStatus: "idle" | "loading" | "success" | "error"
	updateTestStatus: "idle" | "loading" | "success" | "error"
	addTestStatus: "idle" | "loading" | "success" | "error"
	deleteTestStatus: "idle" | "loading" | "success" | "error"
}

export interface GetTestsPrams {
	class_id?: number
	from_date?: string
	to_date?: string
	page?: number
	lesson_id?: number | null
}

export interface AddTestParms {
	class_id: number
	title: string
	date: string
	description: string
	content_files?: Array<number>
	content_link?: string
	result_link?: string
	result_files?: number[]
	lesson_id?: number
}

export interface UpdateTestParams {
	id: number
	class_id?: number
	title?: string
	date?: string
	description?: string
	content_files?: Array<number>
	content_link?: string
	result_link?: string
	result_files?: number[]
	lesson_id?: number
}

const initialState: TestReducerState = {
	testInfo: null,
	testes: null,
	getTestStatus: "idle",
	getTestesStatus: "idle",
	updateTestStatus: "idle",
	addTestStatus: "idle",
	deleteTestStatus: "idle",
}

export const actionGetTest = createAsyncThunk(
	"actionGetTest",
	async (test_id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/tests/${test_id}`,
				method: "get",
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error)
		}
	}
)

export const actionGetTestes = createAsyncThunk(
	"actionGetTestes",
	async (params: GetTestsPrams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/tests",
				method: "get",
				params,
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error)
		}
	}
)

export const actionAddTest = createAsyncThunk(
	"actionAddTest",
	async (data: AddTestParms, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/tests`,
				method: "post",
				data,
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error)
		}
	}
)

export const actionUpdateTest = createAsyncThunk(
	"actionUpdateTest",
	async (updateData: UpdateTestParams, { rejectWithValue }) => {
		try {
			const { id, ...data } = updateData
			const response = await request({
				url: `/api/tests/${id}`,
				method: "put",
				data,
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error)
		}
	}
)
export const actionDeleteTest = createAsyncThunk(
	"actionDeleteTest",
	async (id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/tests/${id}`,
				method: "delete",
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error)
		}
	}
)

export const testSlice = createSlice({
	name: "parent",
	initialState,
	reducers: {
		actionResetGetTest(state) {
			state.getTestStatus = "idle"
		},
		actionResetGetTestes(state) {
			state.getTestesStatus = "idle"
		},
		actionResetAddTest(state) {
			state.addTestStatus = "idle"
		},
		actionResetUpdateTest(state) {
			state.updateTestStatus = "idle"
		},
		actionResetAddTestStatus(state) {
			state.addTestStatus = "idle"
		},
	},
	extraReducers: (builder) => {
		//get parents
		builder
			.addCase(actionGetTest.pending, (state) => {
				state.getTestStatus = "loading"
			})
			.addCase(actionGetTest.fulfilled, (state, action) => {
				state.testInfo = action.payload as TestType
				state.getTestStatus = "success"
			})
			.addCase(actionGetTest.rejected, (state, action) => {
				state.getTestStatus = "error"
				const error = action.payload as AxiosError
				handleResponseError(error)
			})
			//get class infomation
			.addCase(actionGetTestes.pending, (state) => {
				state.getTestesStatus = "loading"
			})
			.addCase(actionGetTestes.fulfilled, (state, action) => {
				state.testes = action.payload as GetResponseType<TestType>
				state.getTestesStatus = "success"
			})
			.addCase(actionGetTestes.rejected, (state, action) => {
				state.getTestesStatus = "error"
				const error = action.payload as AxiosError
				handleResponseError(error)
			})

			// add test
			.addCase(actionAddTest.pending, (state) => {
				state.addTestStatus = "loading"
			})
			.addCase(actionAddTest.fulfilled, (state) => {
				state.addTestStatus = "success"
				notification.success({ message: "Tạo bài test thành công!" })
			})
			.addCase(actionAddTest.rejected, (state, action) => {
				state.addTestStatus = "error"
				const error = action.payload as AxiosError
				handleResponseError(error)
			})
			//
			.addCase(actionUpdateTest.pending, (state) => {
				state.updateTestStatus = "loading"
			})
			.addCase(actionUpdateTest.rejected, (state, action) => {
				state.updateTestStatus = "error"
				const error = action.payload as AxiosError
				handleResponseError(error)
			})
			.addCase(actionUpdateTest.fulfilled, (state) => {
				state.updateTestStatus = "success"
				notification.success({ message: "Cập nhật bài test thành công!" })
			})
			//Delete
			.addCase(actionDeleteTest.pending, (state) => {
				state.deleteTestStatus = "loading"
			})
			.addCase(actionDeleteTest.rejected, (state, action) => {
				state.deleteTestStatus = "error"
				const error = action.payload as AxiosError
				handleResponseError(error, "xoá bài test")
			})
			.addCase(actionDeleteTest.fulfilled, (state) => {
				state.deleteTestStatus = "success"
				notification.success({ message: "Xoá bài test thành công!" })
			})
	},
})

export const {
	actionResetAddTestStatus,
	actionResetGetTest,
	actionResetGetTestes,
	actionResetAddTest,
	actionResetUpdateTest,
} = testSlice.actions

export default testSlice.reducer
