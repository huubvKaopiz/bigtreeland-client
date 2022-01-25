import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Spin } from "antd";
import { AddNewUser } from "interface/interfaces";
import validateMessage from "lib/validateMessage";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetRoles } from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetUsers, actionResetStatusAddUser } from "store/users/slice";

function AddNewUserForm({
	onAddUser,
}: {
	onAddUser: (userInfo: AddNewUser) => void;
}): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [form] = Form.useForm();
	const status = useSelector(
		(state: RootState) => state.userReducer.statusAddUser
	);
	const storeListRoles = useSelector(
		(state: RootState) => state.roleReducer.roles
	);
	const dispatch = useAppDispatch();
	const [listRole, setListRole] = useState<{ label: string; value: number }[]>(
		[]
	);

	useEffect(() => {
		dispatch(actionGetRoles(0));
	}, [dispatch]);

	useEffect(() => {
		console.log(storeListRoles);
		setListRole(
			storeListRoles.map((role) => ({
				label: role.name,
				value: role.id,
			}))
		);
	}, [storeListRoles]);
	const form_layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};

	function handleResetFormField() {
		form.resetFields();
	}
	function handleAddUser(userInfo: AddNewUser) {
		onAddUser(userInfo);
	}

	useEffect(() => {
		if (status === "success") {
			setShowForm(false);
			dispatch(actionResetStatusAddUser());
			dispatch(actionGetUsers({}));
		}
	}, [status, dispatch]);

	return (
		<>
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => setShowForm(true)}
			>
				Thêm người dùng
			</Button>
			<Modal
				title="Thêm tài khoàn người dùng mới"
				centered
				visible={showForm}
				onCancel={() => {
					setShowForm(false);
					handleResetFormField();
				}}
				footer={false}
				width={800}
			>
				<Spin spinning={status === "loading"}>
					<Form
						{...form_layout}
						labelAlign="left"
						name="nest-messages"
						onFinish={handleAddUser}
						form={form}
					>
						<Form.Item
							name={"email"}
							label="Email"
							rules={[
								{ type: "email", message: validateMessage.EMAIL },
								{ required: true, message: validateMessage.REQUIRE },
							]}
						>
							<Input />
						</Form.Item>

						<Form.Item
							name={"phone"}
							label="Phone"
							rules={[{ required: true, message: validateMessage.REQUIRE }]}
						>
							<Input />
						</Form.Item>

						<Form.Item
							name={"name"}
							label="Tên người dùng"
							rules={[{ required: true, message: validateMessage.REQUIRE }]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							name={"role_id"}
							label="Role"
							rules={[{ required: true, message: validateMessage.REQUIRE }]}
						>
							<Select options={listRole} />
						</Form.Item>
						<Form.Item
							name={"password"}
							label="Mật khẩu"
							rules={[{ required: true, message: validateMessage.REQUIRE }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item wrapperCol={{ offset: 8 }}>
							<Space size="large">
								<Button type="primary" htmlType="submit">
									Submit
								</Button>
								<Button onClick={handleResetFormField}>Reset</Button>
							</Space>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</>
	);
}

export default AddNewUserForm;
