import { AuditOutlined, DeleteOutlined, ExclamationCircleOutlined, TeamOutlined, UserOutlined, WindowsOutlined } from '@ant-design/icons';
import { Button, Col, Layout, Modal, Row, Space, Table, Tooltip } from "antd";
import { RoleCreateFormType, RoleType, UserType } from "interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
	actionCreateRole,
	actionDeleteRoles,
	actionGetRoles,
	actionResetStatusDeleteRole,
	actionResetStatusGetRole,
	actionResetStatusUpdateRole
} from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { ROLE_NAMES } from "utils/const";
import { DatePattern, dateSort, formatDate } from "utils/dateUltils";
import { converRoleNameToVN, isRoleDefault } from "utils/ultil";
import AddRolesForm from "./AddRolesForm";
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
		dispatch(actionGetRoles(0));
	}, [dispatch]);

	useEffect(() => {
		if (statusCreateRole === "success") dispatch(actionGetRoles(0));
		if (statusGetRoles === "success") dispatch(actionResetStatusGetRole());
		if (statusUpdateRole === "success") {
			dispatch(actionGetRoles(0));
			dispatch(actionResetStatusUpdateRole());
		}
		if (statusDeleteRoles === "success") {
			dispatch(actionGetRoles(0));
			dispatch(actionResetStatusDeleteRole());
		}
	}, [dispatch, statusCreateRole, statusDeleteRoles, statusGetRoles, statusUpdateRole]);

	function handleAddRoles(formValue: RoleCreateFormType, permissionsSelected: React.Key[]) {
		dispatch(actionCreateRole({ ...formValue, permission_ids: [...permissionsSelected] }));
	}

	function handleDeleteRole(roleID: number) {
		confirm({
			title: "B???n mu???n xo?? vai tr?? n??y?",
			icon: <ExclamationCircleOutlined />,
			content: "L??u ?? khi xo?? vai tr??, t???t c??? quy???n c???a nh??n vi??n c?? vai tr?? n??y s??? b??? xo??!",
			onOk() {
				dispatch(actionDeleteRoles(roleID)).finally(() => {
					dispatch(actionGetRoles(0));
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
			title: "T??n",
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
			title: "S??? th??nh vi??n",
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
			title: "Ng??y t???o",
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
						<Tooltip title="Xo?? vai tr??">
							<Button type="link" danger disabled={isRoleDefault(record.name)} onClick={() => handleDeleteRole(record.id)} icon={<DeleteOutlined />} />
						</Tooltip>
						<Tooltip title="DS ng?????i d??ng">
							<Button type="link" icon={<TeamOutlined />} onClick={() => handleAddUsers(index)} />
						</Tooltip>
						<Tooltip title="Ph??n quy???n vai tr??">
							<Button type="link" onClick={() => history.push(`/roles-set-permissions/${record.id}`)} icon={<AuditOutlined />} />
						</Tooltip>
						<Tooltip title="C??i ?????t menu hi???n th???">
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
				rowKey="id"
			/>
			<RoleUsers roleInfo={listRoles[addUsersIndex]} show={showAddUsers} setShow={setShowAddUsers} />
			<SetMenuView roleInfo={listRoles[addUsersIndex]} show={showSettingMenu} setShow={setShowSettingMenu}/>
		</Layout.Content>
	);
}

export default Roles;
