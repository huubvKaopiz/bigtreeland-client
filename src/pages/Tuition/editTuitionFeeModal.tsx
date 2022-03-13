import { FileTextOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Tooltip } from 'antd';
import { PeriodTuitionType } from 'interface';
import { get } from 'lodash';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from 'store/store';
import { actionGetPeriodTuion } from 'store/tuition/periodslice';
import { actionUpdateTuitionFee } from 'store/tuition/tuition';
import { TuitionFeeType } from './createTuitionPeriod';
const { TextArea } = Input;

export function EditTuitionFeeModal(prop: { periodInfo: PeriodTuitionType | null, tuitionFeeInfo: TuitionFeeType, stName?: string }): JSX.Element {

	const { periodInfo, tuitionFeeInfo, stName } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [uFrom] = Form.useForm();
	const [submiting, setSubmiting] = useState(false);

	useEffect(() => {
		if (tuitionFeeInfo) {
			const est_session_num = get(tuitionFeeInfo, "est_session_num", 0) > 0 ? get(tuitionFeeInfo, "est_session_num", 0) : get(periodInfo, "est_session_num", 0);
			const est_fee = est_session_num * get(periodInfo, "fee_per_session", 0);
			uFrom.setFieldsValue(
				{
					"stname": stName,
					"est_fee": est_fee,
					"prev_debt": get(tuitionFeeInfo, "prev_debt", "0"),
					"residual": get(tuitionFeeInfo, "residual", "0"),
					"fixed_deduction": get(tuitionFeeInfo, "fixed_deduction", "0"),
					"flexible_deduction": 100 * +get(tuitionFeeInfo, "flexible_deduction", '0') / est_fee,
					"amount": est_fee + +get(tuitionFeeInfo, "prev_debt", "0") - +get(tuitionFeeInfo, "residual", "0") - +get(tuitionFeeInfo, "fixed_deduction", "0") - +get(tuitionFeeInfo, "flexible_deduction", '0'),
					"note": get(tuitionFeeInfo, "note", ""),
				}
			)
		}
	}, [tuitionFeeInfo, uFrom, periodInfo, stName])

	function handleValuesChange(changeValue: any, allValues: any) {
		if (changeValue.note) return;
		uFrom.setFieldsValue({
			amount: +allValues.est_fee - +allValues.fixed_deduction - +(allValues.est_fee * allValues.flexible_deduction / 100)
		})
	}

	function handleCancel() {
		const est_session_num = get(tuitionFeeInfo, "est_session_num", 0) > 0 ? get(tuitionFeeInfo, "est_session_num", 0) : get(periodInfo, "est_session_num", 0);
		const est_fee = est_session_num * get(periodInfo, "fee_per_session", 0);
		uFrom.setFieldsValue(
			{
				"fixed_deduction": get(tuitionFeeInfo, "fixed_deduction", "0"),
				"flexible_deduction":100 * +get(tuitionFeeInfo, "flexible_deduction", '0') / est_fee,
				"note":get(tuitionFeeInfo,"note","")
			}
		)
		setShow(false)
	}

	function handleSubmit(values: any) {
		setSubmiting(true);
		const est_fee = +values.flexible_deduction * get(periodInfo, "est_session_num", 0) * get(periodInfo, "fee_per_session", 0) / 100
		dispatch(actionUpdateTuitionFee({
			data: {
				fixed_deduction: values.fixed_deduction,
				flexible_deduction: String(est_fee),
				note: values.note,
			}, tuition_id: get(tuitionFeeInfo, "id", 0)
		})).then(() => {
			setShow(false);
			dispatch(actionGetPeriodTuion(get(periodInfo, "id", 0)));
		}).finally(() => setSubmiting(false));
	}
	return (
		<>
			<Tooltip title="Chi tiết bảng học phí">
				<Button onClick={() => setShow(true)} icon={<FileTextOutlined />} type="link"  />
			</Tooltip>

			<Modal title="Bảng học phí cho học sinh"
				visible={show}
				closable
				onCancel={handleCancel}
				width={800}
				cancelText="Huỷ bỏ"
				footer={[
					<Button key="btnPrint" onClick={handleCancel}>
						In
					</Button>,
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form="uForm" disabled={tuitionFeeInfo.status === 1 ? true : false}>
						Cập nhật
					</Button>,
				]}
			>

				<Form
					id="uForm"
					form={uFrom}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 16 }}
					layout="horizontal"
					onValuesChange={handleValuesChange}
					onFinish={handleSubmit}
				>
					<Form.Item label="Họ và tên" name="stname">
						<Input disabled style={{ color: "#2c3e50" }} />
					</Form.Item>
					<Form.Item label={`Học phí ước tính (${get(tuitionFeeInfo, "est_session_num", 0) > 0 ? get(tuitionFeeInfo, "est_session_num", 0) : get(periodInfo, "est_session_num", 0)} buổi)`} name="est_fee">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#3498db", fontWeight: 700 }} disabled />
					</Form.Item>
					<Form.Item label={`Nợ kỳ trước`} name="prev_debt">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#3498db", fontWeight: 700 }} disabled />
					</Form.Item>
					<Form.Item label={`Dư kỳ trước`} name="residual">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#e74c3c", fontWeight: 700 }} disabled />
					</Form.Item>
					<Form.Item label="Giảm trừ đặc biệt" name="fixed_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#e74c3c" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ theo đợt(%)" name="flexible_deduction" >
						<InputNumber  
							style={{ width: "20%", color: "#e67e22" }} 
							/>
					</Form.Item>
					<Form.Item label="Thành tiền" name="amount">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#3498db" }} disabled />
					</Form.Item>
					<Form.Item label="Ghi chú" name="note">
						<TextArea
							placeholder="Ghi chú"
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}