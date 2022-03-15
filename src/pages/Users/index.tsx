import { ExclamationCircleOutlined, MinusCircleOutlined, RedoOutlined, SafetyCertificateOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, Modal, Radio, Space, Spin, Table, Tag, Tooltip } from "antd";
import { AddNewUser, UserType as User } from "interface";
import { debounce, get } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import {
	actionAddUser,
	actionChangePassworfOfUser,
	actionDeactiveUser,
	actionGetUsers,
	actionResetStatusDeactiveUser,
	actionRestoreUser,
	actionSetPermissionsForUser
} from "store/users/slice";
import { converRoleNameToVN } from "utils/ultil";
import AddNewUserForm from "./AddNewUserForm";
import ChangePassword from "./ChangePassword";
// import ChangePermisstion from "./ChangePermisstion";

const { confirm } = Modal;

export default function Users(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState('active');
	const status = useSelector(
		(state: RootState) => state.userReducer.statusGetUser
	);
	const statusDeactiveUser = useSelector(
		(state: RootState) => state.userReducer.statusUpdateUserState
	);

	const debounceSearch = useRef(
		debounce(
			(nextValue) => dispatch(actionGetUsers({ search: nextValue })),
			500
		)
	).current;

	useEffect(() => {
		dispatch(actionGetUsers({ page, search, status: statusFilter }));
	}, [dispatch, page, statusFilter]);

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

	function onChangeListFilter(e: any) {
		setStatusFilter(e.target.value)
	}

	// function handleChangePass(payload: {
	// 	new_password: string;
	// 	user_id: number;
	// }) {
	// 	dispatch(actionChangePassworfOfUser(payload));
	// }

	function handleDeactive(user: User) {
		confirm({
			title: "Bạn muốn vô hiệu hoá tài khoản này!",
			icon: <ExclamationCircleOutlined />,
			cancelText:"Huỷ bỏ",
			onOk() {
				dispatch(actionDeactiveUser(user.id)).finally(() => {
					dispatch(actionGetUsers({ per_page: 100, status: 'active' }));
				});
			},
		});
	}

	function handleAddNewUser(userValue: AddNewUser) {
		dispatch(actionAddUser(userValue));
	}

	function handleRestore(user: User) {
		confirm({
			title: "Bạn muốn khôi phục tài khoản này!",
			icon: <ExclamationCircleOutlined />,
			cancelText:"Huỷ bỏ",
			onOk() {
				dispatch(actionRestoreUser(user.id)).finally(() => {
					dispatch(actionGetUsers({ per_page: 100, status: 'deactive' }));
				});
			},
		});
	}

	const ColActions = (user: User) => {
		return (
			<>
				{user.deleted_at === null ?
					<Space>
						{/* <ChangePassword userId={+user.id} handleChangePass={handleChangePass} /> */}
						{/* <ChangePermisstion
							user={user}
							handleChangePermission={handleSetPermission}
						/> */}
						<Tooltip placement="top" title="Phân quyền cho tài khoản">
							<Button
								type="link"
								icon={<SafetyCertificateOutlined />}
								onClick={() => history.push(`/user-set-permissions/${user.id}`)}
							/>
						</Tooltip>
						<Tooltip placement="top" title="Vô hiệu hoá tài khoản">
							<Button
								type="link"
								icon={<MinusCircleOutlined />}
								danger
								onClick={() => handleDeactive(user)}
							/>
						</Tooltip>
					</Space>
					:
					<Tooltip placement="top" title="Khôi phục tài khoản">
						<Button
							type="link"
							icon={<RedoOutlined style={{ color: "#27ae60" }} />}
							danger
							onClick={() => handleRestore(user)}
						/>
					</Tooltip>
				}
			</>
		);
	};
	ColActions.displayName = "ColActions";

	const columns = [
		{
			width: 200,
			title: "Name",
			key: "name",
			render: (user: User) => {
				return <a>{get(user, "profile.name", "")}</a>;
			},
		},
		{
			width: 200,
			title: "Email",
			key: "email",
			render: (user: User) => {
				return <span>{get(user, "profile.email", "")}</span>;
			},
		},

		{
			width: 200,
			title: "Phone",
			key: "phone",
			render: (user: User) => {
				return <span>{user.phone} {user.phone_verified_at === null ? <Tag color="red">Chưa xác thực</Tag> : ""}</span>;
			},
		},
		{
			width: 200,
			title: "Role",
			key: "role",
			render: (text: string, record: User) => {
				return <>
					{get(record, "roles", []).map((role) => <Tag color="blue" key={role.id}>{converRoleNameToVN(role.name)}</Tag>)}
				</>
			},
		},
		{
			title: "Action",
			key: "action",
			render: ColActions,
		},
	];

	return (
		<Layout.Content>
			<Spin spinning={status === "loading"}>
				<Space>
					<Input
						style={{ width: 400 }}
						placeholder="Tìm kiếm thông qua tên, email, hoặc số điện thoại"
						onChange={({ target: input }) => handleTableFilter(input.value)}
						prefix={<SearchOutlined />}
					/>
					<div style={{ marginLeft: 10 }}>
						<AddNewUserForm onAddUser={handleAddNewUser} />
					</div>
				</Space>
				<div>
					<Radio.Group defaultValue={'active'} onChange={onChangeListFilter} style={{ marginBottom: 20, marginTop: 20 }}>
						<Radio value={'active'}>Đang kích hoạt</Radio>
						<Radio value={'deactive'}>Vô hiệu hoá</Radio>
					</Radio.Group>
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
