import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { RoleCreateFormType, RoleType } from "interface";
import { get } from "lodash";
import request from "../../utils/request";

export interface RoleState {
	roles: RoleType[] | [];
	roleInfo: RoleType | null;
	statusCreateRole: "idle" | "loading" | "success" | "error";
	statusGetRole: "idle" | "loading" | "success" | "error";
	statusGetRoleInfo: "idle" | "loading" | "success" | "error";
	statusDeleteRole: "idle" | "loading" | "success" | "error";
	statusUpdateRole: "idle" | "loading" | "success" | "error";
}

const initialState: RoleState = {
	roles: [],
	roleInfo: null,
	statusGetRoleInfo: "idle",
	statusCreateRole: "idle",
	statusGetRole: "idle",
	statusDeleteRole: "idle",
	statusUpdateRole: "idle",
};

export const actionGetRoleInfo = createAsyncThunk(
	"actionGetRoleInfo",
	async (id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/roles/${id}`,
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionGetRoles = createAsyncThunk(
	"actionGetRoles",
	async (id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: (id && `/api/roles/${id}`) || "/api/roles",
				method: "get",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionDeleteRoles = createAsyncThunk(
	"actionDeleteRoles",
	async (id: number, { rejectWithValue }) => {
		try {
			const response = await request({
				url: `/api/roles/${id}`,
				method: "delete",
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionCreateRole = createAsyncThunk(
	"actionCreateRole",
	async (data: RoleCreateFormType, { rejectWithValue }) => {
		try {
			const createRoleResponse = await request({
				url: "/api/roles",
				method: "post",
				data: { name: data.name, description: data.description },
			});

			const role_id = createRoleResponse.data as { id: number };

			if (data.user_ids.length > 0) {
				await request({
					url: "/api/roles/set-role-for-list-user",
					method: "post",
					data: {
						role_id: role_id.id,
						add_user_ids: data.user_ids,
						remove_user_ids: [],
					},
				});
			}
			if (data.permission_ids.length > 0) {
				await request({
					url: "/api/permissions/set-permission-for-role",
					method: "post",
					data: {
						role_id: role_id.id,
						permission_add_ids: data.permission_ids,
						permission_delete_ids: [],
					},
				});
			}
			return createRoleResponse.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionSetRoleForUsers = createAsyncThunk(
	"actionSetRoleForUsers",
	async (
		data: {
			role_id: number;
			add_user_ids: number[];
			remove_user_ids: number[];
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await request({
				url: "/api/roles/set-role-for-list-user",
				method: "post",
				data,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateRole = createAsyncThunk(
	"actionUpdateRole",
	async (data: any, { rejectWithValue }) => {
		try {
			let actionUpdateRole;
			if (data.role_name)
				actionUpdateRole = await request({
					url: `/api/roles/${data.role_id}`,
					method: "put",
					data: { name: data.role_name },
				});

			if (data.add_user_ids || data.remove_users_ids) {
				actionUpdateRole = await request({
					url: "/api/roles/set-role-for-list-user",
					method: "post",
					data: {
						role_id: data.role_id,
						add_user_ids: data.add_user_ids,
						remove_users_ids: data.remove_users_ids,
					},
				});
			}
			if (data.permission) {
				actionUpdateRole = await request({
					url: "/api/permissions/set-permission-for-role",
					method: "post",
					data: {
						role_id: data.role_id,
						permission_add_ids: data.permission.added,
						permission_delete_ids: data.permission.removed,
					},
				});
			}

			return actionUpdateRole?.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const actionUpdateSettingMenuOfRole = createAsyncThunk(
	"actionUpdateSettingMenuOfRole",
	async (data: { role_id: number; menues: number[] }, { rejectWithValue }) => {
		try {
			const actionUpdateRole = await request({
				url: `/api/roles/${data.role_id}`,
				method: "put",
				data: { menues: data.menues },
			});

			return actionUpdateRole.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const slice = createSlice({
	name: "roles",
	initialState,
	reducers: {
		actionResetStatusGetRole(state) {
			state.statusGetRole = "idle";
		},
		actionResetStatusCreateRole(state) {
			state.statusCreateRole = "idle";
		},
		actionResetStatusDeleteRole(state) {
			state.statusDeleteRole = "idle";
		},
		actionResetStatusUpdateRole(state) {
			state.statusUpdateRole = "idle";
		},
		actionSetRoleForUsers(state) {
			state.statusUpdateRole = "idle";
		},
	},

	extraReducers: (builder) => {
		builder
			//Get Roles
			.addCase(actionGetRoles.fulfilled, (state, action) => {
				state.roles = action.payload as RoleType[];
				state.statusGetRole = "success";
			})
			.addCase(actionGetRoles.pending, (state) => {
				state.statusGetRole = "loading";
			})
			.addCase(actionGetRoles.rejected, (state, action) => {
				state.statusGetRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//Get RoleInfo
			.addCase(actionGetRoleInfo.fulfilled, (state, action) => {
				state.roleInfo = action.payload as RoleType;
				state.statusGetRoleInfo = "success";
			})
			.addCase(actionGetRoleInfo.pending, (state) => {
				state.statusGetRoleInfo = "loading";
			})
			.addCase(actionGetRoleInfo.rejected, (state, action) => {
				state.statusGetRoleInfo = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			//Create role
			.addCase(actionCreateRole.pending, (state) => {
				state.statusCreateRole = "loading";
			})
			.addCase(actionCreateRole.fulfilled, (state) => {
				state.statusCreateRole = "success";
				notification.success({ message: "Tạo vai trò mới thành công!" });
			})
			.addCase(actionCreateRole.rejected, (state, action) => {
				state.statusCreateRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// Delete Row
			.addCase(actionDeleteRoles.fulfilled, (state) => {
				state.statusDeleteRole = "success";
				notification.success({ message: "Xoá vai trò thành công!" });
			})
			.addCase(actionDeleteRoles.pending, (state) => {
				state.statusDeleteRole = "loading";
			})
			.addCase(actionDeleteRoles.rejected, (state, action) => {
				state.statusDeleteRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionSetRoleForUsers.fulfilled, (state) => {
				state.statusDeleteRole = "success";
				notification.success({
					message: "Cập nhật danh sách người dùng thành công!",
				});
			})
			.addCase(actionSetRoleForUsers.pending, (state) => {
				state.statusDeleteRole = "loading";
			})
			.addCase(actionSetRoleForUsers.rejected, (state, action) => {
				state.statusDeleteRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			// updte Row
			.addCase(actionUpdateRole.fulfilled, (state) => {
				state.statusUpdateRole = "success";
				notification.success({
					message: "Cập nhật danh sách quyền thành công!",
				});
			})
			.addCase(actionUpdateRole.pending, (state) => {
				state.statusUpdateRole = "loading";
			})
			.addCase(actionUpdateRole.rejected, (state, action) => {
				state.statusUpdateRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			})

			.addCase(actionUpdateSettingMenuOfRole.fulfilled, (state) => {
				state.statusUpdateRole = "success";
				notification.success({ message: "Cập nhật setting menu thành công!" });
			})
			.addCase(actionUpdateSettingMenuOfRole.pending, (state) => {
				state.statusUpdateRole = "loading";
			})
			.addCase(actionUpdateSettingMenuOfRole.rejected, (state, action) => {
				state.statusUpdateRole = "error";
				const error = action.payload as AxiosError;
				notification.error({
					message: get(error, "response.data", "Có lỗi xảy ra!"),
				});
			});
	},
});
export const {
	actionResetStatusCreateRole,
	actionResetStatusGetRole,
	actionResetStatusDeleteRole,
	actionResetStatusUpdateRole,
} = slice.actions;
export default slice.reducer;
