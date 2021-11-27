import { Button, Form, Input, Modal, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ParentType } from "interface";
import React, { useEffect, useState } from "react";
import { RootState, useAppDispatch } from "store/store";
import { actionGetParents, actionUpdateParent } from "store/parents/slice";
import { useSelector } from "react-redux";

export default function UpdateParent(props: { parent: ParentType }): JSX.Element {
	const { parent } = props;
	const [show, setShow] = useState(false);
	const [uForm] = Form.useForm();
	const distpatch = useAppDispatch();
	const status = useSelector((state: RootState) => state.parentReducer.addParentStatus);

	useEffect(() => {
		if (parent) {
			uForm.setFieldsValue({
				name: parent.name,
				phone: parent.phone,
				email: parent.profile.email,
			});
		}
	}, [parent, uForm]);

	useEffect(() => {
		if (status === "success") {
			distpatch(actionGetParents({}));
		}
	}, [distpatch, status]);

	const handleSubmit = (values: any) => {
		distpatch(actionUpdateParent({ data: values, pID: parent.id }));
	};
	return (
		<div>
			<Tooltip placement="top" title="Sửa thông tin">
				{" "}
				<Button icon={<EditOutlined />} type="link" onClick={() => setShow(true)} />
			</Tooltip>
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
				<Form id="aForm" form={uForm} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} onFinish={handleSubmit}>
					<Form.Item label="Họ tên" name="name">
						<Input />
					</Form.Item>
					<Form.Item label="Số điện thoại" name="phone">
						<Input disabled />
					</Form.Item>
					<Form.Item label="Email" name="email">
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
