import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Select, Space, Spin } from "antd";
import { AxiosResponse } from "axios";
import validateMessage from "lib/validateMessage";
import React, { useState } from "react";
import { AddNewUser } from "interface/interfaces";

function AddNewUserForm({ onAddUser }: { onAddUser: (userInfo: AddNewUser) => Promise<AxiosResponse> }): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const form_layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	// Huu.bv get listRole từ redux
	const listRole = [
		{
			label: "admin",
			value: 1,
		},
		{
			label: "teacher",
			value: 2,
		},
		{
			label: "parrent",
			value: 3,
		},
	];
	function handleResetFormField() {
		form.resetFields();
	}
	function handleAddUser(userInfo: AddNewUser) {
		setLoading(true)
		onAddUser(userInfo)
			.then(() => {
				notification.success({
					message: "Tạo người dùng mới thành công!",
				});
				handleResetFormField();
				setShowForm(false);
				return Promise.resolve()
			})
			.then(() => {
				// Huu.bv Todo update lai danh sách user 
			})
			.catch((e) => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
				console.log(e.response?.data?.message);
			})
			.finally(() => setLoading(false));
	}
	return (
		<>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
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
				<Spin spinning={loading}>
					<Form {...form_layout} labelAlign="left" name="nest-messages" onFinish={handleAddUser} form={form}>
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
							name={"name"}
							label="Tên người dùng"
							rules={[{ required: true, message: validateMessage.REQUIRE }]}
						>
							<Input />
						</Form.Item>
						<Form.Item name={"role_id"} label="Role" rules={[{ required: true, message: validateMessage.REQUIRE }]}>
							<Select options={listRole} />
						</Form.Item>
						<Form.Item name={"password"} label="Mật khẩu" rules={[{ required: true, message: validateMessage.REQUIRE }]}>
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
