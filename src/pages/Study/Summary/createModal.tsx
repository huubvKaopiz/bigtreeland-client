import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Modal, notification, Select } from "antd";
import { ClassType } from "interface";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import {
	actionAddStudySummary,
	actionGetStudySummaryList,
} from "store/study-summary/slice";

const { Option } = Select;
const { RangePicker } = DatePicker;

export function CreateStudySummary(prop: {
	classList: ClassType[] | null;
	class_id: number;
}): JSX.Element {
	const { classList, class_id } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const createStudySummaryState = useSelector((state: RootState) => state.studySummaryReducer.addStudySummaryState);

	useEffect(() => {
		if (createStudySummaryState === 'success') {
			setShow(false);
			setSubmitting(false);
			dispatch(actionGetStudySummaryList({ class_id }));
		}
	},[createStudySummaryState])

	function submit(values: any) {
		if (values.dateRange == null) {
			notification.error({ message: "Chưa chọn khoảng thời gian" });
			return;
		}
		const payload = {
			class_id: class_id === 0 ? values.class_id : class_id,
			from_date: moment(values.dateRange[0]).format("YYYY-MM-DD"),
			to_date: moment(values.dateRange[1]).format("YYYY-MM-DD"),
		};
		console.log(payload);
		setSubmitting(true);
		dispatch(actionAddStudySummary(payload));
	}

	return (
		<>
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => setShow(true)}
			>
				Lập bảng tổng kết
			</Button>

			<Modal
				title="Lập bảng tổng kết"
				visible={show}
				onCancel={() => setShow(false)}
				width={800}
				footer={[
					<Button key="btnCancel" type="default" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button
						key="btnSubmit"
						type="primary"
						htmlType="submit"
						form="stcreateFrom"
						loading={submitting}
					>
						Lưu lại
					</Button>,
				]}
			>
				<Form
					id="stcreateFrom"
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 13 }}
					layout="horizontal"
					onFinish={submit}
				>
					{class_id === 0 && (
						<Form.Item label="Chọn lớp" name="class_id" required>
							<Select defaultValue={0} style={{ width: 260 }}>
								<Option value={0}>Tất cả</Option>
								{classList &&
									classList.map((cl) => (
										<Option value={cl.id} key={cl.id}>
											{" "}
											{cl.name}
										</Option>
									))}
							</Select>
						</Form.Item>
					)}
					<Form.Item label="Khoảng thời gian" name="dateRange" required>
						<RangePicker />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
