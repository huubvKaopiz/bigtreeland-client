import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, InputNumber, Modal, Select, Space, Tag, TimePicker } from "antd";
import { EmployeeType, GetResponseType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionAddClass, actionGetClasses } from "store/classes/slice";
import { actionGetClassAssistants, actionGetTeachers } from "store/employees/slice";
import { RootState, useAppDispatch } from "store/store";
import { dayOptions, ROLE_NAMES } from "utils/const";
import { converRoleNameToVN } from "utils/ultil";

export default function AddClassModal(props: {
	// teachers: GetResponseType<EmployeeType> | null;
}): JSX.Element {

	// const { teachers } = props;
	const dispatch = useAppDispatch();
	const [addForm] = Form.useForm();
	const [show, setShow] = useState(false);
	const [keepShow, setKeepShow] = useState(false);

	const teachers = useSelector((state: RootState) => state.employeeReducer.teachers);
	const classAssistants = useSelector((state:RootState) => state.employeeReducer.assistants)
	const addStatus = useSelector((state: RootState) => state.classReducer.addClassStatus);

	useEffect(()=>{
		dispatch(actionGetTeachers({}));
		dispatch(actionGetClassAssistants({}))
	},[])

	function handleSubmit(values: any) {
		let scheduleTime = '';
		if (values.schedule_time) {
			scheduleTime = moment(values.schedule_time[0]).format("HH:mm:ss") + "-" + moment(values.schedule_time[1]).format("HH:mm:ss");
		}
		dispatch(actionAddClass({ ...values, schedule_time: scheduleTime })).finally(() => {
			if (keepShow === false) setShow(false);
			addForm.setFieldsValue({
				name: "",
				employee_id: 0,
				assistant_id:0,
				fee_per_session: "",
				schedule: [],
				schedule_time: null,
				type:0,
			})
			dispatch(actionGetClasses({ page: 1 }));
		});
	}

	return (
		<div>
			<Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
				Th??m l???p h???c
			</Button>
			<Modal
				visible={show}
				title="Th??m l???p h???c"
				onCancel={() => setShow(false)}
				footer={[
					<Checkbox key="keepShow" onChange={(e) => setKeepShow(e.target.checked)}>Gi??? c???a s???</Checkbox>,
					<Button loading={addStatus === 'loading' ? true : false} key="btnsubmit" type="primary" htmlType="submit" form="aForm">
						L??u l???i
					</Button>,
				]}
				width={800}
			>
				<Form
					id="aForm"
					form={addForm}
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					// initialValues={}
					onFinish={handleSubmit}
				>
					<Form.Item label="T??n l???p" name="name" rules={[{ required: true, message: "T??n kh??ng ???????c ????? tr???ng!" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Gi??o vi??n" name="employee_id">
						<Select
							showSearch
							// allowClear
							filterOption={(input, option) =>
								(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={0} label="Ch???n sau">Ch???n sau</Select.Option>
							{teachers &&
								get(teachers, "data", []).map((tc: EmployeeType) => {
									return (
										<Select.Option value={tc.id} key={tc.id} label={`${get(tc, "profile.name", "")} (${tc.phone})`}>
											<Space>
											{get(tc,"roles",[]).map((role:{id:number, name:string}) => <Tag color="blue" key={role.id}>{converRoleNameToVN(role.name as ROLE_NAMES)}</Tag>)}
											<a>{get(tc, "profile.name", "")}</a>{tc.phone}
											</Space>
										</Select.Option>
									);
								})}
						</Select>
					</Form.Item>
					<Form.Item label="Tr??? gi???ng" name="assistant_id">
						<Select
							showSearch
							// allowClear
							filterOption={(input, option) =>
								(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={0} label="Ch???n sau" >Ch???n sau</Select.Option>
							{classAssistants &&
								get(classAssistants, "data", []).map((tc: EmployeeType) => {
									return (
										<Select.Option value={tc.id} key={tc.id} label={`${get(tc, "profile.name", "")} (${tc.phone})`}>
											<Space>
											{get(tc,"roles",[]).map((role:{id:number, name:string}) => <Tag color="blue" key={role.id}>{converRoleNameToVN(role.name as ROLE_NAMES)}</Tag>)}
											<a>{get(tc, "profile.name", "")}</a>{tc.phone}
											</Space>
										</Select.Option>
									);
								})}
						</Select>
					</Form.Item>
					<Form.Item name="type" label="Lo???i" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Kh??ng ???????c ????? tr???ng!" }]}>
						<Select style={{width:120}}>
							<Select.Option value={1}>Online</Select.Option>
							<Select.Option value={0}>Offline</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item label="H???c ph??/bu???i" name="fee_per_session" rules={[{ required: true, message: "Kh??ng ???????c ????? tr???ng!" }]}>
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="L???ch h???c" name="schedule" rules={[{ required: true, message: "Kh??ng ???????c ????? tr???ng!" }]}>
						<Select mode="multiple" placeholder="Ch???n l???ch h???c">
							{dayOptions.map((day, value) => (
								<Select.Option value={value} key={value}>
									{day}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Th???i gian h???c" name="schedule_time">
						<TimePicker.RangePicker />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
