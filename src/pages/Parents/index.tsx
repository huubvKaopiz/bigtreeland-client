import { Layout, Space, Button, Table, Row, Col, Input, Tag, Tooltip } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ParentType } from "interface";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { actionGetParents } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import AddParent from "./addParentModal";
import { get } from "lodash";
import DeleteParent from "./deleteParentModal";
import AddStudent from "./addStudents";

export default function Parents(): JSX.Element {
	const dispatch = useAppDispatch();
	const status = useSelector((state: RootState) => state.parentReducer.getParentsStatus);
	const parents = useSelector((state: RootState) => state.parentReducer.parents);

	useEffect(() => {
		if (status === "idle") {
			dispatch(actionGetParents({ page: 1 }));
		}
	}, [dispatch, status]);

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
		},
		{
			width: "10%",
			title: "Email",
			dataIndex: "email",
			key: "email",
		},

		{
			width: "10%",
			title: "Điện thoại",
			dataIndex: "user",
			key: "phone",
			render: function UserCol(user: { id: number; phone: string; phone_verified_at: string }): JSX.Element {
				return (
					<Space>
						{user.phone} {user.phone_verified_at == null ? <Tag color="volcano">Chưa xác thực</Tag> : ""}
					</Space>
				);
			},
		},
		{
			width: "15%",
			title: "Học sinh",
			dataIndex: "stduents",
			key: "stduents",
			render: function StudentsCol(students: { id: number; name: string }[]): JSX.Element {
				return (
					<div>
						{students &&
							students.map((student) => {
								<Button type="link">{student.name}</Button>;
							})}
					</div>
				);
			},
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ActionCol(text: string, record: ParentType): JSX.Element {
				return (
					<Space>
						<DeleteParent parent={record} />
						{record.user.phone_verified_at == null ? (
							<Tooltip placement="top" title="Xác minh">
								<Button type="link" icon={<CheckCircleOutlined />} />
							</Tooltip>
						) : (
							""
						)}
						<AddStudent parent_id={record.id} />
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
					<AddParent />
				</Col>
			</Row>
			<Table columns={columns} dataSource={get(parents, "data", [])} />
		</Layout.Content>
	);
}
