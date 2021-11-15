/* eslint-disable no-mixed-spaces-and-tabs */
import { Button, Divider, Form, Input, Modal, Table } from "antd";
import { RoleType, UserType } from "interface";
import { UpdateRoleDataType } from "interface/api-params-interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PermistionType } from "store/permissions/slice";
import { RootState } from "store/store";
import { ArrayEquals } from "utils/objectUtils";


interface RoleDetailProps {
	roleDetail: RoleType | undefined;
	show: boolean;
	onClose: () => void;
	onChange: (updateObject: UpdateRoleDataType) => void;
}

function RoleDetail({ show, roleDetail, onClose, onChange }: RoleDetailProps): JSX.Element {
	const [roleName, setRoleName] = useState(roleDetail?.name);

	// Select user
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [userOptions, setUserOptions] = useState<UserType[]>([]);
	const [userSelected, setUserSelected] = useState<React.Key[]>([]);
	const [userGranted, setUserGranted] = useState<React.Key[]>([]);

	//Permision List
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);
	const [permissionsOptions, setPermissionsOptions] = useState<PermistionType[]>([]);
	const [permissionsSelected, setPermissionsSelected] = useState<React.Key[]>([]);
	const [permissionsGranted, setPermissionsGranted] = useState<React.Key[]>([]);

	useEffect(() => {
		setRoleName(roleDetail?.name);
		users?.data &&
			setUserOptions(
				users.data.map((user) => ({
					...user,
					key: user.id,
					type: "user",
				}))
			);

		permissions &&
			setPermissionsOptions(
				permissions
					.map((p) => ({
						...p,
						key: p.id,
					}))
					.sort((a, b) => a.name.localeCompare(b.name))
			);
		const pGranted = roleDetail?.permissions.map((p) => p.id) as React.Key[];
		setPermissionsGranted(pGranted);
		setPermissionsSelected(pGranted);
		const userGranted = roleDetail?.users.map((u) => u.id) as React.Key[];
		setUserGranted(userGranted);
		setUserSelected(userGranted);
	}, [permissions, roleDetail, users]);

	function selecUsertRow(record: UserType) {
		if (record.key) {
			const selectedRowKeys: React.Key[] = [...userSelected];
			if (selectedRowKeys.indexOf(record.key) >= 0) {
				selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
			} else {
				selectedRowKeys.push(record.key);
			}
			setUserSelected(selectedRowKeys);
		}
	}
	function handleEditRole() {
		const listPermissionAdded = permissionsSelected.filter((permission) => !permissionsGranted.includes(permission));
		const listPermissionRemoved = permissionsGranted.filter((permission) => !permissionsSelected.includes(permission));

		const updateObject: UpdateRoleDataType = {
			role_id: roleDetail?.id,
		};
		const changeRoleName = roleName !== roleDetail?.name;
		const changeUser = !ArrayEquals(userGranted, userSelected);
		const changePermission = listPermissionAdded.length !== 0 || listPermissionRemoved.length !== 0;
		if (changeRoleName) updateObject.role_name = roleName;
		if (changePermission)
			updateObject.permission = { added: [...listPermissionAdded], removed: [...listPermissionRemoved] };
		if (changeUser) updateObject.user_ids = [...userSelected];
		if (changeRoleName || changePermission || changeUser)
			onChange(updateObject);
		onClose();
	}

	function handleUserChange(value: React.Key[]) {
		setUserSelected(value);
	}

	function selectRow(record: PermistionType) {
		if (record.key) {
			const selectedRowKeys: React.Key[] = [...permissionsSelected];
			if (selectedRowKeys.indexOf(record.key) >= 0) {
				selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
			} else {
				selectedRowKeys.push(record.key);
			}
			setPermissionsSelected(selectedRowKeys);
		}
	}
	function handlePermissionChange(value: React.Key[]) {
		setPermissionsSelected(value);
	}

	const tableUserColumn = [
		{
			title: "Id",
			key: "id",
			dataIndex: "id",
			render: function RenderUserID(text: string): JSX.Element {
				return <a className="example-link">{text}</a>;
			},
			width: 150,
		},
		{
			title: "Tên người dùng",
			key: "name",
			dataIndex: "name",
			render: function RenderUserName(text: string): JSX.Element {
				return <a className="example-link">{text}</a>;
			},
		},
	];

	const tablePermissionColumn = [
		{
			title: "Chức năng",
			key: "function",
			dataIndex: "name",
			render: function UserLink(text: string): JSX.Element {
				return <a className="example-link">{text.split(".")[0]}</a>;
			},
		},
		{
			title: "Danh sách quyền",
			key: "name",
			dataIndex: "name",
			render: function UserLink(text: string): JSX.Element {
				return <a className="example-link">{text.split(".")[1]}</a>;
			},
		},
	];
	return (
		<>
			<Modal
				title={`Danh sách quyền cho ${roleName}`}
				width={1000}
				visible={show}
				closable={true}
				onCancel={onClose}
				footer={[
					<Button
						key=""
						onClick={() => {
							setPermissionsSelected(permissionsGranted);
							onClose();
						}}
					>
						Cancel
					</Button>,
					<Button type="primary" key="submit" onClick={handleEditRole}>
						Lưu thay đổi
					</Button>,
				]}
			>
				<Form.Item label="Tên">
					<Input value={roleName} onChange={(e) => setRoleName(e.target.value)}></Input>
				</Form.Item>
				<Divider>Danh sách thành viên của {roleName}</Divider>
				<Table
					columns={tableUserColumn}
					dataSource={userOptions}
					pagination={false}
					scroll={{ y: 200 }}
					rowSelection={{
						type: "checkbox",
						onChange: handleUserChange,
						selectedRowKeys: userSelected,
					}}
					bordered
					onRow={(record) => ({
						onClick: () => selecUsertRow(record),
					})}
				/>
				<Divider>Danh sách quyền cho {roleName}</Divider>
				<Table
					columns={tablePermissionColumn}
					dataSource={permissionsOptions}
					pagination={false}
					scroll={{ y: 250 }}
					rowSelection={{
						type: "checkbox",
						onChange: handlePermissionChange,
						selectedRowKeys: permissionsSelected,
					}}
					bordered
					onRow={(record) => ({
						onClick: () => selectRow(record),
					})}
				/>
			</Modal>
		</>
	);
}

export default React.memo(RoleDetail);
