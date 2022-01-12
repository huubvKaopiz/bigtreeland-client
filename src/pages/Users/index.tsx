import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, Space, Spin, Table, Tooltip } from "antd";
import { UserType as User } from "interface";
import { AddNewUser } from "interface/interfaces";
import { debounce, get } from "lodash";
import { useEffect, useRef, useState } from "react";
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
	const [page, setPage] = useState(1);
	const status = useSelector(
		(state: RootState) => state.userReducer.statusGetUser
	);
	const statusDeactiveUser = useSelector(
		(state: RootState) => state.userReducer.statusDeactiveUser
	);

	const debounceSearch = useRef(
		debounce(
			(nextValue) => dispatch(actionGetUsers({ search: nextValue })),
			500
		)
	).current;

	useEffect(() => {
		dispatch(actionGetUsers({ page, search }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, page]);

	useEffect(() => {
		if (statusDeactiveUser === "success") {
			dispatch(actionResetStatusDeactiveUser());
			dispatch(actionGetUsers({ search }));
		}
	}, [dispatch, search, statusDeactiveUser]);

	function handleTableFilter(value: string) {
		setSearch(value);
		debounceSearch(value);
	}

	function handleChangePass(payload: {
		new_password: string;
		user_id: number;
	}) {
		dispatch(actionChangePassworfOfUser(payload));
	}

	function handleDeactive(user: User) {
		dispatch(actionDeactiveUser(+user.id));
	}

	function handleSetPermission(
		user: User,
		newPermissionList: number[],
		oldPermissionList: number[]
	) {
		const listPermissionAdded = newPermissionList.filter(
			(permission) => !oldPermissionList.includes(permission)
		);
		const listPermissionRemoved = oldPermissionList.filter(
			(permission) => !newPermissionList.includes(permission)
		);
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

	const ColActions = (user: User) => {
		return (
			<Space size="middle">
				<ChangePassword userId={+user.id} handleChangePass={handleChangePass} />
				<Tooltip placement="top" title="Vô hiệu hoá tài khoản">
					<Button
						type="link"
						icon={<DeleteOutlined />}
						danger
						onClick={() => handleDeactive(user)}
					/>
				</Tooltip>
				<ChangePermisstion
					user={user}
					handleChangePermission={handleSetPermission}
				></ChangePermisstion>
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	const columns = [
		{
			width: "30%",
			title: "Email",
			key: "email",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{get(user, "profile.email", "")}</span>;
			},
		},
		{
			width: "30%",
			title: "Name",
			key: "name",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{get(user, "profile.name", "")}</span>;
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
			width: "10%",
			title: "Role",
			key: "role",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <span>{get(user, "roles.0.name", "")}</span>;
			},
		},
		{
			width: "10%",
			title: "Action",
			key: "action",
			render: ColActions,
		},
	];

	return (
		<Layout.Content>
			<Spin spinning={status === "loading"}>
				<div
					style={{
						marginBottom: 20,
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<Input
						placeholder="Tìm kiếm thông qua email, phone hoặc role"
						onChange={({ target: input }) => handleTableFilter(input.value)}
						prefix={<SearchOutlined />}
					/>
					<div style={{ marginLeft: 20 }}>
						<AddNewUserForm onAddUser={handleAddNewUser} />
					</div>
				</div>
				<Table
					rowKey="id"
					dataSource={get(users, "data", [])}
					columns={columns}
					bordered
					pagination={{
						pageSize: 20,
						total: get(users, "total", 0),
						onChange: (page) => {
							setPage(page);
						},
					}}
					size="small"
				/>
			</Spin>
		</Layout.Content>
	);
}
