import { Col, Input, Layout, Row, Space, Table } from "antd";
import { get } from "lodash";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionGetEmployees } from "store/employees/slice";
import { RootState } from "../../store/store";
import AddEmplyeeForm from "./addEmployeeFrom";
import DeleteEmployeeModal from "./deleteEmployee";
import UpdateEmplyeeForm from "./updateEmployee";



function Employees(): JSX.Element {
	const dispatch = useDispatch();
	const ColActions = (/*employee: Employee*/) => {
		return (
			<Space size="middle">
				<UpdateEmplyeeForm />
				<DeleteEmployeeModal />
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	useEffect(() => {
		dispatch(actionGetEmployees({}));
	}, [dispatch]);

	const employees = useSelector((state: RootState) => state.employeeReducer.employees);

	console.log(employees);

	// const dataSource: Employee[] = [
	// 	{
	// 		name: "Tran Thi Nham",
	// 		birthday: "26/03/1992",
	// 		address: "101E1 Thanh Xuan Bac Thanh Xuan HN",
	// 		phone: "0363723154",
	// 		gender: 0,
	// 		interests: "",
	// 		dislikes: "",
	// 	},
	// 	{
	// 		name: "Tran Thi Nham",
	// 		birthday: "26/03/1992",
	// 		address: "101E1 Thanh Xuan Bac Thanh Xuan HN",
	// 		phone: "0363723154",
	// 		gender: 0,
	// 		interests: "",
	// 		dislikes: "",
	// 	},
	// 	{
	// 		name: "Tran Thi Nham",
	// 		birthday: "26/03/1992",
	// 		address: "101E1 Thanh Xuan Bac Thanh Xuan HN",
	// 		phone: "0363723154",
	// 		gender: 0,
	// 		interests: "",
	// 		dislikes: "",
	// 	},
	// ];

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
		},
		{
			width: "15%",
			title: "Số điện thoại",
			dataIndex: "phone",
			key: "phone",
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
		},
		{
			width: "30%",
			title: "Địa chỉ",
			dataIndex: "address",
			key: "address",
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
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm />
				</Col>
			</Row>
			<Table size="small" dataSource={get(employees, "data", [])} columns={columns} bordered />
		</Layout.Content>
	);
}

export default Employees;
