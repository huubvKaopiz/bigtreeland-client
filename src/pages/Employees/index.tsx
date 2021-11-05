import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Button, Col, Input, Layout, Row, Space, Table } from "antd";
import { EmployeeContractType, EmployeeType } from "interface";
import UpdateEmplyeeForm from "./updateEmployee";
import AddEmplyeeForm from "./addEmployeeFrom";
import DeleteEmployeeModal from "./deleteEmployee";
import { useDispatch, useSelector } from "react-redux";
import { actionGetEmployees, actionAddEmployee, EmployeeParams } from "store/employees/slice";
import { get } from "lodash";

function Employees(): JSX.Element {
	const dispatch = useDispatch();
	const ColActions = (text:string, record:EmployeeType) => {
		return (
			<Space size="middle">
				<UpdateEmplyeeForm employee={record} />
				<DeleteEmployeeModal />
			</Space>
		);
	};
	ColActions.displayName = "ColActions";

	useEffect(() => {
		dispatch(actionGetEmployees({}));
	}, [dispatch]);

	const handleAddEmployee = (params:EmployeeParams) => {
		dispatch(actionAddEmployee(params));
	}

	const employees = useSelector((state: RootState) => state.employeeReducer.employees);

	console.log(employees);

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function NameCol(name:string):JSX.Element {
				return(
				<Button type="link">{name}</Button>
				)
			}
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
			dataIndex: "birthday",
			key: "birthday",
		},
		{
			width: "5%",
			title: "Giới tính",
			dataIndex: "gender",
			key: "gender",
			align:"center" as any,
			render: function GenderCol(gender:number):JSX.Element {
				return(
				<span>{gender === 0 ? 'Nữ' : 'Nam'}</span>
				)
			}
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
			dataIndex: "employee_contract",
			key: "employee_contract",
			render: function PositionCol(contract:EmployeeContractType):JSX.Element {
				return(
				<span>{contract.position}</span>
				)
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
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm handleSubmit = {handleAddEmployee}/>
				</Col>
			</Row>
			<Table size="small" dataSource={get(employees, "data", [])} columns={columns} bordered />
		</Layout.Content>
	);
}

export default Employees;
