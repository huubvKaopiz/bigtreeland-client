import { PlusOutlined } from "@ant-design/icons";
import {
	Button,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Spin,
} from "antd";
import { EmployeeType, UserType } from "interface";
import { debounce, get } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetEmployees } from "store/employees/slice";
import {
	actionAddNewPayment,
	PaymentRequestAddType,
} from "store/payments/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetUsers } from "store/users/slice";
import styled from "styled-components";
import { ROLE_NAMES } from "utils/const";

const Wrapper = styled.div``;

function AddNewPayment(): JSX.Element {
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [paymentForm] = Form.useForm();

	const userList = useSelector((state: RootState) => state.userReducer.users);
	const getUsersStatus = useSelector((state: RootState) => state.userReducer.statusGetUsers);
	const creatorUser = useSelector((state: RootState) => state.auth.user);
	const statusAddNewPayment = useSelector((state: RootState) => state.paymentReducer.addPaymentStatus);


	const debounceSearch = useRef(
		debounce((nextValue) => dispatch(actionGetUsers({ search: nextValue, exclude:ROLE_NAMES.PARENT })), 500)
	).current;

	useEffect(() => {
		console.log(show)
		if(show) dispatch(actionGetUsers({exclude:ROLE_NAMES.PARENT }));
	},[show])

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
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => setShow(true)}
			>
				Th??m chi ti??u
			</Button>
			<Modal
				width={1000}
				visible={show}
				closable={true}
				onCancel={() => setShow(false)}
				footer={[
					<Button key="" onClick={() => {
						setShow(false);
						paymentForm.resetFields();
					}}>
						Hu??? b???
					</Button>,
					<Button type="primary" form="eForm" key="submit" htmlType="submit">
						L??u l???i
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
						<Divider>Th??m chi ti??u m???i</Divider>
						<Form.Item
							name="pay_employee_id"
							label="Ng?????i chi"
							rules={[
								{ required: true, message: "Ng?????i chi kh??ng ???????c ????? tr???ng!" },
							]}
						>
							<Select
								showSearch={true}
								onSearch={(e) => debounceSearch(e)}
								notFoundContent={getUsersStatus === "loading"? <Spin size="small" /> : null}
								filterOption={false}
							>
								{userList &&
									get(userList, "data", []).map((emp: UserType) => (
										<Select.Option key={emp.id} value={emp.id}>
											{`${get(emp,"profile.name","")}`} <a>{emp.phone ?? ''}</a>
										</Select.Option>
									))}
							</Select>
						</Form.Item>

						<Form.Item
							name="amount"
							label="S??? ti???n"
							rules={[
								{ required: true, message: "S??? ti???n kh??ng ???????c ????? tr???ng!" },
							]}
						>
							<InputNumber
								style={{ width: "100%" }}
								formatter={(value) =>
									`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								parser={(value: any) => value.replace(/(,*)/g, "")}
							/>
						</Form.Item>
						<Form.Item
							name="type"
							label="Lo???i chi ti??u"
							rules={[
								{
									required: true,
									message: "Lo???i chi ti??u kh??ng ???????c ????? tr???ng!",
								},
							]}
						>
							<Select>
								<Select.Option value={0}>C??? ?????nh</Select.Option>
								<Select.Option value={1}>Ph??t sinh</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							name="date"
							label="Ng??y thu/ chi"
							rules={[
								{
									required: true,
									message: "Ng??y thu/ chi kh??ng ???????c ????? tr???ng!",
								},
							]}
						>
							<DatePicker />
						</Form.Item>
						<Form.Item
							name="reason"
							label="L?? do"
							rules={[
								{ required: true, message: "L?? do kh??ng ???????c ????? tr???ng!" },
							]}
						>
							<Input.TextArea />
						</Form.Item>
						<Form.Item name="note" label="Ghi ch??">
							<Input.TextArea />
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</Wrapper>
	);
}

export default AddNewPayment;
