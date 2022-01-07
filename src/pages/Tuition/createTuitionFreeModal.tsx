import React, { useEffect, useState } from 'react';
import { PeriodTuitionType, StudentType } from 'interface';
import { RootState, useAppDispatch } from 'store/store';
import { Button, Form, Input, InputNumber, Modal, Tooltip } from 'antd';
import {FileAddOutlined} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { actionGetDayoffs } from 'store/settings/dayoff';
import { get } from 'lodash';
import { countSameDates, getDatesInRange } from 'utils/dateUltils';
import { actionAddTuitionFee } from 'store/tuition/tuition';
import { actionGetPeriodTuion } from 'store/tuition/periodslice';
import numeral from 'numeral';

export function CreateTuitionFeeModal(prop: { periodInfo: PeriodTuitionType | null, studentInfo: StudentType }): JSX.Element {

	const { periodInfo, studentInfo } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [uFrom] = Form.useForm();
	const { TextArea } = Input;
	const [submiting, setSubmiting] = useState(false);
	const [estSessionNum, setEstSessionNum] = useState(0);

	const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);

	useEffect(() => {
		if (show) {
			dispatch(actionGetDayoffs({ from_date: studentInfo.admission_date, to_date: periodInfo?.to_date }));
		}
	}, [periodInfo, studentInfo, dispatch, show])


	useEffect(() => {
		const dayoffList: string[] = [];
		if (get(dayoffs, "data", []).length > 0) {
			get(dayoffs, "data", []).forEach((day) => {
				dayoffList.push(day.from_date);
			});
		}
		let dateListInRang: string[] = [];
		if (get(studentInfo, "class.schedule", []).length > 0) {
			let count = 0;
			get(studentInfo, "class.schedule", []).forEach((day: number) => {
				dateListInRang = getDatesInRange(get(studentInfo, "admission_date", ""), get(periodInfo, "to_date", ""), day);
				count += dateListInRang.length - countSameDates(dateListInRang, dayoffList);
			})
			setEstSessionNum(count);
			uFrom.setFieldsValue({
				est_fee: count * +get(periodInfo, "fee_per_session", 0),
				amount: count * +get(periodInfo, "fee_per_session", 0),
			})
		}
	}, [dayoffs, studentInfo, periodInfo, uFrom])


	function handleValuesChange(changeValue: any, allValues: any) {
		if (changeValue.note) return;
		console.log(allValues)
		uFrom.setFieldsValue({
			amount: +allValues.est_fee - +allValues.fixed_deduction - +(allValues.est_fee * allValues.flexible_deduction / 100)
		})
	}

	function handleCancel() {
		uFrom.setFieldsValue(
			{
				"fixed_deduction": "0",
				"flexible_deduction": "0"
			}
		)
		setShow(false)
	}

	function handleSubmit(values: any) {
		setSubmiting(true);
		const est_fee  = +values.flexible_deduction * estSessionNum * get(periodInfo, "fee_per_session", 0)/100
		dispatch(actionAddTuitionFee({
			student_id: get(studentInfo, "id", 0),
			period_tuition_id: get(periodInfo, "id", 0),
			fixed_deduction: values.fixed_deduction,
			flexible_deduction:String(est_fee),
			residual: "",
			note: values.note,
			from_date: get(studentInfo, "admission_date", ""),
			to_date: get(periodInfo, "to_date", ""),
			est_sesson_num: estSessionNum
		})).then(() => {
			setShow(false);
			dispatch(actionGetPeriodTuion(get(periodInfo, "id", 0)));
		}).finally(() => setSubmiting(false));
	}
	return (
		<>
			<Tooltip title="Tạo bảng học phí">
				<Button onClick={() => setShow(true)} icon={<FileAddOutlined />} type="link" />
			</Tooltip>

			<Modal title="Tạo bảng học phí cho học sinh"
				visible={show}
				closable
				onCancel={handleCancel}
				width={800}
				cancelText="Huỷ bỏ"
				footer={[
					<Button  key="btnsubmit" onClick={handleCancel}>
						Huỷ bỏ
					</Button>,
					<Button loading={submiting} key="btnsubmit" type="primary" htmlType="submit" form="aForm">
						Hoàn tất
					</Button>,
				]}
			>

				<Form
					id="aForm"
					form={uFrom}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 16 }}
					layout="horizontal"
					initialValues={{
						"stname": get(studentInfo, "name", ""),
						"fixed_deduction": "0",
						"flexible_deduction": "0"
					}}
					onValuesChange={handleValuesChange}
					onFinish={handleSubmit}
				>
					<Form.Item label="Họ và tên" name="stname">
						<Input disabled style={{color:"#2c3e50"}}/>
					</Form.Item>
					<Form.Item label={`Học phí ước tính (${estSessionNum} buổi)`} name="est_fee">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%", color: "#3498db", fontWeight: 700 }} disabled />
					</Form.Item>
					<Form.Item label="Giảm trừ đặc biệt" name="fixed_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%", color: "#e74c3c" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ theo đợt(%)" name="flexible_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "20%", color: "#e67e22" }} />
					</Form.Item>
					<Form.Item label="Thành tiền" name="amount">
						<InputNumber formatter={(value) => numeral(value).format()}  style={{ width: "100%", color: "#3498db", fontWeight: 700 }} disabled />
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