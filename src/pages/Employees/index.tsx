import { Button, Col, Input, Layout, Radio, Row, Space, Table, Tag, Tooltip, Modal } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { EmployeeType, UserType } from "interface";
import { debounce, get } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { actionDeleteEmployee, actionGetEmployees } from "store/employees/slice";
import { actionGetRoles } from "store/roles/slice";
import { RootState, useAppDispatch } from "../../store/store";
import AddEmplyeeForm from "./addEmployeeFrom";
import UpdateEmplyeeForm from "./updateEmployee";

const { confirm } = Modal;

function Employees(): JSX.Element {
	const dispatch = useAppDispatch();

	const [page, setPage] = useState(0)
	const [search, setSearch] = useState('')
	const [role, setRole] = useState('teacher')


	const roles = useSelector((state: RootState) => state.roleReducer.roles);
	const employees = useSelector((state: RootState) => state.employeeReducer.employees);
	const getEmployeesStatus = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);
	const statusUpdateEmployee = useSelector((state: RootState) => state.employeeReducer.updateEmployeeStatus)
	const debounceSearch = useRef(debounce((nextValue) => dispatch(actionGetEmployees({ search: nextValue, role_name: role })), 500)).current;

	useEffect(() => {
		dispatch(actionGetEmployees({ per_page: 100, search, role_name: role }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, role]);

	useEffect(() => {
		if (statusUpdateEmployee === 'success') {
			dispatch(actionGetEmployees({ per_page: 100, search, role_name: role }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, statusUpdateEmployee, role])

	useEffect(() => {
		dispatch(actionGetRoles());
	}, [dispatch]);

	const handleSearch = (search: string) => {
		setSearch(search)
		debounceSearch(search);
	};


	function handleChangeRole(e: any) {
		setRole(e.target.value);
		// console.log(e.target.value)
	}

	function handleDelete(emp: EmployeeType) {
		confirm({
			title: "Bạn muốn xoá nhân viên này!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				dispatch(actionDeleteEmployee(emp.id)).finally(() => {
					dispatch(actionGetEmployees({ per_page: 100, role_name: role }));
				})
			}
		})
	}

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
			render: function ColActionn(text: string, record: EmployeeType): JSX.Element {
				return (
					<Space size="middle">
						<UpdateEmplyeeForm employee={record} roles={roles} />
						<Tooltip placement="top" title="Xoá nhân viên">
							<Button type="link" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
						</Tooltip>
					</Space>
				)
			}
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input allowClear onChange={({ target: input }) => handleSearch(input.value)} />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm roles={roles} selectedRole={role} />
				</Col>
			</Row>
			<Space style={{ marginBottom: 20 }}>
				<Radio.Group onChange={handleChangeRole} value={role}>
					<Radio value={'teacher'}>Giáo viên</Radio>
					<Radio value={'teacher2'}>Giáo viên(2)</Radio>
					<Radio value={'sale'}>Sale</Radio>
					<Radio value={''}>Tẩt cả</Radio>
				</Radio.Group>
			</Space>
			<Table
				loading={getEmployeesStatus === "loading"}
				size="small"
				dataSource={get(employees, "data", [])}
				rowKey="id"
				columns={columns}
				bordered
				pagination={{
					pageSize: 20, total: get(employees, "total", 0), onChange: (page) => {
						setPage(page);
					},
				}}
			/>
		</Layout.Content>
	);
}

export default Employees;
