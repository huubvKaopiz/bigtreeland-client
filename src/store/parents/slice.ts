import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, UserType } from "interface";
import { get } from "lodash";
import { ROLE_NAMES } from "utils/const";
import request from "utils/request";

export interface ParentReducerState {
	parents: GetResponseType<UserType> | null;
	getParentsStatus: "idle" | "loading" | "success" | "error";
	addParentStatus: "idle" | "loading" | "success" | "error";
	updateParentStatus: "idle" | "loading" | "success" | "error";
	deleteParentStatus: "idle" | "loading" | "success" | "error";
}

export interface GetParentsPrams {
	search?: string;
	page?: number;
	per_page?: number;
}

export interface ParentParams {
	name: string;
	email: string;
	password: string;
}

const initialState: ParentReducerState = {
	parents: null,
	getParentsStatus: "idle",
	addParentStatus: "idle",
	updateParentStatus: "idle",
	deleteParentStatus: "idle",
};

export const actionGetParents = createAsyncThunk(
	"actionGetParents",
	async (params: GetParentsPrams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users?role_name=${ROLE_NAMES.PARENT}`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddParent = createAsyncThunk(
	"actionAddParent",
	async (data: ParentParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/users",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateParent = createAsyncThunk(
	"actionUpdateParent",
	async (
		params: {
			data: { name: string; email: string; gender: number };
			uID: number;
		},
		{ rejectWithValue }
	) => {
		try {
			const { data, uID } = params;
			const response = await request({
				url: `/api/users/${uID}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteParent = createAsyncThunk(
	"actionDeleteParent",
	async (parentId: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/users/${parentId}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const parentSlice = createSlice({
	name: "parent",
	initialState,
	reducers: {
		actionResetStatusDeleteParent(state) {
			state.deleteParentStatus = "idle";
		},
	},
	extraReducers: (builder) => {
		//get parents
		builder
			.addCase(actionGetParents.pending, (state) => {
				state.getParentsStatus = "loading";
			})
			.addCase(actionGetParents.fulfilled, (state, action) => {
				state.parents = action.payload as GetResponseType<UserType>;
				state.getParentsStatus = "success";
			})
			.addCase(actionGetParents.rejected, (state, action) => {
				state.getParentsStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// add parent
			.addCase(actionAddParent.pending, (state) => {
				state.addParentStatus = "loading";
			})
			.addCase(actionAddParent.fulfilled, (state) => {
				state.addParentStatus = "success";
				notification.success({ message: "Thêm phụ huynh thành công!" });
			})
			.addCase(actionAddParent.rejected, (state, action) => {
				state.addParentStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//update parent infomation
			.addCase(actionUpdateParent.pending, (state) => {
				state.updateParentStatus = "loading";
			})
			.addCase(actionUpdateParent.fulfilled, (state) => {
				state.updateParentStatus = "success";
				notification.success({
					message: "Sửa thông tin phụ huynh thành công!",
				});
			})
			.addCase(actionUpdateParent.rejected, (state, action) => {
				state.updateParentStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionDeleteParent.pending, (state) => {
				state.deleteParentStatus = "loading";
			})
			.addCase(actionDeleteParent.fulfilled, (state) => {
				state.deleteParentStatus = "success";
				notification.success({ message: "Xoá phụ huynh thành công!" });
			})
			.addCase(actionDeleteParent.rejected, (state, action) => {
				state.deleteParentStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const { actionResetStatusDeleteParent } = parentSlice.actions;

export default parentSlice.reducer;
