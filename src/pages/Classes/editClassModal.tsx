import { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Input, TimePicker, InputNumber } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAppDispatch } from "store/store";
import { actionUpdateClass, actionGetClasses } from "store/classes/slice";
import { get } from "lodash";
import { ClassType, EmployeeType, ListEmployeeType } from "interface";
import { dayOptions } from "utils/const";
import numeral from "numeral";
import moment from "moment";

export default function EditClassModal(props: {
	classInfo: ClassType;
	teachers: ListEmployeeType | null;
	searchTeacher: (search: string) => void;
	searchStatus: string;
}): JSX.Element {
	const { classInfo, teachers, searchTeacher, searchStatus } = props;
	const [uFrom] = Form.useForm();
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const [submiting, setSubmiting] = useState(false);

	useEffect(() => {
		if (classInfo) {
			let scheduleTime:string[] = [];
			if(classInfo.schedule_time){
				scheduleTime = classInfo.schedule_time.split("-");
				console.log(scheduleTime)
			}
			uFrom.setFieldsValue({
				name: classInfo.name,
				employee_id: get(classInfo, "user.id", ""),
				fee_per_session: classInfo.fee_per_session,
				schedule: classInfo.schedule,
				schedule_time:scheduleTime.length > 0 ? [moment(scheduleTime[0]), moment(scheduleTime[1])] : null
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classInfo]);

	function handleSubmit(values:any) {
		setSubmiting(true);
		let scheduleTime = null;
		console.log(values)
		if(values.schedule_time){
			scheduleTime = moment(values.schedule_time[0]).format("HH:mm:ss") + "-" + moment(values.schedule_time[1]).format("HH:mm:ss")
		}
		dispatch(actionUpdateClass({ data: {...values, schedule_time:scheduleTime}, cID: classInfo.id }))
			.then(() => {
				dispatch(actionGetClasses({ page: 1 }));
				setShow(false);
			})
			.finally(() => {
				setSubmiting(false);
			});
	}

	return (
		<div>
			<Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
			<Modal
				visible={show}
				title="Thay đổi thông tin lớp học"
				onCancel={() => setShow(false)}
				footer={[
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form="uForm">
						Lưu lại
					</Button>,
				]}
				width={800}
			>
				<Form
					id="uForm"
					form={uFrom}
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
					<Form.Item label="Tên lớp" name="name" required>
						<Input />
					</Form.Item>
					<Form.Item label="Giáo viên" name="employee_id">
						<Select
						// showSearch
						// onSearch={(e) => searchTeacher(e)}
						// notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						>
							<Select.Option value={-1}>Chọn sau</Select.Option>
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
						<TimePicker.RangePicker format="HH:mm:ss"/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
