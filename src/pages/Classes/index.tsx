import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Col, Input, Layout, Row, Space, Table, Tag } from "antd";
import { get } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useHistory } from "react-router-dom";
import { User } from "store/auth/slice";
import { actionGetClasses } from "store/classes/slice";
import { actionGetEmployees } from "store/employees/slice";
import { dayOptions, DEFAULT_ROLE_IDS } from "utils/const";
import useDebouncedCallback from "../../hooks/useDebounceCallback";
import { ClassType, RoleType } from "../../interface";
import { RootState } from "../../store/store";
import AddClassModal from "./addClassModal";
import EditClassModal from "./editClassModal";

function Classes(): JSX.Element {
	const dispatch = useDispatch();
	const history = useHistory();

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('')
	const [showEdit, setShowEdit] = useState(false);
	const [editIndex, setEditIndex] = useState(-1);

	const getStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const classes = useSelector((state: RootState) => state.classReducer.classes);
	const seachStatus = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);

	const searchClass = useDebouncedCallback((searchParam) => {
		setSearch(searchParam)
		dispatch(actionGetClasses({ page, search: searchParam }))
	}, 500)

	useEffect(() => {
		dispatch(actionGetClasses({ page, search }))
	}, [page])

	const searchTeacher = (search: string) => {
		if (search.length >= 3 || search.length === 0)
			dispatch(actionGetEmployees({ role_ids: `${DEFAULT_ROLE_IDS.TEACHER},${DEFAULT_ROLE_IDS.TEACHER2}`, search }));
	};

	function handleEdit(index: number) {
		setShowEdit(true);
		setEditIndex(index);
	}

	const columns = [
		{
			width: 350,
			title: "Tên lớp",
			dataIndex: "name",
			key: "name",
			render: function nameCol(name: string, record: { id: number, type: number }): JSX.Element {
				return <><strong>{name}</strong>  <Tag style={{ fontSize: 10 }} color={record.type === 0 ? "red" : "green"}>{record.type === 0 ? "Offline" : "Online"}</Tag></>
			},
		},
		{
			// width: "25%",
			title: "Giáo viên",
			dataIndex: "user",
			key: "user",
			render: function TeacherCol(value: { id: number, profile: { name: string } }): JSX.Element {
				return <Button type="link">{get(value, "profile.name", "")}</Button>;
			},
		},
		{
			// width: "25%",
			title: "Trợ giảng",
			dataIndex: "assistant",
			key: "assistant",
			render: function TeacherCol(value: { id: number, profile: { name: string } }): JSX.Element {
				return <Button type="link">{get(value, "profile.name", "")}</Button>;
			},
		},
		{
			width: 80,
			title: "Số hs",
			dataIndex: "students_num",
			key: "students_num",
		},
		{
			// width: "10%",
			title: "Học phí / buổi",
			dataIndex: "fee_per_session",
			key: "fee_per_session",
			render: function feeCol(amount: number): JSX.Element {
				return <span style={{ color: "#3498db" }}>{numeral(amount).format("0,0")}</span>;
			},
		},
		{
			// width: "20%",
			title: "Lịch học",
			dataIndex: "schedule",
			key: "schedule",
			render: function scheduleCol(schedule: number[]): JSX.Element {
				const sortedSchedule = [...schedule]
				return <>{sortedSchedule.sort().map((day) => dayOptions[day]).join(', ')}</>;
			},
		},
		{
			width: "10%",
			title: "Action",
			key: "action",
			render: function ActionCol(text: string, record: ClassType, index: number): JSX.Element {
				return (
					<Space size="middle">
						<Button
							type="link"
							icon={<UnorderedListOutlined />}
							onClick={() => history.push({ pathname: `/study/${record.id}`, state: { classInfo: record } })}
						/>
						<Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(index)} />

					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onChange={({ target: { value } }) => searchClass(value)} placeholder="Tìm theo tên lớp..." />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddClassModal />
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
			<EditClassModal
				classInfo={get(classes, "data", [])[editIndex]}
				// teachers={teachers}
				searchTeacher={searchTeacher}
				searchStatus={seachStatus}
				show={showEdit}
				setShow={setShowEdit}
				searchClass={search}
			/>
		</Layout.Content>
	);
}

export default Classes;
