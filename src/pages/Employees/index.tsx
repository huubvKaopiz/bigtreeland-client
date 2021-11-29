import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import { Button, Col, Input, Layout, Row, Space, Table, Tag } from "antd";
import { EmployeeType, UserType } from "interface";
import UpdateEmplyeeForm from "./updateEmployee";
import AddEmplyeeForm from "./addEmployeeFrom";
import DeleteEmployeeModal from "./deleteEmployee";
import { useSelector } from "react-redux";
import { actionGetEmployees } from "store/employees/slice";
import { get } from "lodash";
import { actionGetRoles } from "store/roles/slice";

function Employees(): JSX.Element {
	const dispatch = useAppDispatch();
	const roles = useSelector((state: RootState) => state.roleReducer.roles);
	const employees = useSelector((state: RootState) => state.employeeReducer.employees);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		dispatch(actionGetEmployees({})).finally(() => setLoading(false));
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetRoles());
	}, [dispatch]);

	const handleSearch = (search: string) => {
		// dispatch(actionGetEmployees({search}));
	};

	const ColActions = (text: string, record: EmployeeType) => {
		return (
			<Space size="middle">
				<UpdateEmplyeeForm employee={record} roles={roles} />
				<DeleteEmployeeModal employee={record} />
			</Space>
		);
	};
	ColActions.displayName = "ColActions";
	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function NameCol(name: string): JSX.Element {
				return <Button type="link">{name}</Button>;
			},
		},
		{
			width: "10%",
			title: "Số điện thoại",
			dataIndex: "phone",
			key: "phone",
		},
		{
			width: "10%",
			title: "Ngày sinh",
			key: "birthday",
			render: function col(user: UserType): JSX.Element {
				return <span>{get(user, "profile.birthday", "")}</span>;
			},
		},
		{
			width: "5%",
			title: "Giới tính",
			key: "gender",
			align: "center" as any,
			render: function col(user: UserType): JSX.Element {
				return <span>{get(user, "profile.gender", "") === 0 ? "Nữ" : "Nam"}</span>;
			},
			// render: function GenderCol(gender: number): JSX.Element {
			// 	return <span>{gender === 0 ? "Nữ" : "Nam"}</span>;
			// },
		},
		{
			width: "25%",
			title: "Địa chỉ",
			key: "address",
			render: function col(user: UserType): JSX.Element {
				return <span>{get(user, "profile.address", "")}</span>;
			},
		},
		{
			width: "10%",
			title: "Vị trí",
			key: "employee_contract",
			render: function PhoneCol(user: UserType): JSX.Element {
				return (
					<>
						{get(user, "roles", []).map((role: { name: string; id: number }) => {
							return (
								<Tag color="blue" key={role.id}>
									{role.name}
								</Tag>
							);
						})}
					</>
				);
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: ColActions,
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onSearch={(e) => handleSearch(e)} />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm roles={roles} />
				</Col>
			</Row>
			<Table
				loading={loading}
				size="small"
				dataSource={get(employees, "data", [])}
				rowKey="id"
				columns={columns}
				bordered
			/>
		</Layout.Content>
	);
}

export default Employees;
