import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select, Spin } from "antd";
import { EmployeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetEmployees } from "store/employees/slice";
import { actionAddNewPayment, PaymentRequestAddType } from "store/payments/slice";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";

const Wrapper = styled.div``;

function AddNewPayment(): JSX.Element {
	const dispatch = useAppDispatch();
	const userList = useSelector((state: RootState) => state.employeeReducer.employees);
	const creatorUser = useSelector((state: RootState) => state.auth.user);
	const statusAddNewPayment = useSelector((state: RootState) => state.paymentReducer.addPaymentStatus);
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [paymentForm] = Form.useForm();

	useEffect(() => {
		dispatch(actionGetEmployees({}));
	}, [dispatch]);

	useEffect(() => {
		if (statusAddNewPayment === "loading") {
			setLoading(true);
		} else if (statusAddNewPayment === "success") {
			setLoading(false);
			setShow(false);
			paymentForm.resetFields();
		} else if (statusAddNewPayment === "error") setLoading(false);
	}, [statusAddNewPayment, paymentForm]);

	function submitForm(formValue: PaymentRequestAddType): void {
		const formData = { ...formValue };
		formData.date = moment(formValue.date).format("YYYY-MM-DD");
		formData.creator_employee_id = creatorUser?.id;
		dispatch(actionAddNewPayment(formData));
	}

	return (
		<Wrapper>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thêm mới chi tiêu
			</Button>
			<Modal
				width={1000}
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
				<Spin spinning={loading}>
					<Form
						id="eForm"
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 14 }}
						layout="horizontal"
						form={paymentForm}
						onFinish={submitForm}
					>
						<Divider>Thêm chi tiêu mới</Divider>
						<Form.Item
							name="pay_employee_id"
							label="Người chi"
							rules={[{ required: true, message: "Người chi không được để trống!" }]}
						>
							<Select>
								{userList &&
									get(userList, "data", []).map((emp: EmployeeType) => (
										<Select.Option key={emp.id} value={emp.id}>
											{`${emp.name} - ${emp.profile?.email ?? ''}`}
										</Select.Option>
									))}
							</Select>
						</Form.Item>

						<Form.Item
							name="amount"
							label="Số tiền"
							rules={[{ required: true, message: "Số tiền không được để trống!" }]}
						>
							<InputNumber
								style={{ width: "100%" }}
								formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
								parser={(value: any) => value.replace(/(,*)/g, "")}
							/>
						</Form.Item>
						<Form.Item
							name="type"
							label="Loại chi tiêu"
							rules={[{ required: true, message: "Loại chi tiêu không được để trống!" }]}
						>
							<Select>
								<Select.Option value={0}>Cố định</Select.Option>
								<Select.Option value={1}>Phát sinh</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							name="date"
							label="Ngày thu/ chi"
							rules={[{ required: true, message: "Ngày thu/ chi không được để trống!" }]}
						>
							<DatePicker />
						</Form.Item>
						<Form.Item name="reason" label="Lý do" rules={[{ required: true, message: "Lý do không được để trống!" }]}>
							<Input.TextArea />
						</Form.Item>
						<Form.Item name="note" label="Ghi chú">
							<Input.TextArea />
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</Wrapper>
	);
}

export default AddNewPayment;
