import { Button, Col, Input, Layout, Modal, Row, Space, Table, Tooltip } from "antd";
import { DeleteOutlined, UserOutlined, ExclamationCircleOutlined, AuditOutlined, TeamOutlined, WindowsOutlined } from '@ant-design/icons';
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
} from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { ROLE_NAMES } from "utils/const";
import { DatePattern, dateSort, formatDate } from "utils/dateUltils";
import { converRoleNameToVN } from "utils/ultil";
import AddRolesForm from "./AddRolesForm";
import { useHistory } from "react-router-dom";
import { RoleUsers } from "./roleUsers";
import SetMenuView from "./SetMenuView";

const { confirm } = Modal;

function Roles(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const [showAddUsers, setShowAddUsers] = useState(false);
	const [showSettingMenu, setShowSettingMenu] = useState(false);
	const [addUsersIndex, setAddUsersIndex] = useState(-1);
	//application states
	const statusCreateRole = useSelector((state: RootState) => state.roleReducer.statusCreateRole);
	const statusGetRoles = useSelector((state: RootState) => state.roleReducer.statusGetRole);
	const statusDeleteRoles = useSelector((state: RootState) => state.roleReducer.statusDeleteRole);
	const statusUpdateRole = useSelector((state: RootState) => state.roleReducer.statusUpdateRole);
	const listRoles = useSelector((state: RootState) => state.roleReducer.roles);

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

	function handleDeleteRole(roleID: number) {
		confirm({
			title: "Bạn muốn xoá vai trò này?",
			icon: <ExclamationCircleOutlined />,
			content: "Lưu ý khi xoá vai trò, tất cả quyền của nhân viên có vai trò này sẽ bị xoá!",
			onOk() {
				dispatch(actionDeleteRoles(roleID)).finally(() => {
					dispatch(actionGetRoles());
				});
			},
		});
	}

	function handleAddUsers(index:number){
		setShowAddUsers(true);
		setAddUsersIndex(index);
	}

	function handleOpenSettingMenu(index: number){
		setShowSettingMenu(true)
		setAddUsersIndex(index);
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
			render: function UserLink(text: string, record:{id:number, name:string, description:string}): JSX.Element {
				return (

					<Space>
						<UserOutlined />
						<strong>{text}</strong><span style={{ color: "#95a5a6" }}>{ record.description === null ?  converRoleNameToVN(text as ROLE_NAMES) : record.description}</span>
					</Space>
				);
			},
		},
		{
			title: "Số thành viên",
			key: "users",
			dataIndex: "users",
			render: function UserLink(users: UserType[]): JSX.Element {
				return (
					<a>
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
			title: "",
			key: "action",
			render: function ActionRow(_: string, record: RoleType, index:number): JSX.Element {
				return (
					<Space>
						<Tooltip title="Xoá vai trò">
							<Button type="link" danger onClick={() => handleDeleteRole(record.id)} icon={<DeleteOutlined />} />
						</Tooltip>
						<Tooltip title="DS người dùng">
							<Button type="link" icon={<TeamOutlined />} onClick={() => handleAddUsers(index)} />
						</Tooltip>
						<Tooltip title="Phân quyền vai trò">
							<Button type="link" onClick={() => history.push(`/roles-set-permissions/${record.id}`)} icon={<AuditOutlined />} />
						</Tooltip>
						<Tooltip title="Cài đặt menu hiển thị">
							<Button type="link" onClick={() => handleOpenSettingMenu(index)} icon={<WindowsOutlined />} />
						</Tooltip>
					</Space>

				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
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
			/>
			<RoleUsers roleInfo={listRoles[addUsersIndex]} show={showAddUsers} setShow={setShowAddUsers} />
			<SetMenuView roleInfo={listRoles[addUsersIndex]} show={showSettingMenu} setShow={setShowSettingMenu}/>
		</Layout.Content>
	);
}

export default Roles;
