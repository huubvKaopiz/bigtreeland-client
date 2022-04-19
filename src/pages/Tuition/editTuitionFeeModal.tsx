import { Button, DatePicker, Form, Input, InputNumber, Modal, Tooltip } from 'antd';
import { PeriodTuitionType } from 'interface';
import { get } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetPeriodTuion } from 'store/tuition/periodslice';
import { actionUpdateTuitionFee } from 'store/tuition/tuition';
import { TuitionFeeType } from './createTuitionPeriod';
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export function EditTuitionFeeModal(prop: {
	periodInfo: PeriodTuitionType | null,
	tuitionFeeInfo: TuitionFeeType | null,
	stName?: string;
	show: boolean,
	setShow: (param: boolean) => void
}): JSX.Element {

	const { periodInfo, tuitionFeeInfo, stName, show, setShow } = prop;
	const dispatch = useAppDispatch();
	const [uFrom] = Form.useForm();
	const [submiting, setSubmiting] = useState(false);

	const updateStatus = useSelector((state: RootState) => state.tuitionFeeReducer.updateTuitionFeeState)


	useMemo(() => {
		if (tuitionFeeInfo) {
			const est_session_num = get(tuitionFeeInfo, "est_session_num", 0) > 0 ? get(tuitionFeeInfo, "est_session_num", 0) : get(periodInfo, "est_session_num", 0);
			const est_fee = est_session_num * get(periodInfo, "fee_per_session", 0);
			uFrom.setFieldsValue(
				{
					"stname": get(tuitionFeeInfo, "student.name", ""),
					"period_date_range": tuitionFeeInfo?.from_date ? [moment(tuitionFeeInfo.from_date), moment(tuitionFeeInfo?.to_date)] : [moment(periodInfo?.from_date), moment(periodInfo?.to_date)],
					"est_fee": est_fee,
					"prev_debt": get(tuitionFeeInfo, "prev_debt", "0"),
					"residual": get(tuitionFeeInfo, "residual", "0"),
					"fixed_deduction": get(tuitionFeeInfo, "fixed_deduction", "0"),
					"flexible_deduction": 100 * +get(tuitionFeeInfo, "flexible_deduction", '0') / est_fee,
					"paid_amount": +get(tuitionFeeInfo, "paid_amount", 0),
					"amount": est_fee + +get(tuitionFeeInfo, "prev_debt", "0") - 
										+get(tuitionFeeInfo, "residual", "0") - 
										+get(tuitionFeeInfo, "fixed_deduction", "0") - 
										+get(tuitionFeeInfo, "flexible_deduction", '0'),
					"note": get(tuitionFeeInfo, "note", ""),
				}
			)
		}
	}, [tuitionFeeInfo, uFrom, periodInfo])

	useMemo(() => {
		if (updateStatus === 'success') {
			dispatch(actionGetPeriodTuion(get(periodInfo, "id", 0)));
			setShow(false)
			setSubmiting(false)
		} else if (updateStatus === 'error') setSubmiting(false)
	}, [updateStatus])

	function handleValuesChange(changeValue: any, allValues: any) {
		if (changeValue.note) return;
		uFrom.setFieldsValue({
			amount: +allValues.est_fee + 
					+allValues.prev_debt  - 
					+allValues.residual - 
					+allValues.fixed_deduction - 
					+(allValues.est_fee * allValues.flexible_deduction / 100)
		})
	}

	function handleCancel() {
		const est_session_num = get(tuitionFeeInfo, "est_session_num", 0) > 0 ? get(tuitionFeeInfo, "est_session_num", 0) : get(periodInfo, "est_session_num", 0);
		const est_fee = est_session_num * get(periodInfo, "fee_per_session", 0);
		uFrom.setFieldsValue(
			{
				"fixed_deduction": get(tuitionFeeInfo, "fixed_deduction", "0"),
				"flexible_deduction": 100 * +get(tuitionFeeInfo, "flexible_deduction", '0') / est_fee,
				"note": get(tuitionFeeInfo, "note", "")
			}
		)
		setShow(false)
	}

	function handleSubmit(values: any) {
		setSubmiting(true);
		console.log(tuitionFeeInfo)
		const est_fee = +values.flexible_deduction * get(periodInfo, "est_session_num", 0) * get(periodInfo, "fee_per_session", 0) / 100
		dispatch(actionUpdateTuitionFee({
			data: {
				fixed_deduction: values.fixed_deduction,
				flexible_deduction: String(est_fee),
				note: values.note,
			}, tuition_id: get(tuitionFeeInfo, "id", 0)
		}));
	}
	return (
		<>

			<Modal title="Bảng học phí cho học sinh"
				visible={show}
				closable
				onCancel={handleCancel}
				width={800}
				cancelText="Huỷ bỏ"
				footer={[
					// <Button key="btnPrint" onClick={handleCancel}>
					// 	In
					// </Button>,
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form="uForm" disabled={tuitionFeeInfo && tuitionFeeInfo.status === 1 || tuitionFeeInfo?.status === 3 ? true : false}>
						Cập nhật
					</Button>,
				]}
			>

				<Form
					id="uForm"
					form={uFrom}
					labelCol={{ span: 7 }}
					wrapperCol={{ span: 15 }}
					layout="horizontal"
					onValuesChange={handleValuesChange}
					onFinish={handleSubmit}
				>
					<Form.Item label="Họ và tên" name="stname">
						<Input disabled style={{ color: "#2c3e50" }} />
					</Form.Item>
					<Form.Item label="Chu kỳ thu" name="period_date_range">
						<RangePicker />
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
						<InputNumber formatter={(value) => numeral(value).format("0,0")} style={{ width: "50%", color: "#3498db" }} disabled />
					</Form.Item>
					<Form.Item label="Đã thanh toán" name="paid_amount">
						<InputNumber formatter={(value) => numeral(value).format("0,0")} style={{ width: "100%", color: "#e74c3c", fontWeight: 700 }} disabled />
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