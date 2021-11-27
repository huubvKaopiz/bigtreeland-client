import React, { useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { actionAddParent, actionGetParents } from "store/parents/slice";
import Modal from "antd/lib/modal/Modal";

export default function AddParent(): JSX.Element {
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const status = useSelector((state: RootState) => state.parentReducer.addParentStatus);

	useEffect(() => {
		if (status === "success") {
			setShow(false);
			dispatch(actionGetParents({ page: 1 }));
		}
	}, [status, dispatch]);

	const handleSubmit = (values: any) => {
		dispatch(actionAddParent({ ...values, role_id: 3 }));
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
					<Button key="btncanl" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button key="btnSubmit" htmlType="submit" form="aForm" type="primary">
						Lưu lại
					</Button>,
				]}
			>
				<Form id="aForm" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} onFinish={handleSubmit}>
					<Form.Item label="Họ tên" name="name">
						<Input />
					</Form.Item>
					<Form.Item label="Số điện thoại" name="phone">
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
