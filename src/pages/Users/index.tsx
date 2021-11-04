/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, notification, Space, Spin, Table } from "antd";
import UserService from "api/user.service";
import PermissionService from "api/permission.service";
import useIsMounted from "hooks/useIsMounted";
import { UserType as User } from "interface";
import { AddNewUser, PasswordFormProps } from "interface/interfaces";
import { get } from "lodash";
import React, { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { fetchUsers } from "store/users/slice";
import AddNewUserForm from "./AddNewUserForm";
import ChangePassForm from "./changePassForm";
import ChangePermisstion from "./ChangePermisstion";
import { actionGetRoles } from "store/roles/slice";
import { actionGetPermissions } from "store/permissions/slice";

export default function Users(): JSX.Element {
	const dispatch = useAppDispatch();
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [loading, setLoading] = useState(false);
	// dung luon users, ko can dataSource
	const [dataSource, setDataSource] = useState(get(users, "data", []));
	const [filterValue, setFilterValue] = useState("");
	const isMounted = useIsMounted();
	const userLogin = useSelector((state: RootState) => state.auth.user);
	const [search, setSearch] = useState("");

	// const userList = useMemo(() => get(users, "data", []), [users]);

	const roles = useSelector((state: RootState) => state.roleReducer.roles);
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);

	console.log("roles", roles);
	console.log("permissions", permissions);

	// useEffect(() => {
	// 	setDataSource(userList);
	// }, [userList]);

	useEffect(() => {
		dispatch(actionGetRoles());
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetPermissions());
	}, [dispatch]);

	useEffect(() => {
		setLoading(true);
		dispatch(fetchUsers({ search }))
			.then((res) => {
				if (get(res, "error", null)) {
					notification.error({
						message: get(res, "error.message", "Có lỗi xảy ra"),
					});
				}
			})
			.finally(() => {
				isMounted.current && setLoading(false);
			});
	}, [dispatch, isMounted, search]);

	function handleTableFilter(e: BaseSyntheticEvent) {
		setSearch(e.target.value);
	}

	// function checkIsAdminRole() {
	// 	setLoading(true);
	// get Me lay o user login: userLogin
	// console.log(userLogin)
	// 	return UserService.getMe()
	// 		.then(({ data }: any) => {
	// 			const roles: any[] = data.roles;
	// 			const isAdmin = roles.some((role) => role.guard_name === "api" && role.name === "admin");
	// 			if (!isAdmin) {
	// 				notification.error({
	// 					message: "Bạn không có quyền của Admin",
	// 				});
	// 				return Promise.reject();
	// 			}
	// 			return Promise.resolve();
	// 		})
	// 		.catch(() => {
	// 			notification.error({
	// 				message: "Có lỗi xảy ra!",
	// 			});
	// 			return Promise.reject();
	// 		})
	// 		.finally(() => {
	// 			setLoading(false);
	// 		});
	// }

	function handleChangePass(passwordForm: PasswordFormProps, id: string | number | undefined) {
		return UserService.changePasswordOfUser({
			user_id: id,
			new_password: passwordForm.new_password,
		}).catch(() => Promise.reject());

		// cho nay ko can check admin role, call api loi se return ve 403
		// return checkIsAdminRole().then(() => {
		// 	return UserService.changePasswordOfUser({
		// 		user_id: id,
		// 		new_password: passwordForm.new_password,
		// 	}).catch(() => Promise.reject());
		// });
	}

	function handleDeactive(user: User) {
		setLoading(true);
		UserService.deactiveUser(user.id)
			.then(() => {
				notification.success({
					message: `Vô hiệu hoá tài khoản ${user.email} thành công!`,
				});
				return Promise.resolve();
			})
			.then(() => {
				// Huu.bv Todo update lai danh sách user
				dispatch(fetchUsers({}));
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => isMounted && setLoading(false));
	}

	function handleSetPermission(user: User, newPermissionList: number[], oldPermissionList: number[]) {
		setLoading(true);
		const listPermissionAdded = newPermissionList.filter((permission) => !oldPermissionList.includes(permission));
		const listPermissionRemoved = oldPermissionList.filter((permission) => !newPermissionList.includes(permission));
		PermissionService.setPermissionForUser({
			user_id: user.id,
			permission_add_ids: listPermissionAdded,
			permission_delete_ids: listPermissionRemoved,
		})
			.then(() => {
				notification.success({
					message: `Cập nhật quyền cho tài khoản ${user.email} thành công!`,
				});
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => setLoading(false));
	}

	function handleAddNewUser(userValue: AddNewUser) {
		return UserService.createUser({ ...userValue });
	}

	const ColActions = (user: User) => {
		return (
			<Space size="middle">
				<ChangePassForm userId={user.id} handleChangePass={handleChangePass} />
				<Button size="small" danger onClick={() => handleDeactive(user)}>
					Vô hiệu hoá
				</Button>
				<ChangePermisstion user={user} handleChangePermission={handleSetPermission}></ChangePermisstion>
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	function getProfileUser(user: User) {
		if (user.employee) return user.employee;
		if (user.parent) return user.parent;
		return null;
	}

	const columns = [
		{
			width: "25%",
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			width: "20%",
			title: "Phone",
			// dataIndex: "phone",
			key: "phone",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{get(getProfileUser(user), "phone", "")}</span>;
			},
		},
		{
			width: "20%",
			title: "Role",
			// dataIndex: "roles.0.name",
			key: "role",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{get(user, "roles.0.name", "")}</span>;
			},
		},
		{
			width: "35%",
			title: "Action",
			key: "action",
			render: ColActions,
		},
	];

	return (
		<Layout.Content style={{ height: "100vh", padding: 20 }}>
			<Spin spinning={loading}>
				<div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
					<Input
						placeholder="Tìm kiếm thông qua email, phone hoặc role"
						value={search}
						onChange={handleTableFilter}
						prefix={<SearchOutlined />}
					/>
					<div style={{ marginLeft: 20 }}>
						<AddNewUserForm onAddUser={handleAddNewUser} />
					</div>
				</div>
				<Table
					dataSource={get(users, "data", [])}
					columns={columns}
					bordered
					pagination={{ position: ["bottomCenter"], pageSize: 20 }}
					size="small"
				/>
			</Spin>
		</Layout.Content>
	);
}
