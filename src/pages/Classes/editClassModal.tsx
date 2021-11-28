import { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Input, Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAppDispatch } from "store/store";
import { actionUpdateClass, actionGetClasses } from "store/classes/slice";
import { get } from "lodash";
import { ClassType, EmployeeType, ListEmployeeType } from "interface";

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
			uFrom.setFieldsValue({
				name: classInfo.name,
				employee_id: get(classInfo, "employee.id", 0),
				sessions_num: classInfo.sessions_num,
				fee_per_session: classInfo.fee_per_session,
				schedule: classInfo.schedule,
			});
		}
	});

	function handleSubmit(values: any) {
		setSubmiting(true);
		dispatch(actionUpdateClass({ data: values, cID: classInfo.id }))
			.then(() => {
				setShow(false);
				dispatch(actionGetClasses({ page: 1 }));
			})
			.finally(() => setSubmiting(false));
	}

	return (
		<div>
			<Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
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
					form={uFrom}
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
					<Form.Item label="Tên lớp" name="name">
						<Input />
					</Form.Item>
					<Form.Item label="Giáo viên" name="employee_id">
						<Select
							showSearch
							onSearch={(e) => searchTeacher(e)}
							notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						>
							<Select.Option value={-1}>Chọn sau</Select.Option>
							{teachers &&
								get(teachers, "data", []).map((tc: EmployeeType) => {
									console.log("teachers", teachers);
									return (
										<Select.Option value={tc.id} key={tc.id}>
											{tc.name} - {tc.phone}
										</Select.Option>
									);
								})}
						</Select>
					</Form.Item>

					<Form.Item label="Số buổi học" name="sessions_num">
						<Input />
					</Form.Item>
					<Form.Item label="Học phí" name="fee_per_session">
						<Input />
					</Form.Item>
					<Form.Item label="Lịch học" name="schedule">
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
