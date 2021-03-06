import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType } from "interface";
import { get } from "lodash";
import { handleResponseError } from "utils/ultil";
import request from "../../utils/request";

export interface PaymentType {
	id: number;
	creator_employee_id: number;
	pay_employee_id: number;
	type: 0 | 1;
	amount: number;
	reason: string | null | undefined;
	note: string | null | undefined;
	status: number;
	created_at: string;
	payer: any;
	creator: any;
}

export interface PaymentRequestAddType {
	date: string;
	creator_employee_id: number | undefined;
	pay_employee_id: number;
	type: number;
	amount: number;
	reason: string;
	note: string;
	status?: number;
}

export enum PaymentTypeEnum {
	"Cố định",
	"Phát sinh",
}

export const PaymentStatusList = [
	"Chưa xử lý", // = 0
	"Đã xử lý", // = 1
];

export interface PaymentSearchParam {
	search?: string;
	fromDate?: string;
	toDate?: string;
	page?: number;
	per_page?: number;
}

export interface PaymentState {
	payments: GetResponseType<PaymentType> | null;
	getPaymentStatus: "idle" | "loading" | "success" | "error";
	addPaymentStatus: "idle" | "loading" | "success" | "error";
	updatePaymentStatus: "idle" | "loading" | "success" | "error";
	deletePaymentStatus: "idle" | "loading" | "success" | "error";

}

const initialState: PaymentState = {
	payments: null,
	getPaymentStatus: "idle",
	addPaymentStatus: "idle",
	updatePaymentStatus: "idle",
	deletePaymentStatus: "idle"
};

export const actionGetPayments = createAsyncThunk(
	"actionGetPayments",
	async (params: PaymentSearchParam, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/payment-slips",
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddNewPayment = createAsyncThunk(
	"actionAddNewPayment",
	async (data: PaymentRequestAddType, { rejectWithValue }) => {
		try {
			const response = await request({
				url: "/api/payment-slips",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdatePaymentStatus = createAsyncThunk(
	"actionUpdatePaymentStatus",
	async (data: { status: number, payment_slip_ids: number[] }, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/payment-slips/update-status`,
				method: "post",
				data
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);


export const actionDeletePayment = createAsyncThunk(
	"actionDeletePayment",
	async (pId: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/payment-slips/${pId}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const slice = createSlice({
	name: "payments",
	initialState,
	reducers: {
		resetGetPaymentStatus(state) {
			state.getPaymentStatus = "idle";
		},
		resetAddPaymentStatus(state) {
			state.addPaymentStatus = "idle";
		},
		resetUpdatePaymentStatus(state) {
			state.updatePaymentStatus = "idle";
		},
		actionDeletePayment(state) {
			state.deletePaymentStatus = 'idle';
		},
		actionUpdatePaymentStatus(state) {
			state.updatePaymentStatus = 'idle';
		}
	},

	extraReducers: (builder) => {
		builder
			.addCase(actionGetPayments.fulfilled, (state, action: any) => {
				state.payments = action.payload as GetResponseType<PaymentType>;
				state.getPaymentStatus = "success";
			})
			.addCase(actionGetPayments.rejected, (state, action) => {
				state.getPaymentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})
			.addCase(actionGetPayments.pending, (state) => {
				state.getPaymentStatus = "loading";
			})

			.addCase(actionAddNewPayment.pending, (state) => {
				state.addPaymentStatus = "loading";
			})
			.addCase(actionAddNewPayment.fulfilled, (state) => {
				state.addPaymentStatus = "success";
				notification.success({ message: "Thêm chi tiêu thành công!" });
			})
			.addCase(actionAddNewPayment.rejected, (state, action) => {
				state.addPaymentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionUpdatePaymentStatus.fulfilled, (state) => {
				state.updatePaymentStatus = "success";
			})
			.addCase(actionUpdatePaymentStatus.pending, (state) => {
				state.updatePaymentStatus = "loading";
			})
			.addCase(actionUpdatePaymentStatus.rejected, (state, action) => {
				state.updatePaymentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			})

			.addCase(actionDeletePayment.pending, (state) => {
				state.deletePaymentStatus = "loading";
			})
			.addCase(actionDeletePayment.fulfilled, (state) => {
				state.deletePaymentStatus = "success";
				notification.success({ message: "Xoá chi tiêu thành công!" });
			})
			.addCase(actionDeletePayment.rejected, (state, action) => {
				state.deletePaymentStatus = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error);
			});
	},
});

export const {
	resetGetPaymentStatus,
	resetAddPaymentStatus,
	resetUpdatePaymentStatus,
} = slice.actions;

export default slice.reducer;
