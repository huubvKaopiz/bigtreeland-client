import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, notification, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useState } from "react";
import { useAppDispatch } from "store/store";
import { actionLeaveClass } from "store/students/slice";

export default function LeaveModal(props: { studen_id: number }): JSX.Element {
	const { studen_id } = props;
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);

	const handleSubmit = () => {
		setLoading(true);
		dispatch(
			actionLeaveClass({
				data: {
					class_id: 0,
				},
				sID: studen_id,
			})
		)
			.then((res) => {
				console.log(res)
				if (res.meta.requestStatus === "fulfilled") {
					notification.success({ message: "Đổi trạng thái nghỉ thành công" });
					setShow(false);
					return;
				}
				notification.error({ message: "Đổi trạng thái nghỉ thất bại" });
			})
			.finally(() => {
				setLoading(false);
			});
	};
	return (
		<>
			<Tooltip placement="top" title="Đổi trạng thái nghỉ">
				<Button onClick={() => setShow(true)} type="link" danger icon={<MinusCircleOutlined />} />
			</Tooltip>
			<Modal
				title="Đổi trạng thái nghỉ học"
				visible={show}
				closable={true}
				onCancel={() => setShow(false)}
				footer={[
					<Button loading={loading} key="btnSubmit" type="primary" onClick={handleSubmit}>
						Lưu lại
					</Button>,
				]}
			>
				Sau khi đổi, thông tin học sinh sẽ không hiển thị trong danh sách nữa.
			</Modal>
		</>
	);
}
