import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType } from "interface";
import { get } from "lodash";
import { removeEmpty } from "utils/objectUtils";
import request from "utils/request";
export interface RevenueType {
	id: number;
	creator_id: number;
	type: 0 | 1;
	sale_id: number | null;
	amount: number;
	note?: string | null | undefined;
	date: string;
	status: number;
	created_at: string;
	reason: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	creator: any;
	saler?: null | number | string;
}

export interface RevenuesRequestAddType {
	creator_id: number;
	sale_id?: null | undefined | number;
	amount: number;
	type: number;
	date: string;
	reason?: string;
	note?: string;
	status?: number;
}

export interface RevenuesRequestUpdateType {
	id: number;
	creator_id?: number;
	amount?: number;
	date?: string;
	status?: number;
	reason?: string;
	note?: string;
}

export interface RevenuesSearchParam {
	search?: string;
	from_date?: string;
	to_date?: string;
	page?: number;
	employee_id?: number;
}

export const RevenuesStatusList = ["Chưa xác nhận", "Đã xác nhận"];

export const RevenuesTypeList = ["Doanh thu ngoài", "Sale", "Học phí"];

export interface RevenuesState {
	revenues: GetResponseType<RevenueType> | null;
	getRevenuesStatus: "idle" | "loading" | "success" | "error";
	addRevenuesStatus: "idle" | "loading" | "success" | "error";
	updateRevenuesStatus: "idle" | "loading" | "success" | "error";
	deleteRevenuesStatus: "idle" | "loading" | "success" | "error";

}

const initialState: RevenuesState = {
	revenues: null,
	getRevenuesStatus: "idle",
	addRevenuesStatus: "idle",
	updateRevenuesStatus: "idle",
	deleteRevenuesStatus: "idle"
};

export const actionGetRevenues = createAsyncThunk(
	"actionGetRevenues",
	async (params: RevenuesSearchParam, { rejectWithValue }) => {
		try {
			const searchParam = removeEmpty(params);
			const response = await request({
				url: "/api/receipts",
				method: "get",
				params: searchParam,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddNewRevenues = createAsyncThunk(
	"actionAddNewRevenues",
	async (data: RevenuesRequestAddType, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/receipts",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateRevenues = createAsyncThunk(
	"actionUpdateRevenues",
	async (data: RevenuesRequestUpdateType, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/receipts/${data.id}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateRevenueStatus = createAsyncThunk(
	"actionUpdateRevenueStatus",
	async (data: { receipt_ids: number[], status: number }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/receipts/update-status`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);


export const actionDeleteRevenue = createAsyncThunk(
	"actionDeleteRevenue",
	async (ID: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/receipts/${ID}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const slice = createSlice({
	name: "revenues",
	initialState,
	reducers: {
		resetGetRevenuesStatus(state) {
			state.getRevenuesStatus = "idle";
		},
		resetAddRevenuesStatus(state) {
			state.addRevenuesStatus = "idle";
		},
		actionUpdateRevenues(state) {
			state.updateRevenuesStatus = "idle";
		},
		actionUpdateRevenueStatus(state) {
			state.updateRevenuesStatus = "idle";
		},
		actionSetListRevenuesNull(state) {
			state.getRevenuesStatus = "idle";
			state.revenues = null;
		},
		resetUpdateRevenuesStatus(state) {
			state.updateRevenuesStatus = "idle";
		},
		actionDeleteRevenue(state) {
			state.deleteRevenuesStatus = 'idle'
		}
	},

	extraReducers: (builder) => {
		builder
			// get
			.addCase(actionGetRevenues.fulfilled, (state, action) => {
				state.getRevenuesStatus = "success";
				state.revenues = action.payload as GetResponseType<RevenueType>;
			})
			.addCase(actionGetRevenues.pending, (state) => {
				state.getRevenuesStatus = "loading";
			})
			.addCase(actionGetRevenues.rejected, (state, action) => {
				state.getRevenuesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// add
			.addCase(actionAddNewRevenues.fulfilled, (state) => {
				state.addRevenuesStatus = "success";
				notification.success({ message: "Thêm doanh thu mới thành công!" });
			})
			.addCase(actionAddNewRevenues.pending, (state) => {
				state.addRevenuesStatus = "loading";
			})
			.addCase(actionAddNewRevenues.rejected, (state, action) => {
				state.addRevenuesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// update
			.addCase(actionUpdateRevenues.fulfilled, (state) => {
				state.updateRevenuesStatus = "success";
				notification.success({ message: "Cập nhật doanh thu thành công!" });
			})
			.addCase(actionUpdateRevenues.pending, (state) => {
				state.updateRevenuesStatus = "loading";
			})
			.addCase(actionUpdateRevenues.rejected, (state, action) => {
				state.updateRevenuesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// update status
			.addCase(actionUpdateRevenueStatus.fulfilled, (state) => {
				state.updateRevenuesStatus = "success";
				notification.success({ message: "Cập nhật doanh thu thành công!" });
			})
			.addCase(actionUpdateRevenueStatus.pending, (state) => {
				state.updateRevenuesStatus = "loading";
			})
			.addCase(actionUpdateRevenueStatus.rejected, (state, action) => {
				state.updateRevenuesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})
			// delete
			.addCase(actionDeleteRevenue.fulfilled, (state) => {
				state.deleteRevenuesStatus = "success";
				notification.success({ message: "Đã xoá phiếu thu!" });
			})
			.addCase(actionDeleteRevenue.pending, (state) => {
				state.deleteRevenuesStatus = "loading";
			})
			.addCase(actionDeleteRevenue.rejected, (state, action) => {
				state.deleteRevenuesStatus = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});

export const {
	resetGetRevenuesStatus,
	resetAddRevenuesStatus,
	resetUpdateRevenuesStatus,
	actionSetListRevenuesNull,
} = slice.actions;
export default slice.reducer;
