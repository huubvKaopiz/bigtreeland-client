import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Spin, Table, Tag } from "antd";
import { OptionType, RoleCreateFormType } from "interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetPermissions, PermistionType } from "store/permissions/slice";
import { actionResetStatusCreateRole } from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetUsers } from "store/users/slice";

const permisionColumns = [
	{
		title: "ID",
		dataIndex: "id",
	},
	{
		title: "Tên quyền",
		dataIndex: "name",
	},
];

function AddRolesForm({
	onHandleSubmit,
}: {
	onHandleSubmit: (formValue: RoleCreateFormType, permissionsSelected: React.Key[]) => void;
}): JSX.Element {
	const dispatch = useAppDispatch();
	const [newRolesForm] = Form.useForm();
	const [show, setShow] = useState(false);
	const statusCreateRole = useSelector((state: RootState) => state.roleReducer.statusCreateRole);

	// Select user
	const users = useSelector((state: RootState) => state.userReducer.users);
	const [userOptions, setUserOptions] = useState<OptionType[]>([]);
	const [userSelected, setUserSelected] = useState<OptionType[]>([]);

	// permisson
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);
	const [permissionsOptions, setPermissionsOptions] = useState<PermistionType[]>([]);
	const [permissionsSelected, setPermissionsSelected] = useState<React.Key[]>([]);

	useEffect(() => {
		if (statusCreateRole === "success") {
			newRolesForm.resetFields();
			setPermissionsSelected([]);
			setUserSelected([]);
			setShow(false);
			dispatch(actionResetStatusCreateRole());
		}
	}, [newRolesForm, statusCreateRole, dispatch]);

	useEffect(() => {
		dispatch(actionGetUsers());
		dispatch(actionGetPermissions());
	}, [dispatch]);

	useEffect(() => {
		users?.data &&
			setUserOptions(
				users.data.map((user) => ({
					label: user.name,
					value: user.id,
				}))
			);

		permissions &&
			setPermissionsOptions(
				permissions.map((p) => ({
					...p,
					key: p.id,
				}))
			);
	}, [users, permissions]);

	function handleUserChange(value: OptionType[]) {
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

	return (
		<div>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thêm vai trò mới
			</Button>
			<Modal
				title="Thêm vai trò mới"
				width={800}
				visible={show}
				closable={true}
				onCancel={() => setShow(false)}
				footer={[
					<Button key="" onClick={() => setShow(false)}>
						Cancel
					</Button>,
					<Button type="primary" form="eForm" key="submit" htmlType="submit">
						Submit
					</Button>,
				]}
			>
				<Spin spinning={statusCreateRole === "loading"}>
					<Form
						id="eForm"
						form={newRolesForm}
						layout="vertical"
						onFinish={(formValue) => {
							onHandleSubmit(formValue, permissionsSelected);
						}}
					>
						<Form.Item
							name="name"
							label="Tên vai trò mới"
							rules={[{ required: true, message: "Tên vai trò không được để trống!" }]}
						>
							<Input autoComplete="off" />
						</Form.Item>
						<Form.Item label="Thêm thành viên mới" name="user_ids">
							<Select
								mode="multiple"
								showArrow
								style={{ width: "100%" }}
								listHeight={600}
								options={userOptions}
								value={userSelected}
								onChange={(value: OptionType[]) => handleUserChange(value)}
								tagRender={(selectProps) => (
									<Tag
										color="green"
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										closable={selectProps.closable}
										onClose={selectProps.onClose}
										style={{ fontSize: 15, margin: "5px 5px", padding: 5 }}
									>
										{selectProps.label}
									</Tag>
								)}
							/>
						</Form.Item>
						<Form.Item label="Thêm quyền" name="permission_ids">
							<Table
								rowSelection={{
									type: "checkbox",
									onChange: handlePermissionChange,
									selectedRowKeys: permissionsSelected,
								}}
								pagination={false}
								scroll={{ y: 300 }}
								columns={permisionColumns}
								dataSource={permissionsOptions}
								onRow={(record) => ({
									onClick: () => selectRow(record),
								})}
							/>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</div>
	);
}

export default AddRolesForm;
