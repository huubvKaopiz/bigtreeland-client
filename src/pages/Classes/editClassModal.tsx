import { Button, Form, Input, InputNumber, Modal, Select, Space, Tag, TimePicker } from "antd";
import { ClassType, EmployeeType, GetResponseType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetClasses, actionUpdateClass } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { dayOptions, ROLE_NAMES } from "utils/const";
import { converRoleNameToVN } from "utils/ultil";

export default function EditClassModal(props: {
	classInfo: ClassType;
	// teachers: GetResponseType<EmployeeType> | null;
	searchTeacher: (search: string) => void;
	searchStatus: string;
	searchClass: string;
	show: boolean;
	setShow: (param: boolean) => void;
}): JSX.Element {
	const { classInfo, show, setShow, searchClass } = props;
	const [uFrom] = Form.useForm();
	const dispatch = useAppDispatch();
	const [submiting, setSubmiting] = useState(false);
	const teachers = useSelector((state: RootState) => state.employeeReducer.teachers);
	const classAssistants = useSelector((state: RootState) => state.employeeReducer.assistants)
	const updateState = useSelector((state: RootState) => state.classReducer.updateClassStatus)


	useEffect(() => {
		if (classInfo) {
			let scheduleTime: string[] = [];
			if (classInfo.schedule_time) {
				scheduleTime = classInfo.schedule_time.split("-");
			}
			uFrom.setFieldsValue({
				name: classInfo.name,
				employee_id: get(classInfo, "user.id", 0),
				assistant_id: get(classInfo, "assistant_id", 0),
				fee_per_session: classInfo.fee_per_session,
				type: classInfo.type,
				schedule: classInfo.schedule,
				schedule_time: scheduleTime.length > 0 ? [moment(scheduleTime[0], "HH:mm:ss"), moment(scheduleTime[1], "HH:mm:ss")] : null
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classInfo]);

	useEffect(() => {
		if (updateState === 'success') {
			setShow(false);
			setSubmiting(false);
			dispatch(actionGetClasses({ search: searchClass }));
		}
	},[updateState])

	function handleSubmit(values: any) {
		setSubmiting(true);
		let scheduleTime = '';
		if (values.schedule_time) {
			scheduleTime = moment(values.schedule_time[0]).format("HH:mm:ss") + "-" + moment(values.schedule_time[1]).format("HH:mm:ss")
		}
		console.log(values)

		dispatch(actionUpdateClass({ data: { ...values, schedule_time: scheduleTime }, cID: classInfo.id }));
	}

	return (
		<div>

			<Modal
				visible={show}
				title="Thay đổi thông tin lớp học"
				onCancel={() => setShow(false)}
				footer={[
					<Button key="btncancel" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form={`uclassForm`}>
						Lưu lại
					</Button>,

				]}
				width={800}
			>
				<Form
					id={`uclassForm`}
					form={uFrom}
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
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
												{get(tc, "roles", []).map((role: { id: number, name: string }) => <Tag color="blue" key={role.id}>{converRoleNameToVN(role.name as ROLE_NAMES)}</Tag>)}
												<a>{get(tc, "profile.name", "")}</a> ({tc.phone})
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
							<Select.Option value={0} label="Chọn sau">Chọn sau</Select.Option>
							{classAssistants &&
								get(classAssistants, "data", []).map((tc: EmployeeType) => {
									return (
										<Select.Option value={tc.id} key={tc.id} label={`${get(tc, "profile.name", "")} (${tc.phone})`}>
											<Space>
												{get(tc, "roles", []).map((role: { id: number, name: string }) => <Tag color="blue" key={role.id}>{converRoleNameToVN(role.name as ROLE_NAMES)}</Tag>)}
												<a>{get(tc, "profile.name", "")}</a> ({tc.phone})
											</Space>
										</Select.Option>
									);
								})}
						</Select>
					</Form.Item>


					<Form.Item name="type" label="Loại" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Không được để trống!" }]}>
						<Select style={{ width: 120 }}>
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
						<TimePicker.RangePicker format="HH:mm" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
