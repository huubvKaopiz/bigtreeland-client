import {
	Button, DatePicker, Form,
	Input, InputNumber, Modal, Select, Spin, Switch
} from "antd";
import { GetResponseType, ParentType, StudentType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents, actionUpdateStudent } from "store/students/slice";

const dateFormat = "DD/MM/YYYY";

export default function EditStudentModal(props: {
	student: StudentType;
	parents: GetResponseType<ParentType> | null;
	searchParent: (search: string) => void;
	searchStatus: string;
	show: boolean;
	setShow: (param: boolean) => void;
}): JSX.Element {
	const { student, parents, show, setShow, searchParent, searchStatus } = props;
	const dispatch = useAppDispatch();
	const [uForm] = Form.useForm();
	const status = useSelector(
		(state: RootState) => state.studentReducer.updateStudentStatus
	);

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
				type: student.type,
			});
			searchParent('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [student, uForm]);

	const handleSubmit = (values: any) => {
		if (student) {
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
			).finally(() => {
				setShow(false);
				dispatch(actionGetStudents({}));
			});
		}
	};

	return (
		<div>
			<Modal
				visible={show}
				title="S???a th??ng tin h???c sinh"
				onCancel={() => setShow(false)}
				width={1000}
				footer={[
					<Button key="btnCancel" onClick={() => setShow(false)}>
						Hu??? b???
					</Button>,
					<Button
						type="primary"
						key="btnSubmit"
						loading={status === "loading"}
						htmlType="submit"
						form="uForm"
					>
						L??u th??ng tin
					</Button>,
				]}
			>
				<Form
					id={`uForm`}
					form={uForm}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>

					<Form.Item label="H??? v?? t??n" name="name" rules={[{ required: true, message: "H??? t??n kh??ng ???????c ????? tr???ng!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="parent_id" label="Ph??? huynh">
						<Select
							showSearch
							allowClear
							onSearch={(e) => searchParent(e)}
							notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
							filterOption={false}
						>
							{get(parents, "data", []).map((parent: ParentType) => {
								return (
									<Select.Option
										key={parent.id}
										value={parent.id}
										label={`${get(parent, "profile.name", "")} (${parent.phone
											})`}
									>
										<a>{get(parent, "profile.name")}</a> ({parent.phone})
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item name="type" label="Lo???i" wrapperCol={{ span: 2 }} rules={[{ required: true }]}>
						<Select style={{ width: 120 }}>
							<Select.Option value={1}>Online</Select.Option>
							<Select.Option value={0}>Offline</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="gender" label="Gi???i t??nh" wrapperCol={{ span: 2 }}>
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>N???</Select.Option>
							<Select.Option value={2}>Kh??c</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Sinh nh???t">
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item name="admission_date" label="Ng??y nh???p h???c" rules={[{ required: true, message: "Ng??y nh???p h???c kh??ng ???????c ????? tr???ng!" }]}>
						<DatePicker format={dateFormat} />
					</Form.Item>
					<Form.Item name="school" label="Tr?????ng ??ang h???c">
						<Input />
					</Form.Item>
					<Form.Item name="address" label="?????a ch???">
						<Input />
					</Form.Item>
					<Form.Item name="knowledge_status" label="T??nh tr???ng ?????u v??o">
						<InputNumber />
					</Form.Item>
					<Form.Item
						name="is_special"
						label="Tr?????ng h???p ?????c bi???t"
						valuePropName="checked"
					>
						<Switch />
					</Form.Item>
					<Form.Item name="personality" label="T??nh c??ch">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="interests" label="S??? th??ch">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="dislikes" label="S??? gh??t">
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="hope" label="?????c m??">
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
