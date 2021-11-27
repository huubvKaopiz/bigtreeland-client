import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import { Col, Input, Layout, Row, Space, Table } from "antd";
import { RoleCreateFormType, RoleType, UserType } from "interface";
import { UpdateRoleDataType } from "interface/api-params-interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
	actionCreateRole,
	actionDeleteRoles,
	actionGetRoles,
	actionResetStatusDeleteRole,
	actionResetStatusGetRole,
	actionResetStatusUpdateRole,
	actionUpdateRole,
} from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { DatePattern, dateSort, formatDate } from "utils/dateUltils";
import AddRolesForm from "./AddRolesForm";
import RoleDetail from "./RoleDetail";

function Roles(): JSX.Element {
	const dispatch = useAppDispatch();
	const statusCreateRole = useSelector((state: RootState) => state.roleReducer.statusCreateRole);
	const statusGetRoles = useSelector((state: RootState) => state.roleReducer.statusGetRole);
	const statusDeleteRoles = useSelector((state: RootState) => state.roleReducer.statusDeleteRole);
	const statusUpdateRole = useSelector((state: RootState) => state.roleReducer.statusUpdateRole);
	const listRoles = useSelector((state: RootState) => state.roleReducer.roles);

	const [showDetail, setShowDetail] = useState(false);
	const [roleDetail, setRoleDetail] = useState<RoleType>();

	//Get roles for mounted
	useEffect(() => {
		dispatch(actionGetRoles());
	}, [dispatch]);

	useEffect(() => {
		if (statusCreateRole === "success") dispatch(actionGetRoles());
		if (statusGetRoles === "success") dispatch(actionResetStatusGetRole());
		if (statusUpdateRole === "success") {
			dispatch(actionGetRoles());
			dispatch(actionResetStatusUpdateRole());
		}
		if (statusDeleteRoles === "success") {
			dispatch(actionGetRoles());
			dispatch(actionResetStatusDeleteRole());
		}
	}, [dispatch, statusCreateRole, statusDeleteRoles, statusGetRoles, statusUpdateRole]);

	function handleAddRoles(formValue: RoleCreateFormType, permissionsSelected: React.Key[]) {
		dispatch(actionCreateRole({ ...formValue, permission_ids: [...permissionsSelected] }));
	}

	function handlelUpdateRoles(updateObject: UpdateRoleDataType) {
		dispatch(actionUpdateRole(updateObject));
	}

	const tableColumn = [
		{
			title: "Id",
			key: "id",
			dataIndex: "id",
			// eslint-disable-next-line @typescript-eslint/prefer-as-const
			defaultSortOrder: "ascend" as "ascend",
			showSorterTooltip: false,
			sorter: {
				compare: (a: RoleType, b: RoleType) => a.id - b.id,
				multiple: 3,
			},
			width: 70,
		},
		{
			title: "Tên",
			key: "name",
			dataIndex: "name",
			render: function UserLink(text: string, record: RoleType): JSX.Element {
				return (
					<a
						className="example-link"
						onClick={() => {
							setShowDetail(true);
							setRoleDetail(record);
						}}
					>
						<Space>
							<UserOutlined />
							{text}
						</Space>
					</a>
				);
			},
		},
		{
			title: "Số thành viên",
			key: "users",
			dataIndex: "users",
			render: function UserLink(users: UserType[], record: RoleType): JSX.Element {
				return (
					<a
						onClick={() => {
							setShowDetail(true);
							setRoleDetail(record);
						}}
					>
						{users.length}
					</a>
				);
			},
			showSorterTooltip: false,
			sorter: {
				compare: (a: RoleType, b: RoleType) => a.users.length - b.users.length,
				multiple: 2,
			},
		},
		{
			title: "Ngày tạo",
			key: "created_at",
			dataIndex: "created_at",
			render: function UserLink(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
			showSorterTooltip: false,
			sorter: {
				compare: (a: RoleType, b: RoleType) => dateSort(a.created_at, b.created_at),
				multiple: 2,
			},
		},
		{
			title: "Ngày update",
			key: "updated_at",
			dataIndex: "updated_at",
			render: function UserLink(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
			showSorterTooltip: false,
			sorter: {
				compare: (a: RoleType, b: RoleType) => dateSort(a.updated_at, b.updated_at),
				multiple: 1,
			},
		},
		{
			title: "",
			key: "action",
			render: function ActionRow(_: string, record: RoleType): JSX.Element {
				return (
					<a
						onClick={() => {
							dispatch(actionDeleteRoles(record.id));
						}}
					>
						<DeleteOutlined />
					</a>
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
					<AddRolesForm onHandleSubmit={handleAddRoles} />
				</Col>
			</Row>
			<Table
				bordered
				columns={tableColumn}
				loading={statusGetRoles === "loading" || statusDeleteRoles === "loading"}
				pagination={{ pageSize: 20 }}
				dataSource={listRoles}
				// size="small"
			/>
			<RoleDetail
				roleDetail={roleDetail}
				show={showDetail}
				onClose={() => setShowDetail(false)}
				onChange={handlelUpdateRoles}
			/>
		</Layout.Content>
	);
}

export default Roles;
