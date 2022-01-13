import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GetResponseType, PeriodTuitionType } from "interface";
import request from "utils/request";

export interface PeriodTuitionReducerState {
	periodTuitions: GetResponseType<PeriodTuitionType> | null;
	periodTuition: PeriodTuitionType | null;
	getPeriodTuitionStatus: "idle" | "loading" | "success" | "error";
	getPeriodTuitionsStatus: "idle" | "loading" | "success" | "error";
	addPeriodTuitionStatus: "idle" | "loading" | "success" | "error";
	updatePeriodTuitionStatus: "idle" | "loading" | "success" | "error";
	deletePeriodTuitionStatus: "idle" | "loading" | "success" | "error";

}

export interface GetPeriodTuionsPrams {
	class_id?: number;
	page?: number;
	from_date?: string;
	to_date?: string;
}

export interface AddPeriodTuionParms {
	class_id: number;
	from_date: string;
	to_date: string;
	est_session_num: number;
	fee_per_session: number;
	dayoffs:string[];
	tuition_fees: {
		student_id: number;
		residual: string;
		fixed_deduction: string;
		flexible_deduction: string;
		debt: string;
		note: string;
		from_date: string;
		to_date: string;
		status:0;
		dayoffs:string[];
	}[];
	draft: boolean;
}

export interface UpdatePeriodTuitionParams {
	class_id?: number;
	from_date?: string;
	to_date?: string;
	est_session_num?: number;
	fee_per_session?: number;
	active?: number;
}

const initialState: PeriodTuitionReducerState = {
	periodTuitions: null,
	periodTuition: null,
	getPeriodTuitionStatus: "idle",
	getPeriodTuitionsStatus: "idle",
	addPeriodTuitionStatus: "idle",
	updatePeriodTuitionStatus: "idle",
	deletePeriodTuitionStatus: "idle",
};

export const actionGetPeriodTuion = createAsyncThunk("actionGetPeriodTuion", async (period_tuition_id: number) => {
	const response = await request({
		url: `/api/period-tuitions/${period_tuition_id}`,
		method: "get",
	});
	return response.data;
});

export const actionGetPeriodTuions = createAsyncThunk("actionGetPeriodTuions", async (params: GetPeriodTuionsPrams = {}) => {
	const response = await request({
		url: `/api/period-tuitions`,
		method: "get",
		params
	})
	return response.data;
})

export const actionAddPeriodTuion = createAsyncThunk("actionAddPeriodTuion", async (data: AddPeriodTuionParms) => {
	const response = await request({
		url: `/api/period-tuitions`,
		method: "post",
		data,
	});
	return response.data;
});

export const actionUpdatePeriodTuion = createAsyncThunk(
	"actionUpdatePeriodTuion",
	async (params: { data: UpdatePeriodTuitionParams; pID: number }) => {
		const response = await request({
			url: `/api/period-tuitions/${params.pID}`,
			method: "put",
			data: params.data,
		});
		return response.data;
	}
);

export const actionDeletePeriodTuion = createAsyncThunk(
	"actionDeletePeriodTuion",
	async (pID: number) => {
		const response = await request({
			url: `/api/period-tuitions/${pID}`,
			method: "delete",
		});
		return response.data;
	}
);

export const periodTuitionSlice = createSlice({
	name: "periodTuition",
	initialState,
	reducers: {
		actionGetPeriodTuions(state) {
			state.getPeriodTuitionsStatus = "idle";
		},
		actionGetPeriodTuion(state) {
			state.getPeriodTuitionStatus = "idle";
		},
		actionAddPeriodTuion(state) {
			state.addPeriodTuitionStatus = "idle";
		},
		actionResetUpdatePeriodTuion(state) {
			state.updatePeriodTuitionStatus = "idle";
		},
		actionSetAddPeriodtuitionStateIdle(state) {
			state.addPeriodTuitionStatus = "idle";
		},
		actionDeletePeriodTuion(state){
			state.deletePeriodTuitionStatus = "idle";
		}

	},
	extraReducers: (builder) => {
		builder
			.addCase(actionGetPeriodTuion.pending, (state) => {
				state.getPeriodTuitionStatus = "loading";
			})
			.addCase(actionGetPeriodTuion.fulfilled, (state, action) => {
				state.getPeriodTuitionStatus = "success";
				state.periodTuition = action.payload as PeriodTuitionType;
			})
			.addCase(actionGetPeriodTuion.rejected, (state) => {
				state.getPeriodTuitionStatus = "error";
				notification.error({ message: "Lấy thông tin chu kỳ học phí thất bại!" });
			})

			.addCase(actionGetPeriodTuions.pending, (state) => {
				state.getPeriodTuitionsStatus = "loading";
			})
			.addCase(actionGetPeriodTuions.fulfilled, (state, action) => {
				state.getPeriodTuitionsStatus = "success";
				state.periodTuitions = action.payload as GetResponseType<PeriodTuitionType>;
			})
			.addCase(actionGetPeriodTuions.rejected, (state) => {
				state.getPeriodTuitionsStatus = "error";
				notification.error({ message: "Lấy DS chu kỳ học phí thất bại!" });
			})

			.addCase(actionAddPeriodTuion.pending, (state) => {
				state.addPeriodTuitionStatus = "loading";
			})
			.addCase(actionAddPeriodTuion.fulfilled, (state) => {
				state.addPeriodTuitionStatus = "success";
				notification.success({ message: "Thêm chu kỳ học phí thành công!" });
			})
			.addCase(actionAddPeriodTuion.rejected, (state) => {
				state.addPeriodTuitionStatus = "error";
				notification.error({ message: "Thêm chu kỳ học phí thất bại!" });
			})

			.addCase(actionUpdatePeriodTuion.pending, (state) => {
				state.updatePeriodTuitionStatus = "loading";
			})
			.addCase(actionUpdatePeriodTuion.fulfilled, (state) => {
				state.updatePeriodTuitionStatus = "success";
				notification.success({ message: "Cập nhật chu kỳ học phí thành công!" });
			})
			.addCase(actionUpdatePeriodTuion.rejected, (state) => {
				state.updatePeriodTuitionStatus = "error";
				notification.error({ message: "Cập nhật chu kỳ học phí thất bại!" });
			})

			.addCase(actionDeletePeriodTuion.pending, (state) => {
				state.deletePeriodTuitionStatus = "loading";
			})
			.addCase(actionDeletePeriodTuion.fulfilled, (state) => {
				state.deletePeriodTuitionStatus = "success";
				notification.success({ message: "Đã xoá chu kỳ học phí" });
			})
			.addCase(actionDeletePeriodTuion.rejected, (state) => {
				state.deletePeriodTuitionStatus = "error";
				notification.error({ message: "Xoá chu kỳ học phí thất bại!" });
			});
	},
});

export const { actionSetAddPeriodtuitionStateIdle, actionResetUpdatePeriodTuion } = periodTuitionSlice.actions;

export default periodTuitionSlice.reducer;
