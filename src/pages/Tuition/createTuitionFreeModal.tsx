import { Button, Form, Input, InputNumber, Modal } from 'antd';
import { PeriodTuitionType, StudentType } from 'interface';
import { get } from 'lodash';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionGetDayoffs } from 'store/settings/dayoff';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetPeriodTuion } from 'store/tuition/periodslice';
import { actionAddTuitionFee } from 'store/tuition/tuition';
import { getDatesInRange, getSameDates } from 'utils/dateUltils';

export function CreateTuitionFeeModal(prop: {
	periodInfo: PeriodTuitionType | null;
	studentInfo: StudentType | null;
	show: boolean;
	setShow: (prams: boolean) => void;
}): JSX.Element {

	const { periodInfo, studentInfo, show, setShow } = prop;
	const dispatch = useAppDispatch();
	const [uFrom] = Form.useForm();
	const { TextArea } = Input;
	const [submiting, setSubmiting] = useState(false);
	const [estSessionNum, setEstSessionNum] = useState(0);
	const [dayoffList, setDayoffList] = useState<string[]>([]);
	const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);

	useEffect(() => {
		if (studentInfo && periodInfo) {
			dispatch(actionGetDayoffs({ from_date: studentInfo.class_histories[studentInfo.class_histories.length - 1].date, to_date: periodInfo?.to_date }));
		}
	}, [periodInfo, studentInfo, dispatch])


	useEffect(() => {
		if (dayoffs && studentInfo) {
			const dayoffList: string[] = [];
			if (get(dayoffs, "data", []).length > 0) {
				get(dayoffs, "data", []).forEach((day) => {
					dayoffList.push(day.from_date);
				});
			}
			let dateListInRang: string[] = [];
			let dayoff_list: string[] = [];
			if (get(studentInfo, "class.schedule", []).length > 0) {
				let count = 0;
				get(studentInfo, "class.schedule", []).forEach((day: number) => {
					dateListInRang = getDatesInRange(studentInfo.class_histories[studentInfo.class_histories.length - 1].date, get(periodInfo, "to_date", ""), day);
					count += dateListInRang.length;
					dayoff_list = dayoff_list.concat(getSameDates(dateListInRang, dayoffList))
				})
				count -= dayoff_list.length;
				setEstSessionNum(count);
				setDayoffList(dayoff_list);
				uFrom.setFieldsValue({
					est_fee: count * +get(periodInfo, "fee_per_session", 0),
					amount: count * +get(periodInfo, "fee_per_session", 0),
				})
			}
		}
	}, [dayoffs, studentInfo, periodInfo, uFrom])


	function handleValuesChange(changeValue: any, allValues: any) {
		if (changeValue.note) return;
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
		const est_fee = +values.flexible_deduction * estSessionNum * get(periodInfo, "fee_per_session", 0) / 100
		dispatch(actionAddTuitionFee({
			student_id: get(studentInfo, "id", 0),
			period_tuition_id: get(periodInfo, "id", 0),
			fixed_deduction: values.fixed_deduction,
			flexible_deduction: String(est_fee),
			residual: "",
			note: values.note,
			from_date: get(studentInfo, "admission_date", ""),
			to_date: get(periodInfo, "to_date", ""),
			est_session_num: estSessionNum,
			dayoffs: dayoffList
		})).then(() => {
			setShow(false);
			dispatch(actionGetPeriodTuion(get(periodInfo, "id", 0)));
		}).finally(() => setSubmiting(false));
	}
	return (
		<>


			<Modal title="Tạo bảng học phí cho học sinh"
				visible={show}
				closable
				onCancel={handleCancel}
				width={800}
				cancelText="Huỷ bỏ"
				footer={[
					<Button key="btnsubmit" onClick={handleCancel}>
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
						<Input disabled style={{ color: "#2c3e50" }} />
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
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "100%", color: "#3498db", fontWeight: 700 }} disabled />
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