import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { RoleCreateFormType, RoleType } from "interface";
import request from "../../utils/request";

export interface RoleState {
	roles: RoleType[] | [];
	statusCreateRole: "idle" | "loading" | "success" | "error";
	statusGetRole: "idle" | "loading" | "success" | "error";
	statusDeleteRole: "idle" | "loading" | "success" | "error";
	statusSetPermissionForRole: "idle" | "loading" | "success" | "error";
}

const initialState: RoleState = {
	roles: [],
	statusCreateRole: "idle",
	statusGetRole: "idle",
	statusDeleteRole: "idle",
	statusSetPermissionForRole: "idle",
};

export const actionGetRoles = createAsyncThunk("actionGetRoles", async (id?: number) => {
	const response = await request({
		url: (id && `/api/roles/${id}`) || "/api/roles",
		method: "get",
	});
	return response.data;
});

export const actionDeleteRoles = createAsyncThunk("actionDeleteRoles", async (id: number) => {
	const response = await request({
		url: `/api/roles/${id}`,
		method: "delete",
	});
	return response.data;
});

export const actionCreateRole = createAsyncThunk("actionCreateRole", async (data: RoleCreateFormType) => {
	const createRoleResponse = await request({
		url: "/api/roles",
		method: "post",
		data: { name: data.name },
	});

	const role_id = createRoleResponse.data as { id: number };

	if (data.user_ids.length > 0) {
		await request({
			url: "/api/roles/set-role-for-list-user",
			method: "post",
			data: { role_id: role_id.id, user_ids: data.user_ids },
		});
	}
	if (data.permission_ids.length > 0) {
		await request({
			url: "/api/permissions/set-permission-for-role",
			method: "post",
			data: { role_id: role_id.id, permission_add_ids: data.permission_ids, permission_delete_ids: [] },
		});
	}

	return createRoleResponse.data;
});

export const actionSetPermissionForRole = createAsyncThunk("actionSetPermissionForRole", async (data: any) => {
	const setPermissionForRole = await request({
		url: "/api/permissions/set-permission-for-role",
		method: "post",
		data: { role_id: data.role_id, permission_add_ids: data.added, permission_delete_ids: data.removed },
	});
	return setPermissionForRole.data;
});

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
		actionResetStatusSetPermissionForRole(state) {
			state.statusSetPermissionForRole = "idle";
		},
	},

	extraReducers: (builder) => {
		builder
			//Get Role
			.addCase(actionGetRoles.fulfilled, (state, action) => {
				state.roles = action.payload as RoleType[];
				state.statusGetRole = "success";
			})
			.addCase(actionGetRoles.pending, (state) => {
				state.statusGetRole = "loading";
			})
			.addCase(actionGetRoles.rejected, (state) => {
				state.statusGetRole = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			//Create role
			.addCase(actionCreateRole.pending, (state) => {
				state.statusCreateRole = "loading";
			})
			.addCase(actionCreateRole.fulfilled, (state) => {
				state.statusCreateRole = "success";
				notification.success({ message: "Tạo vai trò mới thành công!" });
			})
			.addCase(actionCreateRole.rejected, (state) => {
				state.statusCreateRole = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			// Delete Row
			.addCase(actionDeleteRoles.fulfilled, (state) => {
				state.statusDeleteRole = "success";
				notification.success({ message: "Xoá một vai trò thành công!" });
			})
			.addCase(actionDeleteRoles.pending, (state) => {
				state.statusDeleteRole = "loading";
			})
			.addCase(actionDeleteRoles.rejected, (state) => {
				state.statusDeleteRole = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			})

			// Delete Row
			.addCase(actionSetPermissionForRole.fulfilled, (state) => {
				state.statusSetPermissionForRole = "success";
				notification.success({ message: "Cập nhật danh sách quyền thành công!" });
			})
			.addCase(actionSetPermissionForRole.pending, (state) => {
				state.statusSetPermissionForRole = "loading";
			})
			.addCase(actionSetPermissionForRole.rejected, (state) => {
				state.statusSetPermissionForRole = "error";
				notification.error({ message: "Có lỗi xảy ra" });
			});
	},
});
export const {
	actionResetStatusCreateRole,
	actionResetStatusGetRole,
	actionResetStatusDeleteRole,
	actionResetStatusSetPermissionForRole,
} = slice.actions;
export default slice.reducer;
