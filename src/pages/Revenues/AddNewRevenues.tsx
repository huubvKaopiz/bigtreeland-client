import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select, Spin } from "antd";
import { EmployeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RevenuesRequestAddType, RevenuesTypeList } from "store/revenues/slice";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";

const Wrapper = styled.div``;

function AddNewRevenues(): JSX.Element {
    const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [receiveType, setReceiveType] = useState(0);
	const [paymentForm] = Form.useForm();
    
	//Redux state
    const dispatch = useAppDispatch();
    const creatorUser = useSelector((state: RootState) => state.auth.user);
	const userList = useSelector((state: RootState) => state.employeeReducer.employees);

	console.log("add receive re-render");

	function submitForm(formValue: RevenuesRequestAddType) {
		const formData = { ...formValue };
        formData.date = moment(formValue.date).format("YYYY-MM-DD");
        formData.creator_id = creatorUser?.id;
	}

	return (
		<Wrapper>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thêm mới doanh thu
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
						<Divider>Thêm chi doanh thu</Divider>
						<Form.Item name="sale_id" label="Người thu">
							<Select>
								{userList &&
									get(userList, "data", []).map((emp: EmployeeType) => (
										<Select.Option key={emp.user.id} value={emp.user.id}>
											{`${emp.name} - ${emp.email}`}
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
							<Select onChange={(v) => v !== undefined && setReceiveType(+v)}>
								{RevenuesTypeList.map((v, i) => (
									<Select.Option value={i} key={i}>
										{v}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="date"
							label="Ngày thu"
							rules={[{ required: true, message: "Ngày thu không được để trống!" }]}
						>
							<DatePicker />
						</Form.Item>
						{receiveType === 0 && (
							<Form.Item name="reason" label="Lý do">
								<Input.TextArea />
							</Form.Item>
						)}
						<Form.Item name="note" label="Ghi chú">
							<Input.TextArea />
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</Wrapper>
	);
}

export default AddNewRevenues;
