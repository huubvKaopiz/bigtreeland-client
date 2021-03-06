import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, Spin, Switch } from "antd";
import { GetResponseType, ParentType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionAddStudent, actionGetStudents } from "store/students/slice";

export default function AddStudentModal(props: {
	parents: GetResponseType<ParentType> | null;
	searchStatus: string,
	searchParent: (search: string) => void;
}): JSX.Element {
	const { parents, searchParent, searchStatus } = props;
	const [aForm] = Form.useForm();
	const [show, setShow] = useState(false);
	const [keepShow, setKeepShow] = useState(false);
	const dispatch = useAppDispatch();
	const addStatus = useSelector((state: RootState) => state.studentReducer.addStudentStatus);

	const listParents: ParentType[] = get(parents, "data", []);

	useEffect(()=>{
		if(show){
			searchParent('');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[show])
	const handleSubmit = (values: any) => {
		console.log("submit form:", values);
		const data = {
			...values,
			birthday: moment(values.birthday).format("YYYY-MM-DD"),
			admission_date: moment(values.admission_date).format("YYYY-MM-DD"),
			is_special: values.is_special === true ? 1 : 0,
		};
		dispatch(actionAddStudent(data)).finally(() => {
			dispatch(actionGetStudents({}));
			handleRefresh();
		})
	};

	function handleRefresh() {
		if(keepShow === false) setShow(false);
		aForm.setFieldsValue({
			name: "",
			parent_id: null,
			gender: null,
			birthday: null,
			school: "",
			address: "",
			admission_date: null,
			knowledge_status: "",
			is_special: false,
			personality: "",
			interests: "",
			dislikes: "",
			hope: "",
			type:0,
		})
	}

	return (
		<div>
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => setShow(true)}
			>
				Th??m h???c sinh
			</Button>
			<Modal
				visible={show}
				title="Th??ng tin h???c sinh"
				onCancel={() => setShow(false)}
				width={1000}
				footer={[
					<Checkbox key="keepShow" onChange={(e: any) => setKeepShow(e.target.checked)}>Gi??? c???a s???</Checkbox>,
					<Button key="btnCancel" onClick={() => handleRefresh()}>
						Hu??? b???
					</Button>,
					<Button type="primary" key="btnSubmit" htmlType="submit" form="addStudentForm" loading={addStatus === 'loading' ? true : false}>
						L??u th??ng tin
					</Button>,
				]}
			>
				<Form
					id="addStudentForm"
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					form={aForm}
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
							filterOption={false}
							notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						>
							{listParents.map((parent: ParentType) => {
								return (
									<Select.Option key={parent.id} value={parent.id} label={`${get(parent, "profile.name", "")} (${parent.phone})`}>
										<a>{get(parent, "profile.name", "")}</a> ({parent.phone})
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item name="type" label="Lo???i" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Lo???i kh??ng ???????c ????? tr???ng!" }]}>
						<Select style={{width:120}}>
							<Select.Option value={1}>Online</Select.Option>
							<Select.Option value={0}>Offline</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="gender" label="Gi???i t??nh" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Gi???i t??nh kh??ng ???????c ????? tr???ng!" }]}>
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>N???</Select.Option>
							<Select.Option value={2}>Kh??c</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Sinh nh???t">
						<DatePicker />
					</Form.Item>
					<Form.Item name="admission_date" label="Ng??y nh???p h???c" rules={[{ required: true, message: "Ng??y nh???p h???c kh??ng ???????c ????? tr???ng!" }]}>
						<DatePicker />
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
