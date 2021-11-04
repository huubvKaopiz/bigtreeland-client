import { Button, Form, Input, Modal, notification, Space, Spin } from "antd";
import { AxiosResponse } from "axios";
import validateMessage from "lib/validateMessage";
import React, { useState } from "react";
import { PasswordFormProps } from "../../interface/interfaces";

interface Props {
	handleChangePass: (passwordForm: PasswordFormProps, userId: string | number | undefined) => Promise<AxiosResponse>;
	userId?: string | number;
}

function ChangePassForm(props: Props): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const selfChagnePassword = !props.userId;
	const userId = props.userId;

	const from_layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};

	function handleChangePass(passwordValue: PasswordFormProps) {
		setLoading(true);
		props
			.handleChangePass(passwordValue, userId)
			.then(() => {
				notification.success({
					message: "Đổi mật khẩu thành công!",
				});
				setShowForm(false);
				handleResetFormField();
			})
			.catch(() => {
				notification.error({
					message: "Có lỗi xảy ra!",
				});
			})
			.finally(() => setLoading(false));
	}

	function handleResetFormField() {
		form.resetFields();
	}

	return (
		<div>
			{selfChagnePassword ? (
				<span onClick={() => setShowForm(true)}>Đổi mật khẩu</span>
			) : (
				<Button onClick={() => setShowForm(true)}>Đổi mật khẩu </Button>
			)}
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
				<Spin spinning={loading}>
					<Form {...from_layout} labelAlign="left" name="nest-messages" onFinish={handleChangePass} form={form}>
						{selfChagnePassword && (
							<Form.Item
								name={"old_password"}
								label="Mật khẩu hiện tại"
								rules={[{ required: true, message: validateMessage.REQUIRE }]}
							>
								<Input.Password />
							</Form.Item>
						)}

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
				</Spin>
			</Modal>
		</div>
	);
}

export default ChangePassForm;
