import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ListParentType, ParentType, StudentType } from "interface";
import { get } from "lodash";
import { RootState, useAppDispatch } from "store/store";
import { actionUpdateStudent } from "store/students/slice";
import moment from "moment";
import { useSelector } from "react-redux";
import { actionGetClasses } from "store/classes/slice";

const dateFormat = "DD/MM/YYYY";

export default function EditStudentModal(props: {
	student: StudentType;
	parents: ListParentType | null;
	searchParent: (search: string) => void;
	searchStatus: string;
}): JSX.Element {
	const { student, parents, searchParent, searchStatus } = props;
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const [uForm] = Form.useForm();
	const status = useSelector((state: RootState) => state.studentReducer.updateStudentStatus);

	useEffect(() => {
		if (student) {
			uForm.setFieldsValue({
				name: student.name,
				parent_id: get(student, "parent.id", null),
				gender: student.gender,
				birthday: moment(student.birthday),
				admission_date: moment(student.admission_date),
				school: student.school,
				address: student.address,
				interests: student.interests,
				dislikes: student.dislikes,
				personality: student.personality,
				hope: student.hope,
				knowledge_status: student.knowledge_status,
				is_special: student.is_special,
			});
		}
	}, [student, uForm]);

	useEffect(() => {
		if (status === "success") {
			setShow(false);
		}
	}, [status, dispatch]);

	const handleSubmit = (values: any) => {
		dispatch(
			actionUpdateStudent({
				data: {
					...student,
					...values,
					birthday: moment(values.birthday).format("YYYY-MM-DD"),
					admission_date: moment(values.admission_date).format("YYYY-MM-DD"),
					is_special: values.is_special === true ? 1 : 0,
				},
				sID: student.id,
			})
		);
	};

	return (
		<div>
			<Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
			<Modal
				visible={show}
				title="Sửa thông tin học sinh"
				onCancel={() => setShow(false)}
				width={1000}
				footer={[
					<Button key="btnCancel" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button type="primary" key="btnSubmit" htmlType="submit" form={`uForm${student.id}`}>
						Lưu thông tin
					</Button>,
				]}
			>
				<Form
					id={`uForm${student.id}`}
					form={uForm}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
					<Form.Item label="Họ và tên" name="name">
						<Input />
					</Form.Item>
					<Form.Item name="parent_id" label="Phụ huynh">
						<Select
							showSearch
							onSearch={(e) => searchParent(e)}
							notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						>
							{get(parents, "data", []).map((parent: ParentType) => {
								return (
									<Select.Option key={parent.id} value={parent.id}>
										{parent.name} - {parent.phone}
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item name="gender" label="Giới tính" wrapperCol={{ span: 2 }}>
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>Nữ</Select.Option>
							<Select.Option value={2}>Khác</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Sinh nhật">
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item name="school" label="Trường đang học">
						<Input />
					</Form.Item>
					<Form.Item name="address" label="Địa chỉ">
						<Input />
					</Form.Item>
					<Form.Item name="admission_date" label="Ngày nhập học">
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item name="knowledge_status" label="Tình trạng đầu vào">
						<InputNumber />
					</Form.Item>
					<Form.Item name="is_special" label="Trường hợp đặc biệt" valuePropName="checked">
						<Switch />
					</Form.Item>
					<Form.Item name="personality" label="Tính cách">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="interests" label="Sở thích">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="dislikes" label="Sở ghét">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="hope" label="Ước mơ">
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
