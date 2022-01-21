import { MinusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, Radio, Space, Spin, Table, Tag, Tooltip } from "antd";
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

	function onChangeListFilter(e:any){
		console.log(e.target.value)
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

				<ChangePermisstion
					user={user}
					handleChangePermission={handleSetPermission}
				/>
				<Tooltip placement="top" title="Vô hiệu hoá tài khoản">
					<Button
						type="link"
						icon={<MinusCircleOutlined />}
						danger
						onClick={() => handleDeactive(user)}
					/>
				</Tooltip>
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	const columns = [
		{
			width: "30%",
			title: "Name",
			key: "name",
			// eslint-disable-next-line react/display-name
			render: (user: User) => {
				return <strong>{get(user, "profile.name", "")}</strong>;
			},
		},
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
			render: (text: string, record: User) => {
				return <>
					{get(record, "roles", []).map((role) => <Tag color="orange" key={role.id}>{role.name}</Tag>)}
				</>
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
				<Radio.Group defaultValue={1} onChange={onChangeListFilter} style={{marginBottom:20, marginTop:20}}>
					<Radio value={1}>Đang kích hoạt</Radio>
					<Radio value={2}>Vô hiệu hoá</Radio>
				</Radio.Group>
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
