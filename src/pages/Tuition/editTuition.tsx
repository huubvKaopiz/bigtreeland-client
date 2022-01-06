import {
	Descriptions,
	Layout,
	PageHeader,
	DatePicker,
	Select,
	Table,
	Input,
	Tooltip,
	Checkbox,
	Button,
	Modal,
} from "antd";
import { QuestionCircleOutlined, CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { cloneDeep, get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { actionGetClass, actionGetClasses, actionSetClassStateNull } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents, actionSetStudentsStateNull } from "store/students/slice";
import { actionGetDayoffs, actionResetDayOffs } from "store/settings/dayoff";
import { StudentType } from "interface";
import { actionGetPeriodTuion, actionUpdatePeriodTuion, actionResetUpdatePeriodTuion } from "store/tuition/periodslice";
import { formatCurrency } from "utils/ultil";
import { countSameDates, getDatesInRange } from "utils/dateUltils";
import { TuitionFeeType } from "./addTuition"
const { Option } = Select;
const { RangePicker } = DatePicker;
import useIsMounted from "../../hooks/useIsMounted";


export default function EditTuition(): JSX.Element {
    const params = useParams() as {tuition_id:string};
	const isMounted = useIsMounted();
	const history = useHistory();
	const dispatch = useAppDispatch();
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [residualSessionNum, setrResidualSessionNum] = useState(0);
	const [tuitionFees, setTuitionFees] = useState<TuitionFeeType[]>([]);
	const [showFixedDeductionAllModal, setShowFixedDeductionAllModal] = useState(false);
	const [fixedDeductionAlState, setFixedDeductionAlState] = useState(false);
	const [fixedDeductionAlAmount, setFixedDeductionAlAmount] = useState("");
	const [fixedDeductionAllType, setFixedDeductionAllType] = useState(0);
	const [fixedDeductionTypeList, setFixedDeductionTypeList] = useState<number[]>([]);
	const [flexibleDeductionTypeList, setFlexibleDeductionTypeList] = useState<number[]>([]);
	const [applyAllReduce, setApplyAllReduce] = useState(false);

	const tuitionPeriodInfo = useSelector((state: RootState) => state.periodTuitionReducer.periodTuition);
	const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const getClassInfoStatus = useSelector((state: RootState) => state.classReducer.getClassStatus);
	const updatePeriodTuitionState = useSelector((state: RootState) => state.periodTuitionReducer.updatePeriodTuitionStatus);
	const [studentList, setStudetnList] = useState<StudentType[]>([]);
	const [estSessionNum, setEstSessionNum] = useState<number>(0);
	const [feePerStudent, setFeePerStudent] = useState<number>(0);
	const [estTuitionFee, setEstTuitionFee] = useState<number>(0);
	const [tuitionFeeList, setTuitionFeeList] = useState<number[]>([])
	const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

	const fixed_deductions_ref = useRef<any>([]);
	const flexible_deductions_ref = useRef<any>([]);
	const notes_ref = useRef<any>([]);

	useEffect(() => {
		if (updatePeriodTuitionState !== "loading") {
			setShowConfirmSubmit(false);
			dispatch(actionResetUpdatePeriodTuion());
		}
	}, [dispatch, updatePeriodTuitionState]);

	useEffect(() => {
		dispatch(actionResetDayOffs())
		dispatch(actionResetUpdatePeriodTuion())
	},[dispatch])

	useEffect(()=> {
		if (applyAllReduce)
			onChangeDeductionAllValue()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [applyAllReduce])

	useEffect(() => {
		dispatch(
			actionGetStudents({
				class_id: tuitionPeriodInfo?.class_id ?? void 0,
				per_page: tuitionPeriodInfo?.tuition_fees.length,
			})
		);
		dispatch(actionGetDayoffs({ from_date: get(tuitionPeriodInfo, "from_date", ""), to_date: get(tuitionPeriodInfo, "to_date", "") }));
		const fromDate = get(tuitionPeriodInfo, "from_date", moment(Date.now()).format('YYYY-MM-DD'));
		const toDate = get(tuitionPeriodInfo, "to_date", moment(Date.now()).format('YYYY-MM-DD'));
		setFromDate(fromDate)
		setToDate(toDate)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, tuitionPeriodInfo]);

	useEffect(()=> {
		const fee_per_session = get(tuitionPeriodInfo, "class.fee_per_session", 0);
		const dayoffList : string[] = dayoffs?.data?.map((day)=> 
			day.from_date
		) ?? []
		let dateListInRang: string[] = [];
		const schedule = get(tuitionPeriodInfo, "class.schedule", []);
		let sessionNum = 0;
		if(schedule.length > 0) {
			for (let index = 0; index < schedule.length; index++) {
				const day = schedule[index];
				dateListInRang = getDatesInRange(fromDate, toDate, day);
				sessionNum += dateListInRang.length - countSameDates(dateListInRang, dayoffList);
			}
			setEstSessionNum(sessionNum);
		} 
		setEstTuitionFee(
			(get(tuitionPeriodInfo, "tuition_fees", []) as TuitionFeeType[]).reduce((amount, student) => {
				const est_fee =
				fee_per_session * sessionNum;
				const deduce_amount =
					+get(student, "residual", 0) +
					+get(student, "fixed_deduction", 0) +
					+get(student, "flexible_deduction", 0) -
					+get(student, "debt", 0);
				const cal_fee = est_fee - deduce_amount;
				return cal_fee > 0 ? amount + cal_fee : amount;
			}, 0)
		);
		
		setFeePerStudent(sessionNum * fee_per_session);

		// map input with ref
		const tuition_fees = get(tuitionPeriodInfo, "tuition_fees", []) as TuitionFeeType[]
		const tuitionFeeList: TuitionFeeType[] = [];
		const fee_list: number[] = []
		tuition_fees.forEach((fee, index) => {
			fixedDeductionTypeList[index] = fixedDeductionTypeList[index] ?? 1
			flexibleDeductionTypeList[index] = flexibleDeductionTypeList[index] ?? 1
			fee_list[index] = getTuitionFeeAmount(index, sessionNum)
			tuitionFeeList.push({
				student_id: fee.student_id,
				fixed_deduction: fee.fixed_deduction,
				flexible_deduction: fee.flexible_deduction,
				// debt: fee.debt,
				note: "",
			})
		})
		setTuitionFees(tuitionFeeList)
		setTuitionFeeList(fee_list)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dayoffs, tuitionPeriodInfo])

	useEffect(() => {
		setStudetnList([...(get(students, "data", []) as StudentType[])]);
	}, [students]);

    useEffect(()=>{
        if(params.tuition_id){           
			dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
        }
    },[dispatch, params.tuition_id]);

	function handleUpdateTuition() {
		if (tuitionPeriodInfo) {
			const est_fee = estSessionNum * get(classInfo, "fee_per_session", 0);
			const tuition_fees =
				tuitionPeriodInfo?.tuition_fees.map((fee, index) => {
					const flexAmount = [null, undefined, ""].includes(flexible_deductions_ref.current[index].input.value)
						? 0
						: flexible_deductions_ref.current[index].input.value;
					const fixAmount = [null, undefined, ""].includes(fixed_deductions_ref.current[index].input.value)
						? 0
						: fixed_deductions_ref.current[index].input.value;
					const flexReduce = parseFloat(
						flexibleDeductionTypeList[index] === 0 ? (est_fee * flexAmount) / 100 : flexAmount
					);
					const fixReduce = parseFloat(fixedDeductionTypeList[index] === 0 ? (est_fee * fixAmount) / 100 : fixAmount);
					return {
						...fee,
						note: notes_ref.current[index].resizableTextArea.textArea.value,
						flexible_deduction: isNaN(flexReduce) ? 0 : flexReduce,
						fixed_deduction: isNaN(fixReduce) ? 0 : fixReduce,
					};
				}) ?? [];

			const param = {
				data: {
					class_id: tuitionPeriodInfo.class_id,
					from_date: fromDate,
					to_date: toDate,
					est_session_num: estSessionNum,
					tuition_fees: tuition_fees,
				},
				pID: tuitionPeriodInfo.id,
			};
			dispatch(actionUpdatePeriodTuion(param as any));
		}
	}

	function onChangeDedutionValue(index:number) {
		const amount = getTuitionFeeAmount(index)
		tuitionFeeList[index] = amount
		setTuitionFeeList([...tuitionFeeList])
		setEstTuitionFee(tuitionFeeList.reduce((amount, fee) => amount + fee, 0))
	}

	function onChangeDeductionAllValue() {
		const newFeeList = tuitionFeeList.map((_, index) => {
			return getTuitionFeeAmount(index)
		})
		setTuitionFeeList(newFeeList)
		setEstTuitionFee(newFeeList.reduce((amount, fee) => amount + fee, 0))
	}

	function getTuitionFeeAmount(index: number, sessionNum?: number): number {
		const lessionNumber = sessionNum ?? estSessionNum
		const est_fee = lessionNumber * get(classInfo, "fee_per_session", 0);
		let flexReduce
		let fixReduce
		if (isMounted.current) {
			const flexAmount = [null, undefined, ''].includes(flexible_deductions_ref.current[index].input.value) ? 0 : flexible_deductions_ref.current[index].input.value
			const fixAmount = [null, undefined, ''].includes(fixed_deductions_ref.current[index].input.value) ? 0 : fixed_deductions_ref.current[index].input.value
			flexReduce = parseFloat(
				flexibleDeductionTypeList[index] === 0
					? (est_fee * flexAmount) / 100
					: flexAmount
			);
			fixReduce = parseFloat(
				fixedDeductionTypeList[index] === 0
					? (est_fee * fixAmount) / 100
					: fixAmount
			);
			
			flexReduce = isNaN(flexReduce) ? 0 : flexReduce
			fixReduce = isNaN(fixReduce) ? 0 : fixReduce
		} else {
			flexReduce = parseFloat(get(tuitionFees[index], "flexible_deduction", "0"));
			fixReduce = parseFloat(get(tuitionFees[index], "fixed_deduction", "0"));
		}
		return (
			est_fee -
			parseFloat(get(tuitionFees[index], "residual", "0")) 
			- flexReduce 
			- fixReduce 
			+ parseFloat(get(tuitionFees[index], "debt", "0"))
		);
	}

	function handleChangePeriod(dates: any, dateString: [string, string]) {
		setFromDate(dateString[0]);
		setToDate(dateString[1]);
		dispatch(actionGetDayoffs({ from_date: dateString[0], to_date: dateString[1] }));
	}

	function handleChangeSetAllFixedDeductionSate(e: boolean) {
		setFixedDeductionAlState(e);
		setShowFixedDeductionAllModal(e);
		setApplyAllReduce(false)
	}

	function handleSetAllFlexDeduction() {
		flexible_deductions_ref.current.forEach((el: any) => (el.state.value = fixedDeductionAlAmount));
		flexibleDeductionTypeList.forEach((v, idx) => (flexibleDeductionTypeList[idx] = fixedDeductionAllType));
		handleChangeSetAllFixedDeductionSate(false);
		setFixedDeductionAlState(true);
		setFixedDeductionAlAmount("");
		setFlexibleDeductionTypeList([...flexibleDeductionTypeList]);
		setApplyAllReduce(true)
	}

	const columns = [
		{
			title: "Họ tên",
			dataIndex: "student_id",
			key: "student_id",
			render: function nameCol(student_id: number): JSX.Element {
				return <a>{studentList.find((st) => st.id === student_id)?.name}</a>;
			},
		},
		{
			title: (
				<>
					Học phí{" "}
					<Tooltip title="Học phí ước tính của kỳ này, dựa trên số buổi học ước tính kỳ này trừ đi số buổi dư kỳ trước">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			dataIndex: "tuition",
			key: "tuition",
			render: function tuitionCol(): JSX.Element {
				return <span>{numeral(feePerStudent).format("0,0")}</span>;
			},
		},
		// {
		// 	title: (
		// 		<>
		// 			Nợ kỳ trước{" "}
		// 			<Tooltip title="Có thể là nợ học phí do nhập học sau kỳ thu học phí">
		// 				<QuestionCircleOutlined style={{ color: "#f39c12" }} />
		// 			</Tooltip>
		// 		</>
		// 	),
		// 	key: "debt",
		// 	render: function amountCol(tuitiom: TuitionFeeType): JSX.Element {
		// 		return (
		// 			<>
		// 				<span style={{ color: "#e74c3c" }}>{numeral(tuitiom.debt).format("0,0")}</span>
		// 			</>
		// 		);
		// 	},
		// },
		{
			title: "Giảm trừ đặc biệt",
			key: "fixed_deduction",
			dataIndex: 'fixed_deduction',
			width: 180,
			render: function fixedDeductionCol(amount: string, st: TuitionFeeType, index: number): JSX.Element {
				return (
					<>
						<Input
							defaultValue={amount ?? 0}
							ref={(e) => (fixed_deductions_ref.current[index] = e)}
							onChange={()=> onChangeDedutionValue(index)}
							addonBefore={
								<Select
									value={fixedDeductionTypeList[index] ?? 0}
									style={{ width: 65 }}
									onChange={(e) => {
										fixedDeductionTypeList[index] = e;
										setFixedDeductionTypeList([...fixedDeductionTypeList]);
										onChangeDedutionValue(index);
									}}
								>
									<Option key={0} value={0}>
										%
									</Option>
									<Option key={1} value={1}>
										0.0
									</Option>
								</Select>
							}
						/>
					</>
				);
			},
		},
		{
			title: (
				<>
					Giảm trừ{" "}
					<Tooltip title="Giảm trừ học phí tuỳ chỉnh theo đợt">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
					<Checkbox
						checked={fixedDeductionAlState}
						onChange={(e) => handleChangeSetAllFixedDeductionSate(e.target.checked)}
					>
						<span style={{ fontSize: 12, color: "#7f8c8d" }}>Áp dụng tất cả</span>
					</Checkbox>
					<Modal
						title="Điển giảm trừ theo đợt cho tất cả học sinh"
						visible={showFixedDeductionAllModal}
						onOk={handleSetAllFlexDeduction}
						onCancel={() => {
							setShowFixedDeductionAllModal(false);
							handleChangeSetAllFixedDeductionSate(false);
						}}
					>
						<Input
							placeholder="Số tiền giảm trừ"
							value={fixedDeductionAlAmount}
							onChange={(e) => setFixedDeductionAlAmount(e.target.value)}
							addonBefore={
								<Select
									value={fixedDeductionAllType}
									style={{ width: 65 }}
									onChange={(v) => setFixedDeductionAllType(v)}
								>
									<Option key={0} value={0}>
										%
									</Option>
									<Option key={1} value={1}>
										0.0
									</Option>
								</Select>
							}
						/>
					</Modal>
				</>
			),
			dataIndex: "flexible_deduction",
			key: "flexible_deduction",
			width: 180,
			render: function deductionCol(amount: string, st: TuitionFeeType, index: number): JSX.Element {
				return (
					<>
						<Input
							defaultValue={amount ?? 0}
							onChange={()=> onChangeDedutionValue(index)}
							ref={(e) => (flexible_deductions_ref.current[index] = e)}
							addonBefore={
								<Select 
									value={flexibleDeductionTypeList[index]}
									style={{ width: 65 }}
									onChange={(e) => {
										flexibleDeductionTypeList[index] = e;
										setFlexibleDeductionTypeList([...flexibleDeductionTypeList]);
										onChangeDedutionValue(index);
									}}
								>
									<Option key={0} value={0}>
										%
									</Option>
									<Option key={1} value={1}>
										0.0
									</Option>
								</Select>
							}
						/>
					</>
				);
			},
		},
		{
			title: "Thành tiền",
			key: "residual",
			render: function residualCol(_: string, feeItem: TuitionFeeType, index: number): JSX.Element {
				return (
					<>
						<strong style={{ color: "#2980b9" }}>
							{
								numeral(tuitionFeeList[index]).format("0,0")
								// numeral(getTuitionFeeAmount(index)).format("0,0")
								// numeral(feePerStudent + +feeItem.debt - +feeItem.fixed_deduction - +feeItem.flexible_deduction).format(
								// 	"0,0"
								// )
							}
						</strong>
					</>
				);
			},
		},
		{
			title: "Ghi chú",
			key: "note",
			dataIndex: "note",
			width: 180,
			render: function fixedDeductionCol(note: string, st: TuitionFeeType, index: number): JSX.Element {
				return (
					<>
						<Input.TextArea defaultValue={note ?? ''} ref={(e) => (notes_ref.current[index] = e)} />
					</>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header"
				onBack={() => history.push("/payments/tuition")}
				title="Chỉnh sửa bảng học phí"
				style={{ backgroundColor: "white" }}
				extra={[
					<Button key="2" icon={<CloseOutlined />} onClick={() => window.history.back()}>
						Hủy bỏ
					</Button>,
					<>
					<Button type="primary" key="1" icon={<CheckCircleOutlined />} onClick={() => setShowConfirmSubmit(true)}>
						Hoàn tất
					</Button>
					<Modal
						visible={showConfirmSubmit}
						title="Cập nhật bảng học phí"
						onCancel={()=> setShowConfirmSubmit(false)}
						footer={[
							<Button key="back" onClick={() => setShowConfirmSubmit(false)}>
								Huỷ bỏ
							</Button>,
							<Button
								key="submit"
								type="primary"
								loading={updatePeriodTuitionState === "loading" ? true : false}
								onClick={() => handleUpdateTuition()}
							>
								Hoàn tất
							</Button>,
						]}
					>
						Thông tin chu kỳ học phí và danh sách học phí của tất cả học sinh sẽ được lưu vào hệ thống!
					</Modal>
				</>,
				]}
			>
				<Descriptions size="default" column={2} layout="horizontal" bordered>
					<Descriptions.Item label="Lớp học">{get(tuitionPeriodInfo, "class.name", "")}</Descriptions.Item>
					<Descriptions.Item label="Học phí/buổi">
						<strong>{formatCurrency(get(tuitionPeriodInfo, "class.fee_per_session", ""))}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Chu kỳ">
						<RangePicker
							defaultValue={[
								moment(get(tuitionPeriodInfo, "from_date", "")),
								moment(get(tuitionPeriodInfo, "to_date", "")),
							]}
							ranges={{
								"1 Tháng": [moment().startOf("month"), moment().endOf("month")],
								"2 Tháng": [moment().startOf("month"), moment().add(1, "month").endOf("month")],
								"3 Tháng": [moment().startOf("month"), moment().add(2, "months").endOf("month")],
							}}
							onChange={handleChangePeriod}
						/>
					</Descriptions.Item>
					<Descriptions.Item
						label={
							<>
								Số buổi ước tính{" "}
								<Tooltip title="Số buổi học phí ước tính dựa theo lịch học của lớp và khoảng thời gian của chu kỳ học phí">
									<QuestionCircleOutlined style={{ color: "#f39c12" }} />
								</Tooltip>
							</>
						}
					>
						<strong>{estSessionNum}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Học phí ước tính">
						<strong>
							{formatCurrency(estTuitionFee)}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item
						label={
							<>
								Số buổi dư kỳ trước{" "}
								<Tooltip title="Dựa trên số buổi học ước tính và số buổi học thực tế của kỳ trước">
									<QuestionCircleOutlined style={{ color: "#f39c12" }} />
								</Tooltip>
							</>
						}
					>
						<strong style={{ color: "#e74c3c" }}>{residualSessionNum}</strong>
					</Descriptions.Item>
				</Descriptions>
			</PageHeader>
			<strong style={{ marginTop: 40, padding: 20 }}>Học phí mỗi học sinh</strong>
			<Table
				rowKey="id"
				bordered
				style={{ padding: 20 }}
				dataSource={get(tuitionPeriodInfo, "tuition_fees", [])}
				columns={columns}
				loading={getClassInfoStatus === "loading"}
				pagination={{ defaultPageSize: 100 }}
			/>
		</Layout.Content>
	);
}
