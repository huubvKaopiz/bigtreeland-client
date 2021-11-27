import React, { useEffect } from "react";
import { Col, Input, Layout, Row, Space, Table } from "antd";
import AddStudentModal from "./addStudentModal";
import { StudentType } from "../../interface";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents } from "store/students/slice";
import { get } from "lodash";
import ImportClass from "./importClass";
import LeaveModal from "./leaveModal";
import EditStudentModal from "./editStudentModal";
import { actionGetParents } from "store/parents/slice";
import { actionGetClasses } from "store/classes/slice";
import Profile from "./Profile";

export default function Students(): JSX.Element {
	const dispatch = useAppDispatch();
	const loadListStatus = useSelector((state: RootState) => state.studentReducer.getStudentsStatus);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const parents = useSelector((state: RootState) => state.parentReducer.parents);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const searchParentStatus = useSelector((state: RootState) => state.parentReducer.getParentsStatus);
	const searchClassStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);

	useEffect(() => {
		if (loadListStatus === "idle") {
			dispatch(actionGetStudents({ page: 1 }));
		}
	}, [dispatch, loadListStatus]);

	useEffect(() => {
		dispatch(actionGetParents({}));
		dispatch(actionGetClasses({}));
	}, [dispatch]);

	const searchParent = (search: string) => {
		if (search.length >= 3 || search.length === 0) {
			dispatch(actionGetParents({ search }));
		}
	};

	const searchClass = (search: string) => {
		if (search.length === 0 || search.length >= 3) {
			dispatch(actionGetClasses({ search }));
		}
	};

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function nameCol(value: string): JSX.Element {
				return <strong>{value}</strong>;
			},
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
			render: function parentCol(value?: { email: string; id: number; name: string }): JSX.Element {
				return <a>{get(value, "name", "")}</a>;
			},
		},
		{
			width: "15%",
			title: "Lớp",
			dataIndex: "class.name",
			key: "class",
			render: function parentCol(value?: { id: number; name: string }): JSX.Element {
				return <a>{get(value, "name", "")}</a>;
			},
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
			render: function ActionCol(student: StudentType): JSX.Element {
				return (
					<Space>
						{student.class === null ? (
							<ImportClass
								student={student}
								classesList={classesList}
								searchClass={searchClass}
								searchStatus={searchClassStatus}
							/>
						) : (
							""
						)}
						<Profile student={student} />
						<EditStudentModal
							student={student}
							parents={parents}
							searchParent={searchParent}
							searchStatus={searchParentStatus}
						/>
						<LeaveModal studen_id={student.id} />
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddStudentModal parents={parents} searchParent={searchParent} searchStatus={searchParentStatus} />
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
