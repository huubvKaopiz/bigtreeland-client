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
				Thêm học sinh
			</Button>
			<Modal
				visible={show}
				title="Thông tin học sinh"
				onCancel={() => setShow(false)}
				width={1000}
				footer={[
					<Checkbox key="keepShow" onChange={(e: any) => setKeepShow(e.target.checked)}>Giữ cửa sổ</Checkbox>,
					<Button key="btnCancel" onClick={() => handleRefresh()}>
						Huỷ bỏ
					</Button>,
					<Button type="primary" key="btnSubmit" htmlType="submit" form="addStudentForm" loading={addStatus === 'loading' ? true : false}>
						Lưu thông tin
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
					<Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Họ tên không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="parent_id" label="Phụ huynh">
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
					<Form.Item name="type" label="Loại" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Loại không được để trống!" }]}>
						<Select style={{width:120}}>
							<Select.Option value={1}>Online</Select.Option>
							<Select.Option value={0}>Offline</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="gender" label="Giới tính" wrapperCol={{ span: 2 }} rules={[{ required: true, message: "Giới tính không được để trống!" }]}>
						<Select>
							<Select.Option value={1}>Nam</Select.Option>
							<Select.Option value={0}>Nữ</Select.Option>
							<Select.Option value={2}>Khác</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="birthday" label="Sinh nhật">
						<DatePicker />
					</Form.Item>
					<Form.Item name="admission_date" label="Ngày nhập học" rules={[{ required: true, message: "Ngày nhập học không được để trống!" }]}>
						<DatePicker />
					</Form.Item>
					<Form.Item name="school" label="Trường đang học">
						<Input />
					</Form.Item>
					<Form.Item name="address" label="Địa chỉ">
						<Input />
					</Form.Item>
				
					<Form.Item name="knowledge_status" label="Tình trạng đầu vào">
						<InputNumber />
					</Form.Item>
					<Form.Item
						name="is_special"
						label="Trường hợp đặc biệt"
						valuePropName="checked"
					>
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
