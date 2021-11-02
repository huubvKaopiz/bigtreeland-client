import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListUserType } from "interface";
import request from "../../utils/request";

export interface UserReducerState {
	value: number;
	users: ListUserType | null;
}

export interface ParamGetUsers {
	search?: string;
}

const initialState: UserReducerState = {
	value: 0,
	users: null,
};

export const fetchUsers = createAsyncThunk("getUsers", async (params: ParamGetUsers) => {
	const response = await request({
		url: "/api/users",
		method: "get",
		params,
	});
	return response.data;
});

export const counterSlice = createSlice({
	name: "counter",
	initialState,
	reducers: {
		increment: (state) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes
			state.value += 1;
		},
		decrement: (state) => {
			state.value -= 1;
		},
		incrementByAmount: (state, action: PayloadAction<number>) => {
			state.value += action.payload;
		},
	},

	extraReducers: (builder) => {
		builder.addCase(fetchUsers.fulfilled, (state, action) => {
			state.users = action.payload as ListUserType;
		});
	},
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
