import React, { useEffect, useRef, useState } from "react";
import { Col, Input, Layout, Row, Space, Table } from "antd";
import AddStudentModal from "./addStudentModal";
import { StudentType } from "../../interface";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents, actionResetGetStudents, actionResetUpdateStudent } from "store/students/slice";
import { debounce, get } from "lodash";
import ImportClass from "./importClass";
import LeaveModal from "./leaveModal";
import EditStudentModal from "./editStudentModal";
import { actionGetParents } from "store/parents/slice";
import { actionGetClasses } from "store/classes/slice";
import Profile from "./Profile";
import moment from "moment";

export default function Students(): JSX.Element {
	const dispatch = useAppDispatch();
	const loadListStatus = useSelector((state: RootState) => state.studentReducer.getStudentsStatus);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const parents = useSelector((state: RootState) => state.parentReducer.parents);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const searchParentStatus = useSelector((state: RootState) => state.parentReducer.getParentsStatus);
	const searchClassStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const updateStudentStatus = useSelector((state: RootState) => state.studentReducer.updateStudentStatus);

	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");

	useEffect(() => {
		dispatch(actionGetStudents({ page: 1 }));
	}, [dispatch]);

	useEffect(() => {
		if (loadListStatus === "error" || loadListStatus === "success") {
			dispatch(actionResetGetStudents());
		}
	}, [dispatch, loadListStatus]);

	useEffect(() => {
		dispatch(actionGetParents({}));
		dispatch(actionGetClasses({}));
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetStudents({ page, search: searchInput }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, page]);

	useEffect(() => {
		if (updateStudentStatus === "success") {
			dispatch(actionGetStudents({ page: 1 }));
			dispatch(actionResetUpdateStudent());
		}
	}, [dispatch, updateStudentStatus]);

	const debounceSearchStudent = useRef(
		debounce((search) => {
			setSearchInput(search);
			dispatch(actionGetStudents({ search }));
		}, 500)
	).current;

	const debounceSearchParent = useRef(debounce((search) => dispatch(actionGetParents({ search })), 500)).current;

	const debounceSearchClass = useRef(debounce((search) => dispatch(actionGetClasses({ search })), 500)).current;

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
			render: function nameCol(value: string): JSX.Element {
				return <>{moment(value).format('DD-MM-YYYY')}</>;
			},
		},

		// {
		// 	width: "15%",
		// 	title: "Phụ huynh",
		// 	dataIndex: "parent",
		// 	key: "parent",
		// 	render: function parentCol(value?: { email: string; id: number; name: string }): JSX.Element {
		// 		return <a>{get(value, "profile.name", "")}</a>;
		// 	},
		// },
		{
			width: "15%",
			title: "Lớp",
			dataIndex: "class",
			key: "class",
			render: function parentCol(value?: { id: number; name: string }): JSX.Element {
				return <a>{get(value, "name", "")}</a>;
			},
		},
		// {
		// 	width: "10%",
		// 	title: "Trường học",
		// 	dataIndex: "school",
		// 	key: "school",
		// },

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
			render: function ActionCol(student: StudentType): JSX.Element {
				return (
					<Space key={student.id}>
						{student.class === null ? (
							<ImportClass
								student={student}
								classesList={classesList}
								searchClass={debounceSearchClass}
								searchStatus={searchClassStatus}
							/>
						) : (
							""
						)}
						<Profile student={student} />
						<EditStudentModal
							student={student}
							parents={parents}
							searchParent={debounceSearchParent}
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
					<Input.Search allowClear onChange={({ target: { value } }) => debounceSearchStudent(value)} />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddStudentModal parents={parents} searchParent={debounceSearchParent} searchStatus={searchParentStatus} />
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={get(students, "data", [])}
				size="small"
				bordered
				loading={loadListStatus === "loading" ? true : false}
				pagination={{
					showSizeChanger: false,
					pageSize: 20,
					total: get(students, "total", 0),
					onChange: (page) => {
						setPage(page);
					},
				}}
			/>
		</Layout.Content>
	);
}
