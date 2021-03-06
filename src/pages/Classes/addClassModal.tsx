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
				Thêm lớp học
			</Button>
			<Modal
				visible={show}
				title="Thêm lớp học"
				onCancel={() => setShow(false)}
				footer={[
					<Checkbox key="keepShow" onChange={(e) => setKeepShow(e.target.checked)}>Giữ cửa sổ</Checkbox>,
					<Button loading={addStatus === 'loading' ? true : false} key="btnsubmit" type="primary" htmlType="submit" form="aForm">
						Lưu lại
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
					<Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Tên không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Giáo viên" name="employee_id">
						<Select
							showSearch
							// allowClear
							filterOption={(input, option) =>
								(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={0} label="Chọn sau">Chọn sau</Select.Option>
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
					<Form.Item label="Trợ giảng" name="assistant_id">
						<Select
							showSearch
							// allowClear
							filterOption={(input, option) =>
								(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={0} label="Chọn sau" >Chọn sau</Select.Option>
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
					<Form.Item name="type" label="Loại" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Không được để trống!" }]}>
						<Select style={{width:120}}>
							<Select.Option value={1}>Online</Select.Option>
							<Select.Option value={0}>Offline</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item label="Học phí/buổi" name="fee_per_session" rules={[{ required: true, message: "Không được để trống!" }]}>
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Lịch học" name="schedule" rules={[{ required: true, message: "Không được để trống!" }]}>
						<Select mode="multiple" placeholder="Chọn lịch học">
							{dayOptions.map((day, value) => (
								<Select.Option value={value} key={value}>
									{day}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Thời gian học" name="schedule_time">
						<TimePicker.RangePicker />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
