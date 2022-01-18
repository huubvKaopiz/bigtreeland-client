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
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ParentType, User } from "interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetParents } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import AddParent from "./addParentModal";
import { get } from "lodash";
import DeleteParent from "./deleteParentModal";
import AddStudent from "./addStudents";
import useDebouncedCallback from "hooks/useDebounceCallback";

export default function Parents(): JSX.Element {
	const dispatch = useAppDispatch();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('')

	const getParentsStatus = useSelector(
		(state: RootState) => state.parentReducer.getParentsStatus
	);
	const parents = useSelector(
		(state: RootState) => state.parentReducer.parents
	);

	const searchParent = useDebouncedCallback( search => {
		setSearch(search)
		dispatch(actionGetParents({page: 1, search}))
	}, 500)

	useEffect(() => {
		dispatch(actionGetParents({ page, search }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, page]);

	const columns = [
		{
			width: "15%",
			title: "Họ tên",
			key: "name",
			render: function NameCol(user: User): JSX.Element {
				return <strong>{get(user, "profile.name", "")}</strong>;
			},
		},
		{
			width: "10%",
			title: "Email",
			key: "email",
			render: function col(user: { profile: { email: string } }): JSX.Element {
				return <strong>{get(user, "profile.email", "")}</strong>;
			},
		},

		{
			width: "10%",
			title: "Điện thoại",
			key: "phone",
			render: function UserCol(user: {
				id: number;
				phone: string;
				phone_verified_at: string;
			}): JSX.Element {
				return (
					<Space>
						{user.phone}{" "}
						{user.phone_verified_at == null ? (
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
			render: function ActionCol(record: ParentType): JSX.Element {
				return (
					<Space>
						<DeleteParent parent={record} />
						{record.phone_verified_at == null ? (
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
					<Input.Search allowClear onChange={ ({ target: { value } }) => searchParent(value)}/>
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddParent />
				</Col>
			</Row>
			<Table
				bordered
				loading={getParentsStatus === "loading"}
				columns={columns}
				size="small"
				dataSource={get(parents, "data", [])}
				pagination={{
					pageSize: 20,
					total: get(parents, "total", 0),
					onChange: (page) => {
						setPage(page);
					},
				}}
			/>
		</Layout.Content>
	);
}
