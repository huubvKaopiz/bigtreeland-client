import { PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { actionAddParent, actionGetParents } from "store/parents/slice";
import { RootState, useAppDispatch } from "store/store";
import { DEFAULT_ROLE_IDS } from "utils/const";

export default function AddParent(): JSX.Element {
	const dispatch = useAppDispatch();
	const [addFrom]  = Form.useForm();
	const [show, setShow] = useState(false);
	const [keepShow, setKeepShow] = useState(false);
	const status = useSelector((state: RootState) => state.parentReducer.addParentStatus);

	const handleSubmit = (values: any) => {
		dispatch(actionAddParent({ ...values, role_id: DEFAULT_ROLE_IDS.PARENT })).finally(()=>{
			if(keepShow === false) setShow(false);
			addFrom.setFieldsValue({
				name:"",
				phone:"",
				email:"",
			})
			dispatch(actionGetParents({ page: 1 }));
		});
	};

	return (
		<div>
			<Button icon={<PlusOutlined />} type="primary" onClick={() => setShow(true)}>
				Thêm phụ huynh
			</Button>
			<Modal
				title="Thông tin phụ huynh"
				closable={true}
				visible={show}
				onCancel={() => setShow(false)}
				width={800}
				footer={[
					<Checkbox key="keepShow" onChange={(e: any) => setKeepShow(e.target.checked)}>Giữ cửa sổ</Checkbox>,
					<Button key="btncanl" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button key="btnSubmit" htmlType="submit" form="aForm" type="primary" loading={status === 'loading' ? true :  false}>
						Lưu lại
					</Button>,
				]}
			>
				<Form form={addFrom} id="aForm" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} onFinish={handleSubmit}>
					<Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Tên không được để trống!" }]}>
						<Input />
					</Form.Item>
					<Form.Item 
						label="Số điện thoại" 
						name="phone"
						rules={[
							{ required: true, message: "Số điện thoại không được để trống!" },
							{ pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" }
							]}
					>
						<Input />
					</Form.Item>
					<Form.Item label="Email" name="email">
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
