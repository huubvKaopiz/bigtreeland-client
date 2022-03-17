import { EditOutlined, SnippetsOutlined, ImportOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Col, Input, Layout, Row, Space, Table, Tag, Tooltip } from "antd";
import { debounce, get } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClasses } from "store/classes/slice";
import { actionGetParents } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents, actionResetGetStudents, actionResetUpdateStudent } from "store/students/slice";
import { StudentType } from "../../interface";
import AddStudentModal from "./addStudentModal";
import EditStudentModal from "./editStudentModal";
import ImportClass from "./importClass";
import LeaveModal from "./leaveModal";

export default function Students(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [showEdit, setShowEdit] = useState(false);
	const [editIndex, setEditIndex] = useState(-1);
	const [showImportModal, setShowImportModal] = useState(false);
	const [importClassStudentIndex, setImportClassStudentIndex] = useState(-1);
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
			dispatch(actionGetStudents({ page }));
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
			width: 350,
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function nameCol(value: string, record: StudentType): JSX.Element {
				return <Space><strong>{value}</strong><Tag style={{ fontSize: 10 }} color={record.type === 0 ? "red" : "green"}>{record.type === 0 ? "Offline" : "Online"}</Tag></Space>;
			},
		},
		{
			width: 150,
			title: "Ngày sinh",
			dataIndex: "birthday",
			key: "birthday",
			render: function nameCol(value: string): JSX.Element {
				return <>{moment(value).format('DD-MM-YYYY')}</>;
			},
		},

		{
			width: 200,
			title: "Phụ huynh",
			dataIndex: "parent",
			key: "parent",
			render: function parentCol(value?: { email: string; id: number; name: string }): JSX.Element {
				return <a>{get(value, "profile.name", "")}</a>;
			},
		},
		{
			width: 200,
			title: "Lớp",
			dataIndex: "class",
			key: "class",
			render: function parentCol(value?: { id: number; name: string }): JSX.Element {
				return <span style={{ color: "#2980b9" }}>{get(value, "name", "")}</span>;
			},
		},
		{
			width: 200,
			title: "Action",
			key: "action",
			render: function ActionCol(text: string, student: StudentType, index: number): JSX.Element {
				return (
					<Space key={student.id}>
						{
							student.class === null ?
								<Tooltip placement="top" title="Nhập lớp">
									<Button onClick={() => {
										setImportClassStudentIndex(index);
										setShowImportModal(true)
									}} type="link" icon={<ImportOutlined />} />
								</Tooltip>
								:
								<Tooltip title="Chuyển lớp">
									<Button icon={<SwapOutlined onClick={() => {
										setImportClassStudentIndex(index);
										setShowImportModal(true)
									}} />} type="link" />
								</Tooltip>
						}
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
					<Input.Search allowClear onChange={({ target: { value } }) => debounceSearchStudent(value)} placeholder='Tìm kiếm theo tên học sinh' />
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
			<ImportClass
				student={get(students, "data", [])[importClassStudentIndex]}
				classesList={classesList}
				show={showImportModal}
				setShow={setShowImportModal}
				searchClass={debounceSearchClass}
				searchStatus={searchClassStatus}
			/>
		</Layout.Content>
	);
}
