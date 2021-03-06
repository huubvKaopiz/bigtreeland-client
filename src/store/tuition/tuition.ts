import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, TuitionFeeType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

interface TuitionFeeReducerState {
	tuitionFee: TuitionFeeType | null;
	tuitionFees: GetResponseType<TuitionFeeType> | null;
	getTuitionFeeState: "idle" | "loading" | "success" | "error";
	getTuitionFeesState: "idle" | "loading" | "success" | "error";
	addTuitionFeeState: "idle" | "loading" | "success" | "error";
	updateTuitionFeeState: "idle" | "loading" | "success" | "error";
	tuitionFeePaymentState: "idle" | "loading" | "success" | "error";

}

interface addTuitionFeeParams {
	period_tuition_id: number;
	student_id: number;
	fixed_deduction: string;
	flexible_deduction: string;
	residual: string;
	note: string;
	from_date?: string;
	to_date?: string;
	est_session_num: number;
	dayoffs: string[];
}

interface UpdateTuitionFeeParams {
	fixed_deduction?: string;
	flexible_deduction?: string;
	note?: string;
	status?: number;
}

export const actionGetTuitionFee = createAsyncThunk(
	"actionGetTuitionFee",
	async (tuition_id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/tuition-fees/${tuition_id}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetTuitionFees = createAsyncThunk(
	"actionGetTuitionFees",
	async (
		params: { period_tuition_ids?: string; per_page: 1000 },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: `/api/tuition-fees/`,
				method: "get",
				params,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionAddTuitionFee = createAsyncThunk(
	"actionAddTuitionFee",
	async (data: addTuitionFeeParams, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/tuition-fees/`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateTuitionFee = createAsyncThunk(
	"actionUpdateTuitionFee",
	async (
		params: { data: UpdateTuitionFeeParams; tuition_id: number },
		{ rejectWithValue }
	) => {
		try {
			const { data, tuition_id } = params;
			const response = await request({
				url: `/api/tuition-fees/${tuition_id}`,
				method: "put",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionTuitionFeePayment = createAsyncThunk(
	"actionTuitionFeePayment",
	async (
		data: { tuition_fee_id: number, amount: string, status:number },
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: `/api/tuition-fees/payment`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionTuitionFeeTranferDebt = createAsyncThunk(
	"actionTuitionFeeTranferDebt",
	async (
		data: { debt_tranfer: string; tuition_fee_id: number },
		{ rejectWithValue }
	) => {
		try {
			// const { debt_tranfer, tuition_id } = params;
			const response = await request({
				url: `/api/tuition-fees/debit-tranfer`,
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

const initialState: TuitionFeeReducerState = {
	tuitionFee: null,
	tuitionFees: null,
	getTuitionFeeState: "idle",
	getTuitionFeesState: "idle",
	addTuitionFeeState: "idle",
	updateTuitionFeeState: "idle",
	tuitionFeePaymentState:'idle',
};

export const tuitionFeeSlice = createSlice({
	name: "tuitionFeeSlice",
	initialState,
	reducers: {
		actionGetTuitionFee(state) {
			state.getTuitionFeeState = "idle";
		},
		actionGetTuitionFees(state) {
			state.getTuitionFeesState = "idle";
		},
		actionAddTuitionFee(state) {
			state.addTuitionFeeState = "idle";
		},
		actionUpdateTuitionFee(state) {
			state.updateTuitionFeeState = "idle";
		},
		actionSetTuitionFeesStateNull(state) {
			state.tuitionFees = null;
		},
		actionTuitionFeeTranferDebt(state) {
			state.updateTuitionFeeState = "idle";
		},
		actionTuitionFeePayment(state){
			state.tuitionFeePaymentState = 'idle';
 		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetTuitionFee.pending, (state) => {
				state.getTuitionFeeState = "loading";
			})
			.addCase(actionGetTuitionFee.fulfilled, (state, action) => {
				state.getTuitionFeeState = "success";
				state.tuitionFee = action.payload as TuitionFeeType;
			})
			.addCase(actionGetTuitionFee.rejected, (state, action) => {
				state.getTuitionFeeState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "C?? l???i x???y ra!"),
				});
			})

			.addCase(actionGetTuitionFees.pending, (state) => {
				state.getTuitionFeesState = "loading";
			})
			.addCase(actionGetTuitionFees.fulfilled, (state, action) => {
				state.getTuitionFeesState = "success";
				state.tuitionFees = action.payload as GetResponseType<TuitionFeeType>;
			})
			.addCase(actionGetTuitionFees.rejected, (state, action) => {
				state.getTuitionFeesState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "C?? l???i x???y ra!"),
				});
			})

			.addCase(actionAddTuitionFee.pending, (state) => {
				state.addTuitionFeeState = "loading";
			})
			.addCase(actionAddTuitionFee.fulfilled, (state) => {
				state.addTuitionFeeState = "success";
				notification.success({ message: "T???o b???ng h???c ph?? th??nh c??ng!" });
			})
			.addCase(actionAddTuitionFee.rejected, (state, action) => {
				state.addTuitionFeeState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "C?? l???i x???y ra!"),
				});
			})

			.addCase(actionUpdateTuitionFee.pending, (state) => {
				state.updateTuitionFeeState = "loading";
			})
			.addCase(actionUpdateTuitionFee.fulfilled, (state) => {
				state.updateTuitionFeeState = "success";
				notification.success({ message: "C???p nh???t b???ng h???c ph?? th??nh c??ng!" });
			})
			.addCase(actionUpdateTuitionFee.rejected, (state, action) => {
				state.updateTuitionFeeState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "C?? l???i x???y ra!"),
				});
			})

			.addCase(actionTuitionFeeTranferDebt.pending, (state) => {
				state.updateTuitionFeeState = "loading";
			})
			.addCase(actionTuitionFeeTranferDebt.fulfilled, (state) => {
				state.updateTuitionFeeState = "success";
				notification.success({ message: "Chuy???n n??? h???c ph?? th??nh c??ng!" });
			})
			.addCase(actionTuitionFeeTranferDebt.rejected, (state, action) => {
				state.updateTuitionFeeState = "error";
				const error = action.payload as AxiosError;
				handleResponseError(error)
			})

			.addCase(actionTuitionFeePayment.pending, (state) => {
				state.tuitionFeePaymentState = "loading";
			})
			.addCase(actionTuitionFeePayment.fulfilled, (state) => {
				state.tuitionFeePaymentState = "success";
				notification.success({ message: "C???p nh???t th??nh c??ng!" });
			})
			.addCase(actionTuitionFeePayment.rejected, (state, action) => {
				state.tuitionFeePaymentState = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "C?? l???i x???y ra!"),
				});
			});
	},
});

export const { actionSetTuitionFeesStateNull } = tuitionFeeSlice.actions;

export default tuitionFeeSlice.reducer;
