import { Form, Modal, Button, Input, Select, DatePicker, Divider, Upload, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { EmployeeType, RoleType } from "interface";
import { actionGetEmployees, actionResetUpdateEmployeeSatus, actionUpdateEmployee } from "store/employees/slice";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { get } from "lodash";

const dateFormat = "DD/MM/YYYY";

export default function UpdateEmplyeeForm(props: { employee: EmployeeType; roles: RoleType[] }): JSX.Element {
	const { employee, roles } = props;
	const [uFrom] = Form.useForm();
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const status = useSelector((state: RootState) => state.employeeReducer.updateEmployeeStatus);

	useEffect(() => {
		if (employee) {
			uFrom.setFieldsValue({
				name: employee.name,
				email: get(employee, "profile.email", ""),
				phone: get(employee, "phone", ""),
				birthday: moment(get(employee, "profile.birthday", "")),
				gender: get(employee, "profile.gender", 0),
				address: get(employee, "profile.address", ""),
				interests: get(employee, "profile.interests", ""),
				disklikes: get(employee, "profile.disklikes", ""),
				basic_salary: get(employee, "employee_contract.basic_salary", ""),
				sales_salary: get(employee, "employee_contract.sales_salary", ""),
				role_id: get(employee, "roles[0].id", 0),
				working_day: moment(get(employee, "employee_contract.working_day", "")),
			});
		}
	}, [employee, uFrom]);

	useEffect(() => {
		if (status === "success" && show) {
			setShow(false);
			dispatch(actionGetEmployees({}));
			dispatch(actionResetUpdateEmployeeSatus());
		}
	}, [status, dispatch, show]);

	const handleSubmit = (values: any) => {
		const data = {
			...values,
			birthday: moment(values.birthday).format("YYYY-MM-DD"),
			working_day: moment(values.working_day).format("YYYY-MM-DD"),
		};
		const params = {
			data,
			eID: employee.id,
		};
		dispatch(actionUpdateEmployee(params));
	};

	const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };
	return (
		<div>
			<Tooltip placement="top" title="Sửa thông tin">
				<Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
			</Tooltip>
			<Modal
				width={800}
				style={{ marginTop: "-80px" }}
				visible={show}
				onCancel={() => setShow(false)}
				closable={true}
				okText="Lưu thông tin"
				cancelText="Huỷ bỏ"
				footer={[
					<Button key="cancel" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button loading={status === "loading"} type="primary" key="submit" htmlType="submit" form="ueForm">
						Lưu thông tin
					</Button>,
				]}
			>
				<Form
					id="ueForm"
					form={uFrom}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onFinish={handleSubmit}
					style={{ height: "540px", overflowY: "auto" }}
				>
					<Divider>Thông tin cơ bản</Divider>
					<Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Họ tên không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="email" label="email" rules={[{ required: true, message: "Email không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item
						name="phone"
						label="Số điện thoại"
						rules={[{ required: true, message: "Số điện thoại không được để trống!" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name="gender" label="Giới tính">
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>Nữ</Select.Option>
							<Select.Option value={2}>Khác</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Ngày sinh">
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item name="address" label="Địa chỉ">
						<Input />
					</Form.Item>
					<Form.Item name="interests" label="Sở thích">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="dislikes" label="Sở ghét">
						<Input.TextArea />
					</Form.Item>
					<Divider>Thông tin hợp đồng</Divider>
					<Form.Item name="identify" label="Số CMT/CCCD">
						<Input />
					</Form.Item>
					<Form.Item rules={[IsNumeric]} name={"basic_salary"} label="Lương cơ bản">
						<Input />
					</Form.Item>
					<Form.Item name="sales_salary" label="Lương doanh số">
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
					<Form.Item name="working_date" label="Ngày vào làm">
						<DatePicker format={dateFormat} />
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
