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
import { QuestionCircleOutlined, CheckCircleOutlined, FileOutlined } from "@ant-design/icons";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClass, actionGetClasses, actionSetClassStateNull, classSlice } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionSetStudentsStateNull } from "store/students/slice";
import { StudentType } from "interface";
import { actionGetDayoffs } from "store/settings/dayoff";
import { countSameDates, getDatesInRange } from "utils/dateUltils";
import { actionAddPeriodTuion, actionSetAddPeriodtuitionStateIdle } from "store/tuition/periodslice";

const { Option } = Select;
const { RangePicker } = DatePicker;
// const dateFormat = 'YYYY/MM/DD';

export interface TuitionFeeType {
	student_id: number;
	residual: string;
	fixed_deduction: string;
	flexible_deduction: string;
	debt: string;
	note: string;
	from_date: string;
	to_date: string;
	// amount:string;
}

export default function AddTuition(): JSX.Element {
	const history = useHistory();
	const dispatch = useAppDispatch();
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [estSessionNum, setEstSessionNum] = useState(0);
	const [residualSessionNum, setrResidualSessionNum] = useState(0);
	const [tuitionFees, setTuitionFees] = useState<TuitionFeeType[]>([]);
	const [showFixedDeductionAllModal, setShowFixedDeductionAllModal] = useState(false);
	const [fixedDeductionAlState, setFixedDeductionAlState] = useState(false);
	const [fixedDeductionAlAmount, setFixedDeductionAlAmount] = useState("");
	const [fixedDeductionAllType, setFixedDeductionAllType] = useState(0);
	const [fixedDeductionTypeList, setFixedDeductionTypeList] = useState<number[]>([]);
	const [flexibleDeductionTypeList, setFlexibleDeductionTypeList] = useState<number[]>([]);
	const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	// const students = useSelector((state: RootState) => state.studentReducer.students);
	const getClassInfoStatus = useSelector((state: RootState) => state.classReducer.getClassStatus);
	const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
	const addPeriodTuitionState = useSelector((state:RootState) => state.periodTuitionReducer.addPeriodTuitionStatus);

	const fixed_deductions_ref = useRef<any>([]);
	const flexible_deductions_ref = useRef<any>([]);
	const notes_ref = useRef<any>([]);

	// UI Logic
	// initialize 
	useEffect(() => {
		dispatch(actionGetClasses({}));
		dispatch(actionSetClassStateNull());
		dispatch(actionSetStudentsStateNull());
	}, [dispatch]);

	// update session_num (est, act, dayyoff)
	useEffect(() => {
		if (classInfo && dayoffs) {

			setrResidualSessionNum(
				get(classInfo, "period_tuitions", []).length > 0
					? get(classInfo, "period_tuitions", [])[0].est_session_num - get(classInfo, "act_session_num", 0)
					: 0
			);
			const dayoffList: string[] = [];
			let dateListInRang: string[] = [];
			dayoffs.data?.forEach((day) => {
				dayoffList.push(day.from_date);
			})
			if (classInfo.schedule.length > 0) {
				let count = 0;
				for (let index = 0; index < classInfo.schedule.length; index++) {
					const day = classInfo.schedule[index];
					dateListInRang = getDatesInRange(fromDate, toDate, day);
					count += dateListInRang.length - countSameDates(dateListInRang, dayoffList);
				}
				setEstSessionNum(count);
			}

			if (classInfo.active_period_tuition) {
				const num = get(classInfo, "active_period_tuition.est_session_num") - get(classInfo, "active_period_tuition.lessons", []).length;
				setrResidualSessionNum(num);
			} else {
				setrResidualSessionNum(0);
			}


		}
	}, [classInfo, dayoffs, fromDate, toDate]);

	// update tuition fee list
	useEffect(() => {
		if (classInfo && classInfo.students) {
			const fee_per_session = get(classInfo, "fee_per_session", 0);
			fixed_deductions_ref.current = [];
			flexible_deductions_ref.current = [];
			notes_ref.current = [];
			const tuitionFeeList: TuitionFeeType[] = [];

			classInfo.students.forEach(st => {
				let special_residual_session_num = 0;
				// check if student entered after period tuition 
				if (classInfo.active_period_tuition) {
					const tuitionFee = get(classInfo.active_period_tuition, "tuition_fees", []).find((el: { id: number, student_id: number }) => el.student_id === st.id);
					if (tuitionFee && tuitionFee.from_date) {
						get(classInfo.active_period_tuition, "lessons", []).forEach(ls => {
							if (moment(ls.date).isSameOrBefore(tuitionFee.from_date)) special_residual_session_num++;
						})
					}
				}
				// push tuition fee 
				tuitionFeeList.push({
					student_id: st.id,
					fixed_deduction: "0",
					flexible_deduction: "0",
					residual: `${special_residual_session_num == 0 ? residualSessionNum * fee_per_session : special_residual_session_num * fee_per_session}`,
					debt: "0",
					note: "",
					from_date: "",
					to_date: "",
				})
			});
			setTuitionFees(tuitionFeeList);
			setFixedDeductionTypeList(Array(classInfo.students.length).fill(0));
			setFlexibleDeductionTypeList(Array(classInfo.students.length).fill(0));
		}
	}, [classInfo, residualSessionNum, estSessionNum])


	//handle add period tuition state
	useEffect(()=>{
		if(addPeriodTuitionState === "success"){
			setShowConfirmSubmit(false);
			history.push("/payments/tuition");

		}
	},[dispatch, addPeriodTuitionState, history])

	function getTuitionFeeAmount(index: number): number {
		const est_fee = estSessionNum * get(classInfo, "fee_per_session", 0);
		return est_fee - parseFloat(get(tuitionFees[index], "residual", '0'))
			- parseFloat(get(tuitionFees[index], "flexible_deduction", '0'))
			- parseFloat(get(tuitionFees[index], "flexible_deduction", '0'))
			+ parseFloat(get(tuitionFees[index], "debt", '0'))
	}


	// handle change daterange
	function handleChangePeriod(dates: any, dateString: [string, string]) {
		setFromDate(dateString[0]);
		setToDate(dateString[1]);
		dispatch(actionGetDayoffs({ from_date: dateString[0], to_date: dateString[1] }));
		// dispatch(actionGetDayoffs({}))
	}

	function handleChangeClass(classID: number) {
		// dispatch(actionSetStudentsStateNull());
		setEstSessionNum(0);
		setrResidualSessionNum(0);
		setFixedDeductionAlState(false);
		if (classID > 0) {
			dispatch(actionGetClass({ class_id: classID, params: { active_periodinfo: true, students: true } }));
		} else dispatch(actionSetClassStateNull());
	}

	function handleChangeSetAllFixedDeductionSate(e: boolean) {
		setFixedDeductionAlState(e);
		setShowFixedDeductionAllModal(e);
	}

	function handleSetAllFixedDeduction() {
		flexible_deductions_ref.current.forEach((el: any, index: number) => {
			(el.state.value = fixedDeductionAlAmount)
			let val = 0;
			if (el.state.value === '') val = 0;
			else val = parseInt(el.state.value);
			const rd = fixedDeductionAllType == 0 ? estSessionNum * get(classInfo, "fee_per_session", 0) * val / 100 : val
			tuitionFees[index].flexible_deduction = String(rd);
		});
		setTuitionFees([...tuitionFees]);
		fixedDeductionTypeList.forEach((v, idx) => (fixedDeductionTypeList[idx] = fixedDeductionAllType));
		console.log(fixedDeductionTypeList);
		handleChangeSetAllFixedDeductionSate(false);
		setFixedDeductionAlState(true);
		setFixedDeductionAlAmount("");
		setFixedDeductionTypeList([...fixedDeductionTypeList]);
	}

	function handleOnChangeFlexibleDeduction(e: any, index: number) {
		const fee_per_session = get(classInfo, "fee_per_session", 0);
		let val = 0;
		if (e.target.value === '') val = 0;
		else val = parseInt(e.target.value);
		const rd = fixedDeductionTypeList[index] == 0 ? estSessionNum * fee_per_session * val / 100 : val
		tuitionFees[index].flexible_deduction = String(rd);
		setTuitionFees([...tuitionFees]);
	}

	//Submit 
	function handleCreateTuition(draft:boolean) {
		// if (classInfo?.students) {
		// 	classInfo.students?.map((st, idx) => ({
		// 		// Duyệt qua mảng student để điền thông tin tuition_fees[0] cho từng student.
		// 		// Thông tin lấy như dưới đây nhéconsole.log(fixed_deductions_ref.current[idx].input.value);
		// 		// console.log(fixedDeductionTypeList[idx])
		// 		// console.log(flexible_deductions_ref.current[idx].input.value);
		// 		// console.log(flexibleDeductionTypeList[idx])
		// 		// console.log(notes_ref.current[idx].resizableTextArea.textArea.value);

		// 	}))
		// }
		if (classInfo) {
			const payload = {
				class_id: classInfo.id,
				est_session_num: estSessionNum,
				from_date: fromDate,
				to_date: toDate,
				tuition_fees: tuitionFees,
				draft
			}
			// console.log(payload);
			dispatch(actionSetAddPeriodtuitionStateIdle());
			dispatch(actionAddPeriodTuion(payload))
		}

	}

	//UI render
	const columns = [
		{
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function nameCol(name: string): JSX.Element {
				return <a>{name}</a>;
			},
		},
		{
			title: (
				<>
					Học phí{" "}
					<Tooltip title="Học phí ước tính của kỳ này">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			dataIndex: "tuition",
			key: "tuition",
			render: function tuitionCol(): JSX.Element {
				return <span>{numeral(estSessionNum * get(classInfo, "fee_per_session", 0)).format("0,0")}</span>;
			},
		},
		{
			title: (
				<>
					Dư kỳ trước{" "}
					<Tooltip title="Số buổi dư kỳ trước bằng số buổi ước tính kỳ trước trừ đi số buổi học thực tế">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			key: "debt",
			render: function debtCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<span style={{ color: "#e74c3c" }}>{numeral(tuitionFees[index]?.residual).format("0,0")}</span>
					</>
				);
			},
		},
		/*
		{
			title: "Giảm trừ cố định",
			key: "fixed_deduction",
			width: 180,
			render: function fixedDeductionCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<Input
							defaultValue={tuitionFees[index]?.fixed_deduction}
							addonBefore={
								<Select
									value={flexibleDeductionTypeList[index] ?? 0}
									style={{ width: 65 }}
									onChange={(e) => {
										flexibleDeductionTypeList[index] = e;
										setFlexibleDeductionTypeList([...flexibleDeductionTypeList]);
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
							ref={(e) => (fixed_deductions_ref.current[index] = e)}
						/>
					</>
				);
			},
		},
		*/
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
						onOk={handleSetAllFixedDeduction}
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
			dataIndex: "tuition",
			key: "deduction",
			width: 180,
			render: function deductionCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<Input
							defaultValue={tuitionFees[index]?.flexible_deduction}
							ref={(e) => flexible_deductions_ref.current[index] = e}
							onChange={(e) => handleOnChangeFlexibleDeduction(e, index)}
							addonBefore={
								<Select
									value={fixedDeductionTypeList[index] ?? 0}
									style={{ width: 65 }}
									onChange={(e) => {
										fixedDeductionTypeList[index] = e;
										setFixedDeductionTypeList([...fixedDeductionTypeList]);
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
			render: function residualCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<strong style={{ color: "#2980b9" }}>{numeral(getTuitionFeeAmount(index)).format("0,0")}</strong>
					</>
				);
			},
		},
		{
			title: "Ghi chú",
			key: "note",
			width: 180,
			render: function fixedDeductionCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<Input.TextArea defaultValue={tuitionFees[index]?.note} ref={(e) => (notes_ref.current[index] = e)} />
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
				title="Lập bảng học phí"
				subTitle={get(classInfo, "name")}
				style={{ backgroundColor: "white" }}
				extra={[
					<Button key="2" icon={<FileOutlined />}>
						Lưu nháp
					</Button>,
					<>
						<Button type="primary" key="1" icon={<CheckCircleOutlined />} onClick={()=>setShowConfirmSubmit(true)}>
							Hoàn tất
						</Button>
						<Modal
							visible={showConfirmSubmit}
							title="Lưu bảng học phí"
							footer={[
								<Button key="back" onClick={() => setShowConfirmSubmit(false)}>
									Huỷ bỏ
								</Button>,
								<Button key="submit" type="primary" loading={addPeriodTuitionState === 'loading' ? true : false} onClick={()=>handleCreateTuition(false)}>
									Ok
								</Button>
							]}
						>
							Thông tin chu kỳ học phí và danh sách học phí của tất cả học sinh sẽ được lưu vào hệ thống!
						</Modal>
					</>
					,
				]}
			>
				<Descriptions size="default" column={2} layout="horizontal" bordered>
					<Descriptions.Item label="Lớp học">
						<Select defaultValue={0} style={{ width: 280 }} onChange={handleChangeClass}>
							<Option key={0} value={0}>
								Chọn lớp học...
							</Option>
							{get(classesList, "data", []).map((cl: { id: number; name: string }) => {
								return (
									<Option key={cl.id} value={cl.id}>
										{cl.name}
									</Option>
								);
							})}
						</Select>
					</Descriptions.Item>
					<Descriptions.Item label="Học phí/buổi">
						<strong>{numeral(get(classInfo, "fee_per_session", 0)).format("0,0")}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Chu kỳ">
						<RangePicker
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
								<Tooltip title="Số buổi học phí ước tính dựa theo lịch học của lớp và khoảng thời gian của chu kỳ học phí, không bao gồm ngày nghỉ lễ">
									<QuestionCircleOutlined style={{ color: "#f39c12" }} />
								</Tooltip>
							</>
						}
					>
						<strong>{estSessionNum}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Học phí ước tính">
						<strong>{numeral(get(classInfo, "fee_per_session", 0) * (estSessionNum - residualSessionNum)).format("0,0")}</strong>
						{(estSessionNum > 0 || residualSessionNum > 0) ? <span> ({estSessionNum - residualSessionNum} buổi)</span> : ""}
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
				dataSource={get(classInfo, "students", [])}
				columns={columns}
				loading={getClassInfoStatus === "loading"}
				pagination={{ defaultPageSize: 100 }}
			/>
		</Layout.Content>
	);
}
