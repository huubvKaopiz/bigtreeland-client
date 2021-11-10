import React, { useEffect } from "react";
import { Button, Col, Input, Layout, Row, Space, Table, Tooltip } from "antd";
import AddStudentModal from "./addStudentModal";
import { StudentType } from "../../interface";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents } from "store/students/slice";
import { get } from "lodash";
import ImportClass from "./importClass";
import LeaveModal from "./leaveModal";
import AcademicProfile from "./Profile";

export default function Students(): JSX.Element {
	const dispatch = useAppDispatch();
	const loadListStatus = useSelector((state: RootState) => state.studentReducer.getStudentsStatus);

	useEffect(() => {
		if (loadListStatus === "idle") {
			dispatch(actionGetStudents({ page: 1 }));
		}
	}, [dispatch, loadListStatus]);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	console.log(students);

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
		},
		{
			width: "10%",
			title: "Ngày sinh",
			dataIndex: "birthday",
			key: "birthday",
		},

		{
			width: "15%",
			title: "Phụ huynh",
			dataIndex: "parent",
			key: "parent",
			render: function parentCol(value: { email: string; id: number; name: string }): JSX.Element {
				return <Button type="link">{value.name}</Button>;
			},
		},
		{
			width: "15%",
			title: "Lớp",
			dataIndex: "class.name",
			key: "class",
		},
		{
			width: "10%",
			title: "Trường học",
			dataIndex: "school",
			key: "school",
		},

		{
			width: "10%",
			title: "Gới tính",
			dataIndex: "gender",
			key: "gender",
			render: function genderCol(value: number): JSX.Element {
				return <span>{value === 0 ? "Nữ" : "Nam"}</span>;
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ActionCol(text: string, record: StudentType): JSX.Element {
				return (
					<Space>
						{record.class === null ? <ImportClass studen_id={record.id} /> : ""}
						<AcademicProfile student_id={record.id} />
						<LeaveModal studen_id={record.id} />
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content style={{ height: 1000 }}>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddStudentModal />
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={get(students, "data", [])}
				bordered
				loading={loadListStatus === "loading" ? true : false}
			/>
		</Layout.Content>
	);
}
