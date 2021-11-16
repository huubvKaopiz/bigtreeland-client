import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import { Button, Col, Input, Layout, Row, Space, Table, Tag } from "antd";
import { EmployeeContractType, EmployeeType, UserType } from "interface";
import UpdateEmplyeeForm from "./updateEmployee";
import AddEmplyeeForm from "./addEmployeeFrom";
import DeleteEmployeeModal from "./deleteEmployee";
import { useSelector } from "react-redux";
import { actionGetEmployees } from "store/employees/slice";
import { get, toLength } from "lodash";

function Employees(): JSX.Element {
	const dispatch = useAppDispatch();
	const [search, setSearch] = useState("");
	const status = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);

	useEffect(() => {
		if (search.length >= 3 || status === "idle") {
			dispatch(actionGetEmployees({}));
		}
	}, [dispatch, search, status]);

	const employees = useSelector((state: RootState) => state.employeeReducer.employees);

	const ColActions = (text: string, record: EmployeeType) => {
		return (
			<Space size="middle">
				<UpdateEmplyeeForm employee={record} />
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
			dataIndex: "user",
			key: "phone",
			render: function PhoneCol(user: UserType): JSX.Element {
				return <span>{get(user, "phone", "")}</span>;
			},
		},
		{
			width: "10%",
			title: "Ngày sinh",
			dataIndex: "birthday",
			key: "birthday",
		},
		{
			width: "5%",
			title: "Giới tính",
			dataIndex: "gender",
			key: "gender",
			align: "center" as any,
			render: function GenderCol(gender: number): JSX.Element {
				console.log(gender);
				return <span>{gender === 0 ? "Nữ" : "Nam"}</span>;
			},
		},
		{
			width: "25%",
			title: "Địa chỉ",
			dataIndex: "address",
			key: "address",
		},
		{
			width: "10%",
			title: "Vị trí",
			dataIndex: "user",
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
		<Layout.Content style={{ height: 1000 }}>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onChange={({ target: input }) => setSearch(input.value)} />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm />
				</Col>
			</Row>
			<Table size="small" dataSource={get(employees, "data", [])} rowKey="id" columns={columns} bordered />
		</Layout.Content>
	);
}

export default Employees;
