import { EditOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
	Button,
	Col,
	Input,
	Layout,
	Radio,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip
} from "antd";
import { EmployeeType, RoleType, User, UserType } from "interface";
import { debounce, get } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
	// actionDeleteEmployee,
	actionGetEmployees
} from "store/employees/slice";
import { actionGetRoles } from "store/roles/slice";
import { ROLE_NAMES } from "utils/const";
import { converRoleNameToVN } from "utils/ultil";
import { RootState, useAppDispatch } from "../../store/store";
import AddEmplyeeForm from "./addEmployeeFrom";
import UpdateEmplyeeForm from "./updateEmployee";

// const { confirm } = Modal;

function Employees(): JSX.Element {
	const dispatch = useAppDispatch();

	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [role, setRole] = useState(ROLE_NAMES.TEACHER);
	const [showEdit, setShowEdit] = useState(false);
	const [editIndex, setEditIndex] = useState(-1);

	const roles = useSelector((state: RootState) => state.roleReducer.roles);
	const employees = useSelector(
		(state: RootState) => state.employeeReducer.employees
	);
	const getEmployeesStatus = useSelector(
		(state: RootState) => state.employeeReducer.getEmployeesStatus
	);
	const statusUpdateEmployee = useSelector(
		(state: RootState) => state.employeeReducer.updateEmployeeStatus
	);
	const debounceSearch = useRef(
		debounce(
			(nextValue) =>
				dispatch(actionGetEmployees({ search: nextValue, role_name: role })),
			500
		)
	).current;

	useEffect(() => {
		dispatch(actionGetEmployees({ per_page: 100, search, role_name: role }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, role]);

	useEffect(() => {
		if (statusUpdateEmployee === "success") {
			dispatch(actionGetEmployees({ per_page: 100, search, role_name: role }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, statusUpdateEmployee, role]);

	useEffect(() => {
		dispatch(actionGetRoles(0));
	}, [dispatch]);

	const handleSearch = (search: string) => {
		setSearch(search);
		debounceSearch(search);
	};

	function handleChangeRole(value: any) {
		setRole(value);
		// console.log(e.target.value)
	}

	function handleEdit(index: number) {
		setShowEdit(true);
		setEditIndex(index);
	}

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			key: "name",
			render: function NameCol(user: User): JSX.Element {
				return <Button type="link">{get(user, "profile.name", "")}</Button>;
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
				const birthday = get(user, "profile.birthday", null)
				const birthdayLabel = birthday ? moment(birthday).format('DD-MM-YYYY') : ''
				return <span>{birthdayLabel}</span>;
			},
		},
		{
			width: "5%",
			title: "Giới tính",
			key: "gender",
			align: "center" as any,
			render: function col(user: UserType): JSX.Element {
				return (
					<span>{get(user, "profile.gender", "") === 0 ? "Nữ" : "Nam"}</span>
				);
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
			title: "Vai trò",
			key: "employee_contract",
			render: function PhoneCol(user: UserType): JSX.Element {
				return (
					<>
						{get(user, "roles", []).map(
							(role: { name: string; id: number }) => {
								return (
									<Tag color="blue" key={role.id}>
										{converRoleNameToVN(role.name as ROLE_NAMES)}
									</Tag>
								);
							}
						)}
					</>
				);
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ColActionn(
				text: string,
				record: EmployeeType,
				index: number
			): JSX.Element {
				return (
					<Space size="middle">
						<Tooltip placement="top" title="Sửa thông tin">
							<Button
								type="link"
								icon={<EditOutlined />}
								onClick={() => handleEdit(index)}
							/>
						</Tooltip>
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col>
					<Input
						style={{ width: 300, marginRight: 15 }}
						allowClear
						placeholder='Tìm theo tên hoặc số điện thoại...'
						onChange={({ target: input }) => handleSearch(input.value)}
					/>
				</Col>
				<Col>
					<Select style={{ width: 200 }} placeholder="Lọc theo vai trò" onChange={handleChangeRole}>
						{roles.map((role: RoleType) => {
							return (
								role.name !== ROLE_NAMES.PARENT &&
								<Select.Option key={role.id} value={role.name}>
									<span>{converRoleNameToVN(role.name as ROLE_NAMES)}</span>
								</Select.Option>
							);
						})}
					</Select>
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddEmplyeeForm roles={roles} selectedRole={role} />
				</Col>
			</Row>
			<Table
				loading={getEmployeesStatus === "loading"}
				size="small"
				dataSource={get(employees, "data", [])}
				rowKey="id"
				columns={columns}
				bordered
				pagination={{
					pageSize: 20,
					total: get(employees, "total", 0),
					onChange: (page) => {
						setPage(page);
					},
				}}
			/>
			<UpdateEmplyeeForm employee={get(employees, "data", [])[editIndex]} roles={roles} show={showEdit} setShow={setShowEdit} />
		</Layout.Content>
	);
}

export default Employees;
