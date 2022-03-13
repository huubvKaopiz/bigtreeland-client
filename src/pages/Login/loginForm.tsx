import { Button, Checkbox, Form, Input, Layout, notification } from "antd";
import { useForm } from "antd/lib/form/Form";
import { AxiosError } from "axios";
import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "lib/fire-base";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import logo from "../../assets/image/mainlogo.png";
import useIsMounted from "../../hooks/useIsMounted";
import validateMessage from "../../lib/validateMessage";
import {
	actionLogin,
	actionResetStatusUserVerified,
	actionVerifyAccount,
	PayloadLogin
} from "../../store/auth/slice";
import { RootState, useAppDispatch } from "../../store/store";

const { Content } = Layout;

function LoginForm(): JSX.Element {
	// const counter = useSelector((state: RootState) => state.counter);
	const [form] = useForm();
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);
	const userLogin = useSelector((state: RootState) => state.auth.user);
	const statusUserVerify = useSelector(
		(state: RootState) => state.auth.statusUserVerified
	);
	const isMounted = useIsMounted();

	const onFinish = (values: PayloadLogin) => {
		setLoading(true);
		dispatch(actionLogin(values)).then((res) => {
			if (isMounted.current) setLoading(false);
			if (get(res, "payload", null)) {
				if (res.meta.requestStatus === "fulfilled")
					notification.success({
						message: "Đăng nhập thành công!",
					});
				else {
					const payload = res.payload as AxiosError;
					if (payload?.response?.status === 400) {
						const phoneField: string = form.getFieldValue("phone");
						const phone = phoneField.split("");
						phone[0] = "+84";
						signInWithPhoneNumber(
							auth(),
							phone.join(""),
							window.recaptchaVerifier
						)
							.then((confirmationResult) => {
								window.confirmationResult = confirmationResult;
							})
							.catch(() => {
								// Error; SMS not sent
							});
					} else {
						notification.error({
							message: get(res, "payload.response.data.error", "Login fail"),
						});
					}
				}
			}
		});
	};
	useEffect(() => {
		dispatch(actionResetStatusUserVerified());
	}, [dispatch]);

	useEffect(() => {
		if (statusUserVerify === "waiting") console.log();
		else if (statusUserVerify === "idle") form.resetFields();
	}, [form, statusUserVerify]);

	function verifyPhone() {
		const code = form.getFieldValue("code");
		console.log("into verify");
		window.confirmationResult
			.confirm(code)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.then((result: any) => {
				// User signed in successfully.
				const user = result.user;
				dispatch(actionVerifyAccount({ access_token: user.accessToken }));
				dispatch(actionResetStatusUserVerified());
				// ...
			})
			.catch(() => {
				notification.error({ message: "Xác nhận thất bại" });
				// User couldn't sign in (bad verification code?)
				// ...
			});
	}

	if (userLogin) return <Redirect to="/" />;
	return (
		<Layout>
			<Content>
				<section
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100vh",
						backgroundColor: "rgba(240, 242, 245, 0.1)",
					}}
				>
					<div>
						<div>
							<h1
								style={{
									color: "#141414",
									fontSize: 48,
									fontWeight: 700,
									letterSpacing: -0.3,
									margin: "0px 0px 15px",
									textAlign: "left",
									paddingLeft: 20,
									lineHeight: "72px",
									fontFamily: "sans-serif",
								}}
							>
								Sign In
							</h1>
							<h5
								style={{
									color: "#8c8c8c",
									fontSize: 20,
									letterSpacing: -0.3,
									margin: "0px 0px 15px",
									textAlign: "left",
									paddingLeft: 20,
									lineHeight: "30px",
									fontFamily: "sans-serif",
								}}
							>
								Enter your phone and password to sign in
							</h5>
						</div>

						<Form
							form={form}
							style={{
								display: "block",
								margin: "auto auto",
								width: 500,
								paddingTop: 20,
								paddingLeft: 20,
								paddingRight: 30,
								paddingBottom: 20,
							}}
							name="basic"
							labelCol={{ span: 6 }}
							wrapperCol={{ span: 18 }}
							initialValues={{ remember: true }}
							onFinish={onFinish}
							layout="vertical"
						>
							{statusUserVerify !== "waiting" && (
								<>
									<Form.Item
										label="Phone"
										name="phone"
										rules={[
											{ required: true, message: validateMessage.REQUIRE },
										]}
									>
										<Input />
									</Form.Item>

									<Form.Item
										label="Password"
										name="password"
										rules={[
											{ required: true, message: validateMessage.REQUIRE },
										]}
									>
										<Input.Password />
									</Form.Item>

									<Form.Item
										name="remember"
										valuePropName="checked"
										wrapperCol={{ offset: 0, span: 16 }}
									>
										<Checkbox>Remember me</Checkbox>
									</Form.Item>

									<Form.Item>
										<Button
											style={{ display: "block", width: "100%" }}
											type="primary"
											htmlType="submit"
											loading={loading}
										>
											Login
										</Button>
									</Form.Item>
								</>
							)}
							{statusUserVerify === "waiting" && (
								<>
									<Form.Item
										label="Mã xác minh"
										name="code"
										rules={[
											{ required: true, message: validateMessage.REQUIRE },
										]}
									>
										<Input />
									</Form.Item>
									<Form.Item>
										<Button
											style={{ display: "block", width: "100%" }}
											type="primary"
											loading={loading}
											onClick={verifyPhone}
										>
											Xác minh
										</Button>
									</Form.Item>
								</>
							)}
						</Form>
					</div>
					<img
						style={{ maxWidth: "50%", margin: "auto 0", paddingRight: 200 }}
						src={logo}
						alt=""
					/>
				</section>
			</Content>
		</Layout>
	);
}

export default LoginForm;
