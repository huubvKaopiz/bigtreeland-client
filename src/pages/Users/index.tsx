import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, Space, Spin, Table } from "antd";
import { UserType as User } from "interface";
import { AddNewUser } from "interface/interfaces";
import { get } from "lodash";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import {
	actionAddUser,
	actionChangePassworfOfUser,
	actionDeactiveUser,
	actionGetUsers,
	actionResetStatusDeactiveUser,
	actionSetPermissionsForUser,
} from "store/users/slice";
import AddNewUserForm from "./AddNewUserForm";
import ChangePassword from "./ChangePassword";
import ChangePermisstion from "./ChangePermisstion";

export default function Users(): JSX.Element {
	const dispatch = useAppDispatch();
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [search, setSearch] = useState("");
	const status = useSelector((state: RootState) => state.userReducer.statusGetUser);
	const statusDeactiveUser = useSelector((state: RootState) => state.userReducer.statusDeactiveUser);

	useEffect(() => {
		if (statusDeactiveUser === "success") {
			dispatch(actionGetUsers({}));
			dispatch(actionResetStatusDeactiveUser());
			return;
		}
		dispatch(actionGetUsers({ search }));
	}, [dispatch, search, statusDeactiveUser]);

	function handleTableFilter(e: BaseSyntheticEvent) {
		setSearch(e.target.value);
	}

	function handleChangePass(payload: { new_password: string; user_id: number }) {
		dispatch(actionChangePassworfOfUser(payload));
	}

	function handleDeactive(user: User) {
		dispatch(actionDeactiveUser(+user.id));
	}

	function handleSetPermission(user: User, newPermissionList: number[], oldPermissionList: number[]) {
		const listPermissionAdded = newPermissionList.filter((permission) => !oldPermissionList.includes(permission));
		const listPermissionRemoved = oldPermissionList.filter((permission) => !newPermissionList.includes(permission));
		dispatch(
			actionSetPermissionsForUser({
				user_id: +user.id,
				permission_add_ids: listPermissionAdded,
				permission_delete_ids: listPermissionRemoved,
			})
		);
	}

	function handleAddNewUser(userValue: AddNewUser) {
		dispatch(actionAddUser(userValue));
	}

	function getProfileUser(user: User) {
		if (!user) return null;
		if (user.employee) return user.employee;
		if (user.parent) return user.parent;
		return null;
	}

	const ColActions = (user: User) => {
		return (
			<Space size="middle">
				<ChangePassword userId={+user.id} handleChangePass={handleChangePass} />
				<Button size="small" danger onClick={() => handleDeactive(user)}>
					Vô hiệu hoá
				</Button>
				<ChangePermisstion user={user} handleChangePermission={handleSetPermission}></ChangePermisstion>
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	const columns = [
		{
			width: "25%",
			title: "Email",
			dataIndex: "email",
			key: "email",
			// eslint-disable-next-line react/display-name
			render: (_: any, user: User) => {
				return <span>{get(getProfileUser(user), "email", "")}</span>;
			},
		},
		{
			width: "20%",
			title: "Phone",
			key: "phone",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{user.phone}</span>;
			},
		},
		{
			width: "20%",
			title: "Role",
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
			<Spin spinning={status === "loading"}>
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
					pagination={{ pageSize: 20 }}
					size="small"
				/>
			</Spin>
		</Layout.Content>
	);
}
