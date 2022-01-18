import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, Checkbox, InputNumber, TimePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { actionAddClass, actionGetClasses } from "store/classes/slice";
import { get } from "lodash";
import { EmployeeType, ListEmployeeType } from "interface";
import numeral from "numeral";
import { dayOptions } from "utils/const";
import moment from "moment";

export default function AddClassModal(props: {
	teachers: ListEmployeeType | null;
}): JSX.Element {

	const { teachers } = props;
	const dispatch = useAppDispatch();
	const [addForm] = Form.useForm();
	const [show, setShow] = useState(false);
	const [keepShow, setKeepShow] = useState(false);

	const addStatus = useSelector((state: RootState) => state.classReducer.addClassStatus);

	function handleSubmit(values: any) {
		let scheduleTime = null;
		if (values.schedule_time) {
			scheduleTime = moment(values.schedule_time[0]).format("HH:mm:ss") + "-" + moment(values.schedule_time[1]).format("HH:mm:ss");
		}
		dispatch(actionAddClass({ ...values, schedule_time: scheduleTime })).finally(() => {
			if (keepShow === false) setShow(false);
			addForm.setFieldsValue({
				name: "",
				employee_id: null,
				fee_per_session: "",
				schedule: [],
				schedule_time: null,
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
					<Checkbox key="keepShow" onChange={(e: any) => setKeepShow(e.target.checked)}>Giữ cửa sổ</Checkbox>,
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
					<Form.Item label="Tên lớp" name="name" required>
						<Input />
					</Form.Item>
					<Form.Item label="Giáo viên" name="employee_id">
						<Select
							showSearch
							allowClear
							filterOption={(input, option) =>
								(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={0} label="Chọn sau">Chọn sau</Select.Option>
							{teachers &&
								get(teachers, "data", []).map((tc: EmployeeType) => {
									return (
										<Select.Option value={tc.id} key={tc.id} label={`${get(tc, "profile.name", "")} (${tc.phone})`}>
											<a>{get(tc, "profile.name", "")}</a> ({tc.phone})
										</Select.Option>
									);
								})}
						</Select>
					</Form.Item>
					{/* <Form.Item label="Số buổi học" name="sessions_num">
						<Input />
					</Form.Item> */}
					<Form.Item label="Học phí/buổi" name="fee_per_session" required>
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Lịch học" name="schedule" required>
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
