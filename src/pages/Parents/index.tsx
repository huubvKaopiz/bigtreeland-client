import React from 'react';
import {EditOutlined } from "@ant-design/icons";
import {
	Button, Col, Form, Input, Layout, Row, Space, Table, Tag,
} from "antd";
import useDebouncedCallback from "hooks/useDebounceCallback";
import useIsAdmin from "hooks/useIsAdmin";
import usePermissionList from "hooks/usePermissionList";
import { ParentType } from "interface";
import get from "lodash/get";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetParents, actionUpdateParent } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import { isHavePermission } from "utils/ultil";
// import { actionGetStudents } from "store/students/slice";
import AddParent from "./addParentModal";
// import AddStudent from "./addStudents";

interface EditPayloadType {
	user_id: number,
	name: string,
	email: string,
	phone?:string,
}

export default function Parents(): JSX.Element {
	const dispatch = useAppDispatch();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('')
	const [editIndex, setEditIndex] = useState(-1);
	const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();

	const [editPayload, setEditPayload] = useState<EditPayloadType | null>(null)
	const [form] = Form.useForm();

	const getParentsStatus = useSelector(
		(state: RootState) => state.parentReducer.getParentsStatus
	);
	const parents = useSelector(
		(state: RootState) => state.parentReducer.parents
	);
	const updateParentStatus = useSelector(
		(state: RootState) => state.parentReducer.updateParentStatus
	);

	// const students = useSelector((state: RootState) => state.studentReducer.students);

	const searchParent = useDebouncedCallback(search => {
		setSearch(search)
		dispatch(actionGetParents({ page: 1, search }))
	}, 500)

	useEffect(() => {
		dispatch(actionGetParents({ page, search }));
	}, []);

	useEffect(() => {
		if (updateParentStatus === 'success') {
			handleSetEdit(-1, null);
			dispatch(actionGetParents({ page, search }))
		}
	}, [updateParentStatus]);

	function handleSetEdit(index: number, record: ParentType | null) {
		setEditIndex(index);
		if (index === -1) setEditPayload(null)
		else {
			if (record) setEditPayload({
				user_id: record.id,
				name: get(record, "profile.name", ""),
				email: get(record, "profile.email", ""),
				phone:record.phone
			})

		}
	}

	function handleUpdate(index: number) {
		if (editIndex === index && editPayload) {
			dispatch(actionUpdateParent({
				data: { name: editPayload.name, email: editPayload.email, phone: editPayload.phone },
				uID: editPayload.user_id
			}));
		}
	}

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			key: "name",
			editable: true,
			render: function NameCol(text: string, record: ParentType, index: number): JSX.Element {
				return editIndex === index ?
					<Input value={editPayload?.name} onChange={(e) => {
						if (editPayload) {
							editPayload.name = e.target.value;
							setEditPayload({ ...editPayload });
						}
					}} />
					: <a>{get(record, "profile.name", "")}</a>;
			},
		},
		{
			width: "10%",
			title: "Email",
			key: "email",
			editable: true,
			render: function col(text: string, record: ParentType, index: number): JSX.Element {
				return editIndex === index ?
					<Input value={editPayload?.email} onChange={(e) => {
						if (editPayload) {
							editPayload.email = e.target.value;
							setEditPayload({ ...editPayload });
						}
					}} />
					:
					<span>{get(record, "profile.email", "")}</span>;
			},
		},

		{
			width: "10%",
			title: "Điện thoại",
			key: "phone",
			editable: true,
			render: function UserCol(text: string, record: ParentType, index: number): JSX.Element {
				return editIndex === index && record.phone_verified_at === null ?
					<Input value={editPayload?.phone} onChange={(e) => {
						if (editPayload) {
							editPayload.phone = e.target.value;
							setEditPayload({ ...editPayload });
						}
					}} />
					:
					<Space>
						{record.phone}{" "}
						{record.phone_verified_at == null ? (
							<Tag color="red">Chưa xác thực</Tag>
						) : (
							""
						)}
					</Space>
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			hidden: !(isAdmin || isHavePermission(permissionList, "users.update")),
			render: function ActionCol(text: string, record: ParentType, index: number): JSX.Element {
				return editIndex === index ? (
					<Space>
						{/* <DeleteParent parent={record} /> */}

						<span>
							<Button
								type="primary"
								onClick={() => handleUpdate(index)}
								style={{ marginRight: 8 }}
								loading={updateParentStatus === "loading"}>
								Lưu lại
							</Button>
							<Button
								type="primary"
								danger
								onClick={() => handleSetEdit(-1, record)}>
								Huỷ bỏ
							</Button>
						</span>
					</Space>
				) : (
					<Space>
						<Button type="link" icon={<EditOutlined />} disabled={editIndex !== -1} onClick={() => handleSetEdit(index, record)} />
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onChange={({ target: { value } }) => searchParent(value)} placeholder="Tìm theo tên, email hoặc số điện thoại..." />
				</Col>
				{ (isAdmin || isHavePermission(permissionList, "users.store")) &&
					<Col span={6} style={{ marginLeft: 20 }}>
						<AddParent />
					</Col>
				}
			</Row>
			<Form form={form} component={false}>
				<Table
					bordered
					loading={getParentsStatus === "loading"}
					columns={columns.filter((item) => !item.hidden)}
					rowKey="id"
					dataSource={get(parents, "data", [])}
					pagination={{
						pageSize: 20,
						total: get(parents, "total", 0),
						onChange: (page) => {
							setPage(page);
						},
					}}
				/>
			</Form>
			{/* <AddStudent
				parentInfo={get(parents, "data", [])[parentAddStudentIndex]}
				students={get(students, "data", [])}
				searchStudent={searchStudent}
				show={showAddStudent}
				setShow={setShowAddStudent} /> */}
		</Layout.Content>
	);
}
