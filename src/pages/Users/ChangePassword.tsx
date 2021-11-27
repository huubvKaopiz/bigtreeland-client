import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Space, Spin, Tooltip } from "antd";
import validateMessage from "lib/validateMessage";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionResetStatusChangePassword } from "store/users/slice";
import { PasswordFormProps } from "../../interface/interfaces";

interface Props {
	handleChangePass: (payload: { new_password: string; user_id: number }) => void;
	userId?: number;
}

function ChangePassword(props: Props): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [form] = Form.useForm();
	const { handleChangePass, userId } = props;
	const statusChangePassword = useSelector((state: RootState) => state.userReducer.statusChangePassword);
	const selfChagnePassword = !props.userId;
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (statusChangePassword === "success") {
			setShowForm(false);
			dispatch(actionResetStatusChangePassword());
		}
	}, [statusChangePassword, dispatch]);

	const from_layout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 18 },
	};

	function onFinish(passwordValue: PasswordFormProps) {
		if (!userId) return;
		const payload = {
			user_id: userId,
			new_password: passwordValue.new_password,
		};
		handleChangePass(payload);
	}

	function handleResetFormField() {
		form.resetFields();
	}

	return (
		<div>
			{selfChagnePassword ? (
				<span onClick={() => setShowForm(true)}>Đổi mật khẩu</span>
			) : (
				<Tooltip placement="top" title="Đổi mật khẩu">
				<Button type="link" icon={<EditOutlined  />} onClick={() => setShowForm(true)} />
				</Tooltip>
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
				<Spin spinning={statusChangePassword === "loading"}>
					<Form {...from_layout} labelAlign="left" name="nest-messages" onFinish={onFinish} form={form}>
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

export default ChangePassword;
