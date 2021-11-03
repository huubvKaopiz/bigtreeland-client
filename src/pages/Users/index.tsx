import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout, notification, Space, Spin, Table } from "antd";
import UserService from "api/user.service";
import { get } from "lodash";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchUsers } from "store/users/slice";
import { RootState, useAppDispatch } from "store/store";
import { AddNewUser, PasswordFormProps, User } from "utils/interfaces";
import AddNewUserForm from "./AddNewUserForm";
import ChangePassForm from "./changePassForm";
import ChangePermisstion from "./ChangePermisstion";
import { UserType } from "interface";
import useIsMounted from "hooks/useIsMounted";

const userTableData: User[] = [
	{
		email: "nhamtkdh92@gmail.com",
		phone: "0987654321",
		role: "admin",
	},
	{
		email: "coffee.sua@gmail.com",
		phone: "123456789",
		role: "teacher",
	},
	{
		email: "huubuivan@gmail.com",
		phone: "1345282122",
		role: "parent",
	},
];

export default function Users(): JSX.Element {
	const dispatch = useAppDispatch();
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState(userTableData);
	const [filterValue, setFilterValue] = useState("");
	const isMounted = useIsMounted();

	// useEffect(() => {
	// 	UserService.getMe().then(console.log).catch(console.log).finally();
	// }, []);

	useEffect(() => {
		setLoading(true);
		dispatch(fetchUsers({}))
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
	}, [dispatch, isMounted]);

	function handleTableFilter(e: BaseSyntheticEvent) {
		const currentFiltervalue = e.target.value;
		setFilterValue(currentFiltervalue);
		const filteredUserTableData = userTableData.filter(
			(entry: User) =>
				entry.email.includes(currentFiltervalue) ||
				entry.phone.includes(currentFiltervalue) ||
				entry.role.includes(currentFiltervalue)
		);
		setDataSource(filteredUserTableData);
	}

	function handleChangePass(user: User, passwordForm: PasswordFormProps) {
		setLoading(true);
		UserService.changePassword({
			email: user.email,
			oldPassword: passwordForm.old_password,
			newPassword: passwordForm.new_password,
		})
			.then(() => {
				notification.success({
					message: "Đổi mật khẩu thành công!",
				});
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => setLoading(false));
	}

	function handleDeactive(user: User) {
		setLoading(true);
		UserService.deactiveUser({ email: user.email })
			.then(() => {
				notification.success({
					message: `Vô hiệu hoá tài khoản ${user.email} thành công!`,
				});
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => isMounted && setLoading(false));
	}

	function handleSetPermission(user: User, permissionList: number[]) {
		console.log(user.email);
		console.log(permissionList);
	}

	function handleAddNewUser(userValue: AddNewUser) {
		setLoading(true);
		UserService.createUser({ ...userValue })
			.then(() => {
				notification.success({
					message: "Tạo người dùng mới thành công!",
				});
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => isMounted.current && setLoading(false));
	}

	const ColActions = (user: User) => {
		return (
			<Space size="middle">
				<ChangePassForm user={user} handleChangePass={(user, passwordForm) => handleChangePass(user, passwordForm)} />
				<Button size="small" danger onClick={() => handleDeactive(user)}>
					Vô hiệu hoá
				</Button>
				<ChangePermisstion
					user={user}
					handleChangePermission={(user, permissionList) => handleSetPermission(user, permissionList)}
				></ChangePermisstion>
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	function getProfileUser(user: UserType) {
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
			render: (user: UserType) => {
				return <span>{get(getProfileUser(user), "phone", "")}</span>;
			},
		},
		{
			width: "20%",
			title: "Role",
			// dataIndex: "roles.0.name",
			key: "role",
			// eslint-disable-next-line react/display-name
			render: (user: UserType) => {
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
						value={filterValue}
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
