import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, StudentType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface StudentReducerState {
	students: GetResponseType<StudentType> | null;
	studentProfile: StudentType | null;
	getStudentsStatus: "idle" | "loading" | "success" | "error";
	getStudentStatus: "idle" | "loading" | "success" | "error";
	addStudentStatus: "idle" | "loading" | "success" | "error";
	updateStudentStatus: "idle" | "loading" | "success" | "error";
	updateStudentStatusStatus: "idle" | "loading" | "success" | "error";
	updateStudentClasHistoryStatus: "idle" | "loading" | "success" | "error";
	deleteStudentStatus: "idle" | "loading" | "success" | "error";
}

export interface GetStudentPrams {
	search?: string;
	page?: number;
	per_page?: number;
	class_id?: number;
}

export interface UpdateStudentStatusParams {
	student_id: number;
	status: number;
}

export interface StudentParams {
	name?: string;
	parent_id?: number;
	birthday?: string;
	gender?: number;
	school?: string | null;
	admission_date?: string;
	address?: string | null;
	interests?: string | null;
	dislikes?: string | null;
	personality?: string | null;
	hope?: string | null;
	knowledge_status?: number | null;
	is_special?: number | boolean | null;
	class_id?: number;
}

const initialState: StudentReducerState = {
	students: null,
	studentProfile: null,
	getStudentsStatus: "idle",
	getStudentStatus: "idle",
	addStudentStatus: "idle",
	updateStudentStatus: "idle",
	updateStudentStatusStatus: "idle",
	updateStudentClasHistoryStatus:'idle',
	deleteStudentStatus:'idle'

};

export const actionGetStudentProfile = createAsyncThunk(
	"actionGetStudentProfile",
	async (sID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/students/${sID}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetStudents = createAsyncThunk(
	"actionGetStudents",
	async (params: GetStudentPrams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/students",
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddStudent = createAsyncThunk(
	"actionAddStudent",
	async (data: StudentParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/students",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateStudent = createAsyncThunk(
	"actionUpdateStudent",
	async (params: { data: StudentParams; sID: number }, { rejectWithValue }) => {
		try {
			const { data, sID } = params;
			const response = await request({
				url: `/api/students/${sID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionLeaveClass = createAsyncThunk(
	"actionLeaveClass",
	async (params: { data: StudentParams; sID: number }, { rejectWithValue }) => {
		try {
			const { data, sID } = params;
			const response = await request({
				url: `/api/students/${sID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteStudent = createAsyncThunk(
	"actions/delete-student",
	async (params: {sID: number }, { rejectWithValue }) => {
		try {
			const { sID } = params;
			const response = await request({
				url: `/api/students/${sID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const updateStudentStatus = createAsyncThunk(
	"actionUpdateStudentStatus",
	async (data: UpdateStudentStatusParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/students/update-status`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateStudentClassHistory = createAsyncThunk(
	"actionUpdateStudentClassHistory",
	async (data:{chId:number, date:string}, { rejectWithValue }) => {
		try {
			const {chId, date} = data;
			const response = await request({
				url: `/api/class-histories/${chId}`,
				method: "put",
				data:{date},
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const studentSlice = createSlice({
	name: "student",
	initialState,
	reducers: {
		actionResetGetStudents(state) {
			state.getStudentsStatus = "idle";
		},
		actionAddStudent(state) {
			state.addStudentStatus = "idle";
		},
		actionResetUpdateStudent(state) {
			state.updateStudentStatus = "idle";
			state.deleteStudentStatus = "idle";
		},
		actionUpdateStudentStatus(state) {
			state.updateStudentStatusStatus = "idle";
		},
		actionSetStudentsStateNull(state) {
			state.students = null;
		},
		actionGetStudentProfile(state) {
			state.studentProfile = null;
			state.getStudentStatus = "idle";
		},
		actionUpdateStudentClassHistory(state){
			state.updateStudentClasHistoryStatus = 'idle';
		},
		actionDeleteStudent(state) {
			state.deleteStudentStatus = "idle";
		}
	},
	extraReducers: (builder) => {
		//Het list of students
		builder
			.addCase(actionGetStudents.pending, (state) => {
				state.getStudentsStatus = "loading";
			})
			.addCase(actionGetStudents.fulfilled, (state, action) => {
				state.students = action.payload as GetResponseType<StudentType>;
				state.getStudentsStatus = "success";
			})
			.addCase(actionGetStudents.rejected, (state, action) => {
				state.getStudentsStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			// get student profile
			.addCase(actionGetStudentProfile.pending, (state) => {
				state.getStudentStatus = "loading";
			})
			.addCase(actionGetStudentProfile.fulfilled, (state, action) => {
				state.studentProfile = action.payload as StudentType;
				state.getStudentStatus = "success";
			})
			.addCase(actionGetStudentProfile.rejected, (state, action) => {
				state.getStudentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			//Add new Student
			.addCase(actionAddStudent.pending, (state) => {
				state.addStudentStatus = "loading";
			})
			.addCase(actionAddStudent.fulfilled, (state) => {
				state.addStudentStatus = "success";
				notification.success({
					message: "Thêm thông tin học sinh thành công!",
				});
			})
			.addCase(actionAddStudent.rejected, (state, action) => {
				state.addStudentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			//Update Student infromation
			.addCase(actionUpdateStudent.pending, (state) => {
				state.updateStudentStatus = "loading";
			})
			.addCase(actionUpdateStudent.fulfilled, (state) => {
				state.updateStudentStatus = "success";
				notification.success({ message: "Sửa thông tin học sinh thành công!" });
			})
			.addCase(actionUpdateStudent.rejected, (state, action) => {
				state.updateStudentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			//Update Student status
			.addCase(updateStudentStatus.pending, (state) => {
				state.updateStudentStatusStatus = "loading";
			})
			.addCase(updateStudentStatus.fulfilled, (state) => {
				state.updateStudentStatusStatus = "success";
				notification.success({ message: "Cập nhật trạng thái thành công!" });
			})
			.addCase(updateStudentStatus.rejected, (state, action) => {
				state.updateStudentStatusStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			//Update class history
			.addCase(actionUpdateStudentClassHistory.pending, (state) => {
				state.updateStudentClasHistoryStatus = "loading";
			})
			.addCase(actionUpdateStudentClassHistory.fulfilled, (state) => {
				state.updateStudentClasHistoryStatus = "success";
				notification.success({ message: "Cập nhật thành công!" });
			})
			.addCase(actionUpdateStudentClassHistory.rejected, (state, action) => {
				state.updateStudentClasHistoryStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			//delete student 
			.addCase(actionDeleteStudent.pending, (state) => {
				state.deleteStudentStatus = "loading";
			})
			.addCase(actionDeleteStudent.fulfilled, (state) => {
				state.deleteStudentStatus = "success";
			})
			.addCase(actionDeleteStudent.rejected, (state, action) => {
				state.deleteStudentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			});
	},
});

export const {
	actionSetStudentsStateNull,
	actionResetUpdateStudent,
	actionResetGetStudents,
} = studentSlice.actions;

export default studentSlice.reducer;
