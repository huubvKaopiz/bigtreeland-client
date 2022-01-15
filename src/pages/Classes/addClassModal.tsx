import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, Spin, InputNumber, TimePicker } from "antd";
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
	searchTeacher: (search: string) => void;
	searchStatus: string;
}): JSX.Element {
	const { teachers, searchStatus, searchTeacher } = props;
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const addStatus = useSelector((state: RootState) => state.classReducer.addClassStatus);
	const [submiting, setSumiting] = useState(false);

	useEffect(() => {
		if (addStatus === "success") {
			setShow(false);
			dispatch(actionGetClasses({ page: 1 }));
		}
	}, [dispatch, addStatus]);

	function handleSubmit(values: any) {
		setSumiting(true);
		let scheduleTime = null;
		if (values.schedule_time) {
			scheduleTime = moment(values.schedule_time[0]).format("HH:mm:ss") + "-" + moment(values.schedule_time[1]).format("HH:mm:ss");
		}
		dispatch(actionAddClass({ ...values, schedule_time: scheduleTime })).finally(() => {
			setSumiting(false);
			setShow(false);
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
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form="aForm">
						Lưu lại
					</Button>,
				]}
				width={800}
			>
				<Form
					id="aForm"
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
							onSearch={(e) => searchTeacher(e)}
							notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						>
							<Select.Option value={0}>Chọn sau</Select.Option>
							{teachers &&
								get(teachers, "data", []).map((tc: EmployeeType) => {
									return (
										<Select.Option value={tc.id} key={tc.id}>
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
