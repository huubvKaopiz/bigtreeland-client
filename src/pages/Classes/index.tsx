import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ClassType } from "../../interface";
import { Button, Col, Input, Layout, Row, Space, Table } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import EditClassModal from "./editClassModal";
import AddClassModal from "./addClassModal";
import { useHistory } from "react-router-dom";
import { actionGetClasses } from "store/classes/slice";
import { get } from "lodash";
import { actionGetEmployees } from "store/employees/slice";
import numeral from "numeral";
import { dayOptions } from "utils/const";
import useDebouncedCallback from "../../hooks/useDebounceCallback";

function Classes(): JSX.Element {
	const dispatch = useDispatch();
	const history = useHistory();
	const getStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const classes = useSelector((state: RootState) => state.classReducer.classes);
	const teachers = useSelector((state: RootState) => state.employeeReducer.employees);
	const seachStatus = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('')

	const searchClass = useDebouncedCallback((searchParam) => {
		setSearch(searchParam)
		dispatch(actionGetClasses({page: 1, search: searchParam}))
	}, 500)

	useEffect(() => {
		dispatch(actionGetClasses({ page: 1 }));
		dispatch(actionGetEmployees({ role_id:"4" }));
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetClasses({page, search}))
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[dispatch, page])

	const searchTeacher = (search: string) => {
		if (search.length >= 3 || search.length === 0) dispatch(actionGetEmployees({ class_id: 0, role_id: '2,4', search }));
	};

	const columns = [
		{
			width: "15%",
			title: "Tên lớp",
			dataIndex: "name",
			key: "name",
			render: function nameCol(name: string): JSX.Element {
				return <strong>{name}</strong>;
			},
		},
		{
			width: "15%",
			title: "Giáo viên",
			dataIndex: "user",
			key: "user",
			render: function TeacherCol(value: { id: number, profile: { name: string } }): JSX.Element {
				return <Button type="link">{get(value, "profile.name", "")}</Button>;
			},
		},
		{
			width: "10%",
			title: "Số học sinh",
			dataIndex: "students_num",
			key: "students_num",
		},
		{
			width: "10%",
			title: "Học phí / buổi",
			dataIndex: "fee_per_session",
			key: "fee_per_session",
			render: function feeCol(amount: number): JSX.Element {
				return <span style={{ color: "#e67e22" }}>{numeral(amount).format("0,0")}</span>;
			},
		},
		{
			width: "20%",
			title: "Lịch học",
			dataIndex: "schedule",
			key: "schedule",
			render: function scheduleCol(schedule: number[]): JSX.Element {
				const sortedSchedule = [...schedule]
				return <>{sortedSchedule.sort().map((day) => dayOptions[day]).join(', ')}</>;
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ActionCol(record: ClassType): JSX.Element {
				return (
					<Space size="middle">
						<Button
							type="link"
							icon={<UnorderedListOutlined />}
							onClick={() => history.push({ pathname: `/classes-detail/${record.id}`, state: { classInfo: record } })}
						/>
						<EditClassModal
							classInfo={record}
							teachers={teachers}
							searchTeacher={searchTeacher}
							searchStatus={seachStatus}
						/>
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onChange={ ({ target: { value } }) => searchClass(value)}/>
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddClassModal teachers={teachers} />
				</Col>
			</Row>
			<Table
				dataSource={get(classes, "data", [])}
				columns={columns}
				loading={getStatus === "loading" ? true : false}
				rowKey="id"
				bordered
				size="small"
				pagination={{
					pageSize: 20,
					total: get(classes, "total", 0),
					onChange: (page) => {
						setPage(page);
					},
				}}
			/>
		</Layout.Content>
	);
}

export default Classes;
