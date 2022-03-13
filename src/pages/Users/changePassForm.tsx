import { Button, Form, Input, Modal, Space } from "antd";
import { PasswordFormProps, User } from "interface";
import validateMessage from "lib/validateMessage";
import React, { useState } from "react";

interface Props {
	user: User;
	handleChangePass: (user: User, passwordForm: PasswordFormProps) => void;
}

function ChangePassForm(props: Props): JSX.Element {
	const { user } = props;
	const [showForm, setShowForm] = useState(false);
	const [form] = Form.useForm();

	const from_layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};

	function handleChangePass(passwordValue: PasswordFormProps) {
		props.handleChangePass(user, passwordValue);
		setShowForm(false);
		handleResetFormField()
	}

	function handleResetFormField() {
		form.resetFields();
	}

	return (
		<div>
			<Button onClick={() => setShowForm(true)}>Đổi mật khẩu </Button>
			<Modal
				title="Thay đổi mật khẩu"
				centered
				visible={showForm}
				onCancel={() => {
					setShowForm(false);
					handleResetFormField();
				}}
				footer={false}
				width={800}
			>
				<Form {...from_layout} labelAlign="left" name="nest-messages" onFinish={handleChangePass} form={form}>
					<Form.Item
						name={"old_password"}
						label="Mật khẩu hiện tại"
						rules={[{ required: true, message: validateMessage.REQUIRE }]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						name={"new_password"}
						label="Mật khẩu mới"
						rules={[{ required: true, message: validateMessage.REQUIRE }]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						name={"confirm_new_password"}
						label="Xác nhận mật khẩu mới"
						dependencies={["new_password"]}
						rules={[
							{ required: true, message: validateMessage.REQUIRE },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue("new_password") === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error(validateMessage.NEW_PASSWORD_NOT_MATCH));
								},
							}),
						]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8 }}>
						<Space>
							<Button type="primary" htmlType="submit">
								Submit
							</Button>
							<Button onClick={handleResetFormField}>Reset</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

export default ChangePassForm;
