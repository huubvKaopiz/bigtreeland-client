import React, { useEffect, useState } from "react";
import {
	Layout,
	Space,
	Button,
	Table,
	Row,
	Col,
	Input,
	Tag,
	Tooltip,
	Form,
	Popconfirm,
} from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { ParentType } from "interface";
import { useSelector } from "react-redux";
import { actionGetParents, actionUpdateParent } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import AddParent from "./addParentModal";
import { get } from "lodash";
import AddStudent from "./addStudents";
import useDebouncedCallback from "hooks/useDebounceCallback";

interface EditPayloadType {
	user_id: number,
	name: string,
	email: string,
}

export default function Parents(): JSX.Element {
	const dispatch = useAppDispatch();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('')
	const [editIndex, setEditIndex] = useState(-1);
	const [editPayload, setEditPayload] = useState<EditPayloadType | null>(null)
	const [form] = Form.useForm();

	const getParentsStatus = useSelector(
		(state: RootState) => state.parentReducer.getParentsStatus
	);
	const parents = useSelector(
		(state: RootState) => state.parentReducer.parents
	);

	const searchParent = useDebouncedCallback(search => {
		setSearch(search)
		dispatch(actionGetParents({ page: 1, search }))
	}, 500)

	useEffect(() => {
		dispatch(actionGetParents({ page, search }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, page]);

	function handleSetEdit(index: number, record: ParentType | null) {
		setEditIndex(index);
		if (index === -1) setEditPayload(null)
		else {
			if (record) setEditPayload({
				user_id: record.id,
				name: get(record, "profile.name", ""),
				email: get(record, "profile.email", "")
			})

		}
	}

	function handleUpdate(index: number) {
		if (editIndex === index && editPayload) {
			// console.log(editPayload)
			dispatch(actionUpdateParent({
				data: { name: editPayload.name, email: editPayload.email, gender: 0 },
				uID: editPayload.user_id
			})).finally(() => handleSetEdit(-1, null))
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
			render: function UserCol(text: string, record: ParentType): JSX.Element {
				return (
					<Space>
						{record.phone}{" "}
						{record.phone_verified_at == null ? (
							<Tag color="volcano">Chưa xác thực</Tag>
						) : (
							""
						)}
					</Space>
				);
			},
		},
		{
			width: "15%",
			title: "Học sinh",
			dataIndex: "students",
			key: "students",
			editable: false,
			render: function StudentsCol(
				students: { id: number; name: string }[]
			): JSX.Element {
				return (
					<div>
						{students &&
							students.map((student) => {
								<a key={student.id}>{student.name}</a>;
							})}
					</div>
				);
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ActionCol(text: string, record: ParentType, index: number): JSX.Element {
				return editIndex === index ? (
					<Space>
						{/* <DeleteParent parent={record} /> */}

						<span>
							<Button size="small" type="primary" onClick={() => handleUpdate(index)} style={{ marginRight: 8 }}>
								Lưu lại
							</Button>
							<Popconfirm title="Sure to cancel?" onConfirm={() => {
								handleSetEdit(-1, record);
							}}>
								<Button size="small" type="primary" danger>Huỷ bỏ</Button>
							</Popconfirm>
						</span>
					</Space>
				) : (
					<Space>
						{record.phone_verified_at == null ? (
							<Tooltip placement="top" title="Xác minh">
								<Button type="link" icon={<CheckCircleOutlined />} />
							</Tooltip>
						) : (
							""
						)}
						<AddStudent parent_id={record.id} />
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
					<Input.Search allowClear onChange={({ target: { value } }) => searchParent(value)} />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddParent />
				</Col>
			</Row>
			<Form form={form} component={false}>
				<Table
					bordered
					loading={getParentsStatus === "loading"}
					columns={columns}
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
		</Layout.Content>
	);
}
