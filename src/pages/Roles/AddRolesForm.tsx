import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Spin, Table, Tag } from "antd";
import { OptionType, RoleCreateFormType } from "interface";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetPermissions } from "store/permissions/slice";
import { actionResetStatusCreateRole } from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
// import { actionGetUsers } from "store/users/slice";

const { Option } = Select;
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
	const [userSelected, setUserSelected] = useState<OptionType[]>([]);

	// permisson
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
		// dispatch(actionGetUsers());
		dispatch(actionGetPermissions({}));
	}, [dispatch]);



	function handleUserChange(value: OptionType[]) {
		setUserSelected(value);
	}

	return (
		<div>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thêm vai trò mới
			</Button>
			<Modal
				title="Thêm vai trò mới"
				width={600}
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
							label={<>Tên vai trò(
								<span style={{ color: "#e74c3c" }}>viết liền, không dấu, không trùng với vai trò khác</span>
								)</>}
							rules={[{ required: true, message: "Tên vai trò không được để trống!" }]}
						>
							<Input autoComplete="off" />
						</Form.Item>
						<Form.Item
							name="description"
							label="Mô tả"
						>
							<Input autoComplete="off" />
						</Form.Item>
						<Form.Item label="Thêm thành viên mới" name="user_ids">
							<Select
								mode="multiple"
								showArrow
								style={{ width: "100%" }}
								listHeight={600}
								// options={userOptions}
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
							>
								{
									get(users, "data", []).map((u) => <Option value={u.id} key={u.id}><a>{get(u, "profile.name", "")}</a> {u.phone}</Option>)
								}

							</Select>
						</Form.Item>
						{/* <Form.Item label="Thêm quyền" name="permission_ids">
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
						</Form.Item> */}
					</Form>
				</Spin>
			</Modal>
		</div>
	);
}

export default AddRolesForm;
