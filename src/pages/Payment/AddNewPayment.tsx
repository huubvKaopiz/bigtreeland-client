import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import React, { useState } from "react";
import styled from "styled-components";

const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };

const Wrapper = styled.div`
	.number-input {
		background-color: red;
	}
`;

function AddNewPayment(): JSX.Element {
	const [show, setShow] = useState(false);
	const [paymentForm] = Form.useForm();

	const submitForm = () => {
		console.log();
	};

	return (
		<Wrapper>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thu/ Chi
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
				<Form
					id="eForm"
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					form={paymentForm}
					onFinish={submitForm}
				>
					<Divider>Cập nhật thu chi mới</Divider>

					<Form.Item
						name="amount"
						label="Số tiền"
						rules={[{ required: true, message: "Số tiền không được để trống!" }]}
					>
						<InputNumber
							className="number-input"
							defaultValue={0}
							formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value: any) => value.replace(/(,*)/g, "")}
						/>
					</Form.Item>
					<Form.Item
						name="type"
						label="Loại thu/ chi"
						rules={[{ required: true, message: "Loại thu/ chi không được để trống!" }]}
					>
						<Select>
							<Select.Option value={1}>Thu</Select.Option>
							<Select.Option value={0}>Chi</Select.Option>
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
			</Modal>
		</Wrapper>
	);
}

export default AddNewPayment;
