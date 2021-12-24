import { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Input, Spin, InputNumber } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAppDispatch } from "store/store";
import numeral from "numeral";
import { TuitionFeeType } from "interface";
import { actionUpdateTuitionFee } from "store/tuition/tuition";
import { actionGetPeriodTuion, actionGetPeriodTuions } from "store/tuition/periodslice";

export default function EditStdTuition(props: {
	stdTuitionFee: TuitionFeeType;
}): JSX.Element {
	const [show, setShow] = useState(false);
	const [uFrom] = Form.useForm();
	const { stdTuitionFee } = props;
	const { TextArea } = Input;
	const dispatch = useAppDispatch();
	const [submiting, setSubmiting] = useState(false);

	useEffect(() => {
		if (stdTuitionFee) {
			uFrom.setFieldsValue({
				student_id: stdTuitionFee.student_id,
				fixed_deduction: stdTuitionFee.fixed_deduction,
				flexible_deduction: stdTuitionFee.flexible_deduction,
				debt: stdTuitionFee.debt,
				residual: stdTuitionFee.residual,
				note: stdTuitionFee.note,
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stdTuitionFee]);

	function handleSubmit(values: any) {
		setSubmiting(true);
		dispatch(actionUpdateTuitionFee({ data: values, tuition_id: stdTuitionFee.id }))
			.then(() => {
				setShow(false);
				dispatch(actionGetPeriodTuions({ page: 1 }));
			})
			.finally(() => setSubmiting(false));
	}

	return (
		<div>
			<Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
			<Modal
				visible={show}
				title="Cập nhật học phí của học sinh"
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
					<Form.Item label="Họ và tên" name="student_id">
						<Input />
					</Form.Item>
					<Form.Item label="Học phí" name="fee_per_session">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Nợ kỳ trước" name="debt">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ cố định" name="fixed_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ theo đợt" name="flexible_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Thành tiền" name="">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Ghi chú" name="note">
						<TextArea
							placeholder="Ghi chú"
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
