import { Button, DatePicker, Form, Input, InputNumber, Modal, Tag } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { PeriodTuitionType, StudentType, TuitionFeeType } from "interface";
import { get } from "lodash";
import moment, { Moment } from "moment";
import numeral from "numeral";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetDayoffs } from "store/settings/dayoff";
import { RootState, useAppDispatch } from "store/store";
import { actionAddTuitionFee, actionUpdateTuitionFee } from "store/tuition/tuition";
import { getDatesInRange, getSameDates } from "utils/dateUltils";

const {RangePicker} = DatePicker;

export interface TuitionFeeDetailFormPropType {
    show: boolean;
    onClose:(payload: boolean) => void;
    periodTuition:PeriodTuitionType | null;
    currentTuitionFee?:TuitionFeeType | null;
    studentInfo?:StudentType | null;
}

export default function TuitionFeeDetailForm(props:TuitionFeeDetailFormPropType): JSX.Element {
    const {show, onClose, periodTuition, currentTuitionFee, studentInfo} = props;
    const dispatch = useAppDispatch();
    const [tuitionFeeForm] = Form.useForm();
    const [dateRange, setDateRange] = useState<Moment[]>([moment(periodTuition?.from_date), moment(currentTuitionFee?.to_date)]);
    const [dayoffList, setDayoffList] = useState<string[]>([]);

    const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
    const addTuitionFeeState = useSelector((state: RootState) => state.tuitionFeeReducer.addTuitionFeeState);
    const updateTuitionFeeState = useSelector((state: RootState) => state.tuitionFeeReducer.updateTuitionFeeState);

    useMemo(() => {
        let period_date_range:any = null;
        if(currentTuitionFee && periodTuition){
            console.log(currentTuitionFee)
            const est_session_num = get(currentTuitionFee, "est_session_num", 0) > 0 ? 
                                    get(currentTuitionFee, "est_session_num", 0) : 
                                    get(periodTuition, "est_session_num", 0);
            const est_fee = est_session_num * get(periodTuition, "fee_per_session", 0);
            const prev_debt = isNaN(+currentTuitionFee.prev_debt) ? 0 : currentTuitionFee.prev_debt;
            const residual = isNaN(+currentTuitionFee.residual) ? 0 : currentTuitionFee.residual;
            const fixed_deduction = isNaN(+currentTuitionFee.fixed_deduction) ? 0 : currentTuitionFee.fixed_deduction;
            const flexible_deduction = 100* +get(currentTuitionFee, "flexible_deduction", '0') / est_fee;
            const paid_amount = isNaN(+currentTuitionFee.paid_amount) ? 0 : +currentTuitionFee.paid_amount;
            const note  = currentTuitionFee.note;
            period_date_range =  currentTuitionFee?.from_date ? 
                                [moment(currentTuitionFee.from_date), moment(currentTuitionFee?.to_date)] : 
                                [moment(periodTuition?.from_date), moment(periodTuition?.to_date)];
            // console.log('currentTuitionFee',est_fee,prev_debt,residual,fixed_deduction,flexible_deduction,paid_amount)
            tuitionFeeForm.setFieldsValue({
                stname: get(currentTuitionFee, "student.name", ""),
                period_date_range,
                est_fee,
                prev_debt,
                residual,
                fixed_deduction,
                flexible_deduction,
                paid_amount,
                amount: est_fee + +prev_debt - +residual - flexible_deduction * est_fee/100 - +fixed_deduction,
                note,
            })
                  
        }else if(studentInfo && periodTuition){
            const est_fee = get(periodTuition, "est_session_num", 0) * get(periodTuition, "fee_per_session", 0);
            period_date_range =  [moment(periodTuition?.from_date), moment(periodTuition?.to_date)],
            tuitionFeeForm.setFieldsValue({
                "stname": get(studentInfo, "name", ""),
                "period_date_range":period_date_range,
                "est_fee": est_fee,
                'prev_debt':0,
                'residual':0,
                'fixed_deduction':0,
                'flexible_deduction':0,
                'amount':est_fee,
                'paid_amount':0,
            });
        }
        setDateRange(period_date_range);
    },[periodTuition, currentTuitionFee, studentInfo])
    
    useEffect(() => {
        if(!dateRange) return;
        dispatch(actionGetDayoffs({
            from_date:dateRange[0].format('YYYY-MM-DD'),
            to_date:dateRange[1].format('YYYY-MM-DD'),
        }))
    },[dateRange])

     useEffect(()=>{
       if(addTuitionFeeState === 'success' || updateTuitionFeeState === 'success') onClose(true)
    },[addTuitionFeeState,updateTuitionFeeState])
    
    //cal estSessionNum when date range changes
    const estSessionNum = useMemo(() => {
        let res = 0;
        console.log('dateRange:',dateRange)
        if(dateRange){
            const dayoffList: string[] = [];
			if (get(dayoffs, "data", []).length > 0) {
				get(dayoffs, "data", []).forEach((day) => {
					dayoffList.push(day.from_date);
				});
			}
			let dateListInRang: string[] = [];
            let dayoff_list: string[] = [];
			if (get(periodTuition, "class.schedule", []).length > 0) {
				let count = 0;
				get(periodTuition, "class.schedule", []).forEach((day: number) => {
					dateListInRang = getDatesInRange(dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD'), day);
					count += dateListInRang.length;
					dayoff_list = dayoff_list.concat(getSameDates(dateListInRang, dayoffList))
				})
                count -= dayoff_list.length;
                res = count;
            }
            setDayoffList(dayoff_list);
        }
        return res;
    },[dayoffs, dateRange])

    useMemo(() => {
        // console.log('estSessionNum change',estSessionNum)
        // console.log('form fileds values: ',tuitionFeeForm.getFieldsValue())
       const est_fee = estSessionNum * get(periodTuition, "fee_per_session", 0);
       const prev_debt = +tuitionFeeForm.getFieldValue('prev_debt');
       const residual = +tuitionFeeForm.getFieldValue('residual');
       const flexible_deduction = +tuitionFeeForm.getFieldValue('flexible_deduction') * est_fee/100
       const fixed_deduction = +tuitionFeeForm.getFieldValue('fixed_deduction');
       const paid_amount = +tuitionFeeForm.getFieldValue('paid_amount');
       const amount = est_fee + prev_debt - residual - flexible_deduction - fixed_deduction;
       console.log('amount', amount,prev_debt, residual, flexible_deduction, fixed_deduction, paid_amount);
       tuitionFeeForm.setFieldsValue({est_fee, amount})
    },[estSessionNum])

    // handle forms values change
    const handleFormValuesChange = (changeValue: any, allValues: any) => {
        if(!periodTuition) return;
        if(changeValue.note) return;
        if(changeValue.period_date_range){
            setDateRange(changeValue.period_date_range);
            return;
        }
        tuitionFeeForm.setFieldsValue({
			amount: +allValues.est_fee + +allValues.prev_debt - +allValues.residual - +allValues.fixed_deduction - (+allValues.est_fee * +allValues.flexible_deduction / 100)
		})
    }

    const handleCancel = () => {
        if(currentTuitionFee){
            console.log("")
        }else tuitionFeeForm.resetFields();
        onClose(false);
    }

    // submit form
    const handleSubmitForm = (values:any) => {
       const flexible_deduction =  +values.flexible_deduction * estSessionNum * get(periodTuition, "fee_per_session", 0) / 100;
       const payload = {
        student_id: currentTuitionFee ? currentTuitionFee.student_id : get(studentInfo, "id", 0),
        period_tuition_id: get(periodTuition, "id", 0),
        fixed_deduction:values.fixed_deduction ? String(values.fixed_deduction) : '0',
        flexible_deduction:values.flexible_deduction ? String(flexible_deduction) : '0',
        residual:values.residual ? String(values.residual) : '0',
        prev_debt: values.prev_debt ? String(values.prev_debt) : '0',
        note: values.note,
        from_date:dateRange[0].format('YYYY-MM-DD'),
        to_date:dateRange[1].format('YYYY-MM-DD'),
        est_session_num: estSessionNum,
        dayoffs: dayoffList
       }
       if(currentTuitionFee){   
        dispatch(actionUpdateTuitionFee({data:payload, tuition_id:currentTuitionFee.id}))
       }else  dispatch(actionAddTuitionFee(payload));
    }
    return (
        <Modal title="Tạo bảng học phí cho học sinh"
                visible={show}
                getContainer={false}
				closable
				onCancel={handleCancel}
				width={800}
				cancelText="Huỷ bỏ"
				footer={[
					<Button key="btCancel" onClick={handleCancel}>
						Huỷ bỏ
					</Button>,
					<Button loading={addTuitionFeeState === 'loading' || updateTuitionFeeState === 'loading'} key="btnsubmit" type="primary" htmlType="submit" form="aForm">
						Hoàn tất
					</Button>,
				]}
			>
				<Form
					id="aForm"
					form={tuitionFeeForm}
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onValuesChange={handleFormValuesChange}
					onFinish={handleSubmitForm}
				>
					<Form.Item label="Họ và tên" name="stname">
						<Input disabled style={{ color: "#2c3e50" }} />
					</Form.Item>
					<Form.Item label="Chu kỳ thu" name="period_date_range">
						<RangePicker />
					</Form.Item>
					<Form.Item label={`Học phí ước tính`} name="est_fee">
                        <InputNumber 
                            formatter={(value) => numeral(value).format()} 
                            style={{ width: "100%", color: "#3498db", fontWeight: 700 }} 
                            disabled 
                            addonAfter={`${estSessionNum} buổi * ${numeral(periodTuition?.fee_per_session).format('0,0')}`}
                            />
					</Form.Item>
                    <Form.Item label="Nợ kỳ trước" name="prev_debt">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: '50%', color: "#3498db" }} />
					</Form.Item>
                    <Form.Item label="Dư kỳ trước" name="residual">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: '50%', color: "#e74c3c" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ đặc biệt" name="fixed_deduction">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: '50%', color: "#e74c3c" }} />
					</Form.Item>
					<Form.Item label="Giảm trừ theo đợt(%)" name="flexible_deduction">
                        <InputNumber 
                            formatter={(value) => numeral(value).format()} 
                            style={{ width: "20%", color: "#e67e22" }} 
                            />
					</Form.Item>
					<Form.Item label="Thành tiền" name="amount">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#3498db", fontWeight: 700 }} disabled />
					</Form.Item>
                    <Form.Item label="Đã thanh toán" name="paid_amount">
						<InputNumber formatter={(value) => numeral(value).format()} style={{ width: "50%", color: "#3498db", fontWeight: 700 }} disabled />
					</Form.Item>

                    <Form.Item label="Ngày lễ">
                        {
                            dayoffList && dayoffList.map(day => <Tag color='red'>{day}</Tag>)
                        }
                    </Form.Item>
					<Form.Item label="Ghi chú" name="note">
						<TextArea
							placeholder="Ghi chú"
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					</Form.Item>
				</Form>
			</Modal>
    )
}