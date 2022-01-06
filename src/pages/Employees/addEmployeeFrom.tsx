import { Form, Modal, Button, Input, Select, DatePicker, Divider, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { actionAddEmployee, actionGetEmployees, actionResetAddEmployeeStatus } from "store/employees/slice";
import moment from "moment";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { RoleType } from "interface";

const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };

export default function AddEmplyeeForm(props: { roles: RoleType[] }): JSX.Element {
	const { roles } = props;
	const [aForm] = Form.useForm();
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const status = useSelector((state: RootState) => state.employeeReducer.addEmployeeStatus);

	useEffect(() => {
		if (status === "success") {
			setShow(false);
			dispatch(actionGetEmployees({}));
			dispatch(actionResetAddEmployeeStatus());
		}
	}, [status, dispatch]);

	const submitForm = (values: any) => {
		const data = {
			...values,
			birthday: moment(values.birthday).format("YYYY-MM-DD"),
			working_day: moment(values.working_day).format("YYYY-MM-DD"),
		};

		dispatch(actionAddEmployee(data));
	};

	const reFresh = () => {
		aForm.setFieldsValue({
			name: "",
			email: "",
			phone: "",
			gender: 0,
			birthday: "",
			address: "",
			interests: "",
			disklikes: "",
			identifier: "",
			basic_salary: "",
			sales_salary: "",
			role_id: 0,
			working_day: "",
		});
	};

	return (
		<div>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Thêm nhân viên
			</Button>
			<Modal
				centered
				width={800}
				bodyStyle={{height: '80vh'}}
				style={{ marginTop: "-80px" }}
				visible={show}
				closable={true}
				onCancel={() => setShow(false)}
				footer={[
					<Button key="btncall" onClick={() => reFresh()}>
						Làm mới
					</Button>,
					<Button loading={status === "loading"} type="primary" form="eForm" key="submit" htmlType="submit">
						Lưu lại
					</Button>,
				]}
			>
				<Form
					id="eForm"
					form={aForm}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onFinish={submitForm}
					initialValues={{ gender: 0 }}
					style={{ height: "100%", overflowY: "auto", marginTop: '20px' }}
				>
					<Divider>Thông tin cơ bản</Divider>
					<Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Họ tên không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="email" label="Email" rules={[{ required: true, message: "Email không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item
						name="phone"
						label="Số điện thoại"
						rules={[{ required: true, message: "Số điện thoại không được để trống!" }, IsNumeric]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="gender"
						label="Giới tính"
						rules={[{ required: true, message: "Giới tính không được để trống!" }]}
					>
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>Nữ</Select.Option>
							<Select.Option value={2}>Khác</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="birthday"
						label="Ngày sinh"
						rules={[{ required: true, message: "Ngày sinh không được để trống!" }]}
					>
						<DatePicker />
					</Form.Item>
					<Form.Item name="address" label="Địa chỉ">
						<Input />
					</Form.Item>
					<Form.Item name="interests" label="Sở thích">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="disklikes" label="Sở ghét">
						<Input.TextArea />
					</Form.Item>
					<Divider>Thông tin hợp đồng</Divider>
					<Form.Item name="identifier" label="Số CMT/CCCD" rules={[IsNumeric]}>
						<Input />
					</Form.Item>
					<Form.Item name="basic_salary" label="Lương cơ bản" rules={[IsNumeric]}>
						<Input />
					</Form.Item>
					<Form.Item name="sales_salary" label="Lương doanh số" rules={[IsNumeric]}>
						<Input />
					</Form.Item>
					<Form.Item name="role_id" label="Vị trí">
						<Select>
							<Select.Option value={0}>Nhân viên</Select.Option>
							{roles.map((role: RoleType) => {
								return (
									<Select.Option key={role.id} value={role.id}>
										{role.name}
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item name="working_day" label="Ngày vào làm">
						<DatePicker />
					</Form.Item>
					<Form.Item
						name="contract_file"
						label="File đính kèm"
						valuePropName="fileList"
						// getValueFromEvent={normFile}
					>
						<Upload name="logo" action="/upload.do" listType="picture">
							<Button icon={<UploadOutlined />}>Click to upload</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
