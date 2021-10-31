import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space } from "antd";
import validateMessage from "lib/validateMessage";
import React, { useState } from "react";
import { AddNewUser } from "utils/interfaces";

function AddNewUserForm({ onAddUser }: { onAddUser: (userInfo: AddNewUser) => void }): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [form] = Form.useForm();

	const form_layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	const listRole = [
		{
			label: "admin",
			value: 0,
		},
		{
			label: "teacher",
			value: 1,
		},
		{
			label: "parrent",
			value: 2,
		},
	];
	function handleResetFormField() {
		form.resetFields();
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
				<Form {...form_layout} labelAlign="left" name="nest-messages" onFinish={onAddUser} form={form}>
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
						label="Số điện thoại"
						rules={[{ required: true, message: validateMessage.REQUIRE }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name={"password"} label="Role" rules={[{ required: true, message: validateMessage.REQUIRE }]}>
						<Select options={listRole} />
					</Form.Item>
					<Form.Item name={"role"} label="Mật khẩu" rules={[{ required: true, message: validateMessage.REQUIRE }]}>
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
			</Modal>
		</>
	);
}

export default AddNewUserForm;
