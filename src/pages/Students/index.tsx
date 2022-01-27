import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Input, Layout, Row, Space, Table, Tooltip } from "antd";
import { EditOutlined, SnippetsOutlined } from '@ant-design/icons';
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
import moment from "moment";
import { useHistory } from "react-router-dom";

export default function Students(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [showEdit, setShowEdit] = useState(false);
	const [editIndex, setEditIndex] = useState(-1);
	//application states
	const loadListStatus = useSelector((state: RootState) => state.studentReducer.getStudentsStatus);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const parents = useSelector((state: RootState) => state.parentReducer.parents);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const searchParentStatus = useSelector((state: RootState) => state.parentReducer.getParentsStatus);
	const searchClassStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const updateStudentStatus = useSelector((state: RootState) => state.studentReducer.updateStudentStatus);

	useEffect(() => {
		if (loadListStatus === "error" || loadListStatus === "success") {
			dispatch(actionResetGetStudents());
		}
	}, [dispatch, loadListStatus]);

	useEffect(() => {
		dispatch(actionGetParents({ per_page: 100 }));
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

		{
			width: "15%",
			title: "Phụ huynh",
			dataIndex: "parent",
			key: "parent",
			render: function parentCol(value?: { email: string; id: number; name: string }): JSX.Element {
				return <a>{get(value, "profile.name", "")}</a>;
			},
		},
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

		// {
		// 	width: "10%",
		// 	title: "Gới tính",
		// 	dataIndex: "gender",
		// 	key: "gender",
		// 	render: function genderCol(value: number): JSX.Element {
		// 		return <span>{value === 0 ? "Nữ" : "Nam"}</span>;
		// 	},
		// },
		{
			width: "15%",
			title: "Action",
			render: function ActionCol(text: string, student: StudentType, index: number): JSX.Element {
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
						{/* <Profile student={student} /> */}
						<Tooltip placement="top" title="Hồ sơ học tập">
							<Button icon={<SnippetsOutlined onClick={() => history.push(`/students-study-profile/${student.id}`)} />} type="link" />
						</Tooltip>

						<Button type="link" icon={<EditOutlined />} onClick={() => {
							setShowEdit(true);
							setEditIndex(index)
						}} />

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
				rowKey="id"
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
			<EditStudentModal
				student={get(students, "data", [])[editIndex]}
				parents={parents}
				searchParent={debounceSearchParent}
				searchStatus={searchParentStatus}
				show={showEdit}
				setShow={setShowEdit}
			/>
		</Layout.Content>
	);
}
