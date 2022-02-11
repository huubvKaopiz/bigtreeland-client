import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { ClassType, FileType, GetResponseType } from "interface";
import { get } from "lodash";
import request from "utils/request";

export interface ClassReducerState {
	classes: GetResponseType<ClassType> | null;
	classInfo: ClassType | null;
	recentTestAdded: FileType | null;
	classDetailTabKey:string;
	getClassStatus: "idle" | "loading" | "success" | "error";
	getClassesStatus: "idle" | "loading" | "success" | "error";
	addClassStatus: "idle" | "loading" | "success" | "error";
	updateClassStatus: "idle" | "loading" | "success" | "error";
	addStudentsStatus: "idle" | "loading" | "success" | "error";
}

export interface GetClassesPrams {
	search?: string;
	page?: number;
	teacher_id?: number | undefined;
}

export interface ClassParams {
	name?: string;
	sessions_num?: 24;
	fee_per_session?: number;
	employee_id?: 1;
	schedule?: number[];
	schedule_time?: string;
	albums?: number[];
}

export interface AddTestParms {
	class_id: number;
	title: string;
	date: string;
	content_file: number;
}

const initialState: ClassReducerState = {
	classes: null,
	classInfo: null,
	classDetailTabKey:"1",
	recentTestAdded: null,
	getClassStatus: "idle",
	getClassesStatus: "idle",
	addClassStatus: "idle",
	updateClassStatus: "idle",
	addStudentsStatus: "idle",
};

export const actionGetClass = createAsyncThunk(
	"actionGetClass",
	async (
		payload: {
			class_id: number;
			params?: { active_periodinfo: boolean; students: boolean };
		},
		{ rejectWithValue }
	) => {
		const { class_id, params } = payload;
		try {
			const response = await request({
				url: `/api/classes/${class_id}`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetClasses = createAsyncThunk(
	"actionGetClasses",
	async (params: GetClassesPrams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/classes",
				method: "get",
				params,
			});
			return response.data;
		} catch (err) {
			return rejectWithValue(err);
		}
	}
);

export const actionAddClass = createAsyncThunk(
	"actionAddClass",
	async (data: ClassParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/classes",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateClass = createAsyncThunk(
	"actionUdpateClass",
	async (params: { data: ClassParams; cID: number }, { rejectWithValue }) => {
		try {
			const { data, cID } = params;
			const response = await request({
				url: `/api/classes/${cID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddStudents = createAsyncThunk(
	"actionAddStudents",
	async (
		params: { data: { students: number[] }; cID: number },
		{ rejectWithValue }
	) => {
		try {
			const { data, cID } = params;
			const response = await request({
				url: `/api/classes/add-students/${cID}`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const classSlice = createSlice({
	name: "parent",
	initialState,
	reducers: {
		actionResetGetParents(state) {
			state.getClassesStatus = "idle";
		},
		actionResetAddClass(state) {
			state.addClassStatus = "idle";
		},
		actionResetUpdateClass(state) {
			state.updateClassStatus = "idle";
		},
		actionSetClassStateNull(state) {
			state.classInfo = null;
		},
		actionResetAddStudent(state) {
			state.addStudentsStatus = "idle";
		},
		actionSetClassDetailTabKey(state,action){
			state.classDetailTabKey = action.payload;
		}
	},
	extraReducers: (builder) => {
		//get parents
		builder
			.addCase(actionGetClasses.pending, (state) => {
				state.getClassesStatus = "loading";
			})
			.addCase(actionGetClasses.fulfilled, (state, action) => {
				state.classes = action.payload as GetResponseType<ClassType>;
				state.getClassesStatus = "success";
			})
			.addCase(actionGetClasses.rejected, (state, action) => {
				state.getClassesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			//get class infomation
			.addCase(actionGetClass.pending, (state) => {
				state.getClassStatus = "loading";
			})
			.addCase(actionGetClass.fulfilled, (state, action) => {
				state.classInfo = action.payload as ClassType;
				state.getClassStatus = "success";
			})
			.addCase(actionGetClass.rejected, (state, action) => {
				state.getClassStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// add Class
			.addCase(actionAddClass.pending, (state) => {
				state.addClassStatus = "loading";
			})
			.addCase(actionAddClass.fulfilled, (state) => {
				state.addClassStatus = "success";
				notification.success({ message: "Thêm lớp học thành công!" });
			})
			.addCase(actionAddClass.rejected, (state, action) => {
				state.addClassStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//update Class infomation
			.addCase(actionUpdateClass.pending, (state) => {
				state.updateClassStatus = "loading";
			})
			.addCase(actionUpdateClass.fulfilled, (state) => {
				state.updateClassStatus = "success";
				notification.success({ message: "Sửa thông tin lớp học thành công!" });
			})
			.addCase(actionUpdateClass.rejected, (state, action) => {
				state.updateClassStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// add students
			.addCase(actionAddStudents.pending, (state) => {
				state.addStudentsStatus = "loading";
			})
			.addCase(actionAddStudents.fulfilled, (state) => {
				state.addStudentsStatus = "success";
				notification.success({ message: "Thêm học sinh thành công!" });
			})
			.addCase(actionAddStudents.rejected, (state, action) => {
				state.addStudentsStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});
export const { actionSetClassStateNull, actionResetAddStudent, actionSetClassDetailTabKey} =
	classSlice.actions;
export default classSlice.reducer;
