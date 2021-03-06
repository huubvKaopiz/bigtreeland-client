import { UploadOutlined } from "@ant-design/icons";
import {
	Button, DatePicker,
	Divider, Form, Input, Modal, Select, Tag, Upload
} from "antd";
import { EmployeeType, RoleType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
	actionResetUpdateEmployeeSatus,
	actionUpdateEmployee
} from "store/employees/slice";
import { RootState, useAppDispatch } from "store/store";
import { ROLE_NAMES } from "utils/const";
import { converRoleNameToVN } from "utils/ultil";

const dateFormat = "DD/MM/YYYY";

export default function UpdateEmplyeeForm(props: {
	employee: EmployeeType;
	roles: RoleType[];
	show:boolean;
	setShow: (param:boolean) => void
}): JSX.Element {
	const { employee, roles, show, setShow } = props;
	const [uFrom] = Form.useForm();
	const dispatch = useAppDispatch();
	const status = useSelector(
		(state: RootState) => state.employeeReducer.updateEmployeeStatus
	);

	useEffect(() => {
		if (employee) {
			const birthday = get(employee, "profile.birthday", null)
			uFrom.setFieldsValue({
				name: get(employee,"profile.name",""),
				email: get(employee, "profile.email", ""),
				phone: get(employee, "phone", ""),
				birthday: birthday ? moment(birthday) : null,
				gender: get(employee, "profile.gender", 0),
				address: get(employee, "profile.address", ""),
				interests: get(employee, "profile.interests", ""),
				disklikes: get(employee, "profile.disklikes", ""),
				basic_salary: get(employee, "employee_contract.basic_salary", ""),
				sales_salary: get(employee, "employee_contract.sales_salary", ""),
				// role_id: get(employee, "roles[0].id", 0),
				working_day: moment(get(employee, "employee_contract.working_day", "")),
			});
		}
	}, [employee, uFrom]);

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
		dispatch(actionUpdateEmployee(params)).finally(()=>{
			setShow(false)
			dispatch(actionResetUpdateEmployeeSatus());
		});
	};

	const IsNumeric = {
		pattern: /^-{0,1}\d*\.{0,1}\d+$/,
		message: "Gi?? tr??? nh???p ph???i l?? s???",
	};
	return (
		<div>
			<Modal
				width={800}
				style={{ marginTop: "-80px" }}
				visible={show}
				onCancel={() => setShow(false)}
				closable={true}
				okText="L??u th??ng tin"
				cancelText="Hu??? b???"
				footer={[
					<Button key="cancel" onClick={() => setShow(false)}>
						Hu??? b???
					</Button>,
					<Button
						loading={status === "loading"}
						type="primary"
						key="submit"
						htmlType="submit"
						form="ueForm"
					>
						L??u th??ng tin
					</Button>,
				]}
			>
				<Form
					id="ueForm"
					form={uFrom}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 19 }}
					layout="horizontal"
					onFinish={handleSubmit}
					style={{ height: "80vh", overflowY: "auto" }}
				>
					<Divider>Th??ng tin c?? b???n</Divider>
					<Form.Item
						name="name"
						label="H??? t??n"
						rules={[{ required: true, message: "H??? t??n kh??ng ???????c ????? tr???ng!" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="email"
						label="email"
						rules={[{ required: true, message: "Email kh??ng ???????c ????? tr???ng!" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="phone"
						label="S??? ??i???n tho???i"
						rules={[
							{ required: true, message: "S??? ??i???n tho???i kh??ng ???????c ????? tr???ng!" },
						]}
					>
						<Input />
					</Form.Item>
					{/* <Form.Item name="role_id" label="V??? tr??" rules={[{ required: true, message: "V??? tr?? kh??ng ???????c ????? tr???ng!" }]}>
						<Select>
							<Select.Option value={0}>Nh??n vi??n</Select.Option>
							{roles.map((role: RoleType) => {
								return (
									<Select.Option key={role.id} value={role.id}>
										<Tag color="blue">{converRoleNameToVN(role.name as ROLE_NAMES)}</Tag>
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item> */}
					<Form.Item name="gender" label="Gi???i t??nh">
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>N???</Select.Option>
							<Select.Option value={2}>Kh??c</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Ng??y sinh">
						<DatePicker format="DD-MM-YYYY"/>
					</Form.Item>
					<Form.Item name="address" label="?????a ch???">
						<Input />
					</Form.Item>
					<Form.Item name="interests" label="S??? th??ch">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="dislikes" label="S??? gh??t">
						<Input.TextArea />
					</Form.Item>
					<Divider>Th??ng tin h???p ?????ng</Divider>
					<Form.Item name="identify" label="S??? CMT/CCCD">
						<Input />
					</Form.Item>
					<Form.Item
						rules={[IsNumeric]}
						name={"basic_salary"}
						label="L????ng c?? b???n"
					>
						<Input />
					</Form.Item>
					<Form.Item name="sales_salary" label="L????ng doanh s???">
						<Input />
					</Form.Item>
					
					<Form.Item name="working_date" label="Ng??y v??o l??m">
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item
						name="contract_file"
						label="File ????nh k??m"
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
