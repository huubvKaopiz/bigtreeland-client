import { CheckCircleOutlined, FileOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
	Alert, Button, Checkbox, DatePicker, Descriptions, Input, InputNumber, Layout, Modal, PageHeader, Select,
	Spin,
	Table, Tag, Tooltip
} from "antd";
import useDebouncedCallback from "hooks/useDebounceCallback";
import { DayoffType, StudentType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClass, actionGetClasses, actionSetClassStateNull } from "store/classes/slice";
import { actionGetDayoffs } from "store/settings/dayoff";
import { RootState, useAppDispatch } from "store/store";
import { actionSetStudentsStateNull } from "store/students/slice";
import {
	actionAddPeriodTuion,
	AddPeriodTuionParms
} from "store/tuition/periodslice";
import { getDatesInRange, getSameDates } from "utils/dateUltils";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;


export interface TuitionFeeType {
	id?:number;
	student_id: number;
	residual?: string;
	fixed_deduction: string;
	flexible_deduction: string;
	note: string;
	from_date?: string;
	to_date?: string;
	status: number;
	dayoffs: string[];
}

export default function CreateTuitionPeriod(): JSX.Element {
	const history = useHistory();
	const dispatch = useAppDispatch();

	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [search, setSearch] = useState("");
	const [estSessionNum, setEstSessionNum] = useState(0);
	const [residualSessionNum, setrResidualSessionNum] = useState(0);
	const [tuitionFees, setTuitionFees] = useState<TuitionFeeType[]>([]);
	const [showFixedDeductionAllModal, setShowFixedDeductionAllModal] = useState(false);
	const [fixedDeductionAlState, setFixedDeductionAlState] = useState(false);
	const [fixedDeductionAlAmount, setFixedDeductionAlAmount] = useState("");
	const [fixedDeductionAllType, setFixedDeductionAllType] = useState(0);
	const [fixedDeductionTypeList, setFixedDeductionTypeList] = useState<number[]>([]);
	const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
	const [dayoffsInPeriod, setDayoffsInPeriod] = useState<string[]>([]);
	const [periodDateRangValid, setPeriodDateRangValid] = useState(true);

	// aplication state
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const searchClassState = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	const getClassInfoStatus = useSelector((state: RootState) => state.classReducer.getClassStatus);
	const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
	const addPeriodTuitionState = useSelector((state: RootState) => state.periodTuitionReducer.addPeriodTuitionStatus);

	const fixed_deductions_ref = useRef<any>([]);
	const flexible_deductions_ref = useRef<any>([]);
	const notes_ref = useRef<any>([]);

	const searchClass = useDebouncedCallback((searchParam) => {
		setSearch(searchParam)
		dispatch(actionGetClasses({ search }))
	}, 500)

	//UI Logic	
	// initialize
	useEffect(() => {
		dispatch(actionGetClasses({ search }));
		dispatch(actionSetClassStateNull());
		dispatch(actionSetStudentsStateNull());
	}, [dispatch]);

	// update session_num (est, act, dayyoff)
	useEffect(() => {
		if (classInfo && dayoffs) {
			//get list of dayoffs in period date_range
			const dayoffList: string[] = [];
			let dateListInRang: string[] = [];
			let dayoff_in_period: string[] = [];
			get(dayoffs, "data", []).forEach((day: DayoffType) => {
				dayoffList.push(day.from_date);
			});
			// base on class's schedule and list of dayoffs -> calc est_session_num
			if (classInfo.schedule.length > 0) {
				let count = 0;
				for (let index = 0; index < classInfo.schedule.length; index++) {
					const day = classInfo.schedule[index];
					dateListInRang = getDatesInRange(fromDate, toDate, day);
					count += dateListInRang.length;
					dayoff_in_period = dayoff_in_period.concat(getSameDates(dateListInRang, dayoffList))
				}
				count -= dayoff_in_period.length;
				console.log(dayoff_in_period)
				setDayoffsInPeriod(dayoff_in_period)
				setEstSessionNum(count);
			}
			// calc ResidualSessionNum
			if (classInfo.active_period_tuition) {
				const num =
					get(classInfo, "active_period_tuition.est_session_num") -
					get(classInfo, "active_period_tuition.lessons", []).length;
				setrResidualSessionNum(num);
				if (moment(classInfo.active_period_tuition.to_date).isSameOrAfter(moment(fromDate))) setPeriodDateRangValid(false);
				else setPeriodDateRangValid(true)

			} else {
				setrResidualSessionNum(0);
			}
		}

	}, [classInfo, dayoffs, fromDate, toDate]);

	// update list of tuition_fees
	useEffect(() => {
		if (classInfo && classInfo.students) {

			fixed_deductions_ref.current = [];
			flexible_deductions_ref.current = [];
			notes_ref.current = [];
			const tuitionFeeList: TuitionFeeType[] = [];

			classInfo.students.forEach((st) => {
				const fee_per_session = get(classInfo, "active_period_tuition.fee_per_session", 0);
				let special_residual_session_num = 0;
				let flexible_deduction_percent = 0;
				// check if student entered after period_tution from_date
				if (classInfo.active_period_tuition) {
					const tuitionFee = get(classInfo.active_period_tuition, "tuition_fees", []).find(
						(el: { id: number; student_id: number }) => el.student_id === st.id
					);
					if (tuitionFee) {
						if (tuitionFee.from_date) {
							let act_session_num = 0;
							get(classInfo.active_period_tuition, "lessons", []).forEach((ls) => {
								if (moment(ls.date).isSameOrAfter(moment(tuitionFee.from_date),"day")) act_session_num++;
							});
							special_residual_session_num = get(tuitionFee, "est_session_num", 0) - act_session_num;
							flexible_deduction_percent = 100 * +get(tuitionFee, "flexible_deduction", 0) / (get(tuitionFee, "est_session_num", 0) * fee_per_session)
							console.log(st?.name,"est:",get(tuitionFee, "est_session_num", 0),"act:",act_session_num, "percent:",flexible_deduction_percent)
						} else {
							flexible_deduction_percent = 100 * +get(tuitionFee, "flexible_deduction", 0) / (get(classInfo, "active_period_tuition.est_session_num", 0) * fee_per_session)
						}
					} else special_residual_session_num = -1;
				}

				const finalResidual = special_residual_session_num === -1 
				? 0 : special_residual_session_num === 0
					? residualSessionNum * fee_per_session - (residualSessionNum * fee_per_session * flexible_deduction_percent / 100)
					: special_residual_session_num * fee_per_session - (special_residual_session_num * fee_per_session * flexible_deduction_percent / 100)
				// push tuition_fee
				tuitionFeeList.push({
					student_id: st.id,
					fixed_deduction: "0",
					flexible_deduction: "0",
					residual: `${finalResidual}`,
					// debt: "0",
					note: "",
					from_date: "",
					to_date: "",
					status: 0,
					dayoffs: []
				});
			});
			setTuitionFees(tuitionFeeList);
			setFixedDeductionTypeList(Array(classInfo.students.length).fill(0));
		}
	}, [classInfo, residualSessionNum, estSessionNum]);

	useEffect(() => {
		if (addPeriodTuitionState === 'success') {
			setShowConfirmSubmit(false);
			confirm({
				title: "Chuy???n t???i b???ng danh s??ch chu k??? h???c ph??!",
				icon: <CheckCircleOutlined />,
				onOk() {
					history.push("/payments/tuition")
				}
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addPeriodTuitionState])


	function getTuitionFeeAmount(index: number): number {
		const est_fee = estSessionNum * get(classInfo, "fee_per_session", 0);
		return (
			est_fee -
			parseFloat(get(tuitionFees[index], "residual", "0")) -
			parseFloat(get(tuitionFees[index], "flexible_deduction", "0")) -
			parseFloat(get(tuitionFees[index], "fixed_deduction", "0")) +
			parseFloat(get(tuitionFees[index], "debt", "0"))
		);
	}

	// handle daterange change
	function handleChangePeriod(dates: any, dateString: [string, string]) {
		setFromDate(dateString[0]);
		setToDate(dateString[1]);
		if (get(classInfo, "active_period_tuition.to_date", "") != "") {
			if (moment(get(classInfo, "active_period_tuition.to_date", "")).isSameOrAfter(moment(dateString[0]))) setPeriodDateRangValid(false);
			else setPeriodDateRangValid(true);
		} else setPeriodDateRangValid(true);
		dispatch(actionGetDayoffs({ from_date: dateString[0], to_date: dateString[1] }));
	}

	//handle class change, get classInfo with current active tuition_period
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
			el.state.value = fixedDeductionAlAmount;
			let val = 0;
			if (el.state.value === "") val = 0;
			else val = parseInt(el.state.value);
			const rd = fixedDeductionAllType == 0 ? (estSessionNum * get(classInfo, "fee_per_session", 0) * val) / 100 : val;
			tuitionFees[index].flexible_deduction = String(rd);
		});
		setTuitionFees([...tuitionFees]);
		fixedDeductionTypeList.forEach((v, idx) => (fixedDeductionTypeList[idx] = fixedDeductionAllType));
		handleChangeSetAllFixedDeductionSate(false);
		setFixedDeductionAlState(true);
		setFixedDeductionAlAmount("");
		setFixedDeductionTypeList([...fixedDeductionTypeList]);
	}

	function handleOnChangeFlexibleDeduction(e: any, index: number) {
		const fee_per_session = get(classInfo, "fee_per_session", 0);
		let val = 0;
		if (e.target.value === "") val = 0;
		else val = parseInt(e.target.value);
		const rd = fixedDeductionTypeList[index] === 0 ? (estSessionNum * fee_per_session * val) / 100 : val;
		tuitionFees[index].flexible_deduction = String(rd);
		setTuitionFees([...tuitionFees]);
	}

	function handleOnChangeFixedDeduction(e: any, index: number) {
		tuitionFees[index].fixed_deduction = String(e);
		setTuitionFees([...tuitionFees]);
	}

	//Submit
	function handleCreatePeriodTuition(draft: boolean) {
		if (classInfo) {
			const payload = {
				class_id: classInfo.id,
				est_session_num: estSessionNum,
				fee_per_session: classInfo.fee_per_session,
				from_date: fromDate,
				to_date: toDate,
				tuition_fees: tuitionFees,
				draft,
				dayoffs: dayoffsInPeriod,
			};
			dispatch(actionAddPeriodTuion(payload as AddPeriodTuionParms));
		}
	}

	//UI render
	const columns = [
		{
			title: "H??? t??n",
			dataIndex: "name",
			key: "name",
			width: 180,
			fixed: true,
			render: function nameCol(name: string): JSX.Element {
				return <a>{name}</a>;
			},
		},
		{
			title: (
				<>
					H???c ph??{" "}
					<Tooltip title="H???c ph?? ?????c t??nh c???a k??? n??y">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			dataIndex: "tuition",
			key: "tuition",
			width: 160,
			render: function tuitionCol(): JSX.Element {
				return <span>{numeral(estSessionNum * get(classInfo, "fee_per_session", 0)).format("0,0")}</span>;
			},
		},
		{
			title: (
				<>
					D?? k??? tr?????c{" "}
					<Tooltip title="S??? bu???i d?? k??? tr?????c b???ng s??? bu???i ?????c t??nh k??? tr?????c tr??? ??i s??? bu???i h???c th???c t???">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			key: "residual",
			width: 160,
			render: function debtCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<span style={{ color: "#e74c3c" }}>{numeral(tuitionFees[index]?.residual).format("0,0")}</span>
					</>
				);
			},
		},

		{
			title: "Gi???m tr??? ?????c bi???t",
			key: "fixed_deduction",
			width: 200,
			render: function fixedDeductionCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<InputNumber
							defaultValue={tuitionFees[index]?.fixed_deduction}
							formatter={(value) => numeral(value).format("0,0")}
							ref={(e) => (fixed_deductions_ref.current[index] = e)}
							style={{ width: "90%", color: "#c0392b" }}
							onChange={(e) => handleOnChangeFixedDeduction(e, index)}
						/>
					</>
				);
			},
		},
		{
			title: (
				<>
					Gi???m tr???{" "}
					<Tooltip title="Gi???m tr??? h???c ph?? tu??? ch???nh theo ?????t">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
					<Checkbox
						checked={fixedDeductionAlState}
						onChange={(e) => handleChangeSetAllFixedDeductionSate(e.target.checked)}
					>
						<span style={{ fontSize: 12, color: "#7f8c8d" }}>??p d???ng t???t c???</span>
					</Checkbox>
					<Modal
						title="??i???n gi???m tr??? theo ?????t cho t???t c??? h???c sinh"
						visible={showFixedDeductionAllModal}
						onOk={handleSetAllFixedDeduction}
						onCancel={() => {
							setShowFixedDeductionAllModal(false);
							handleChangeSetAllFixedDeductionSate(false);
						}}
					>
						<Input
							placeholder="S??? ti???n gi???m tr???"
							value={fixedDeductionAlAmount}
							onChange={(e) => setFixedDeductionAlAmount(e.target.value)}
							addonBefore={
								<Select
									value={fixedDeductionAllType}
									style={{ width: 60 }}
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
							ref={(e) => (flexible_deductions_ref.current[index] = e)}
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
			title: "Th??nh ti???n",
			key: "residual",
			width: 160,
			fixed: true,
			render: function residualCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<strong style={{ color: "#2980b9" }}>{numeral(getTuitionFeeAmount(index)).format("0,0")}</strong>
					</>
				);
			},
		},
		{
			title: "Ghi ch??",
			key: "note",
			width: 180,
			fixed: true,
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
				title="L???p b???ng h???c ph??"
				subTitle={get(classInfo, "name")}
				style={{ backgroundColor: "white" }}
				extra={[
					<Button key="2" icon={<FileOutlined />} onClick={() => handleCreatePeriodTuition(true)} disabled={!periodDateRangValid}>
						L??u nh??p
					</Button>,
					<>
						<Button type="primary" key="1" icon={<CheckCircleOutlined />} onClick={() => setShowConfirmSubmit(true)} disabled={!periodDateRangValid}>
							Ho??n t???t
						</Button>
						<Modal
							visible={showConfirmSubmit}
							title="L??u b???ng h???c ph??"
							footer={[
								<Button key="back" onClick={() => setShowConfirmSubmit(false)}>
									Hu??? b???
								</Button>,
								<Button
									key="submit"
									type="primary"
									loading={addPeriodTuitionState === "loading" ? true : false}
									onClick={() => handleCreatePeriodTuition(false)}
								>
									Ok
								</Button>,
							]}
						>
							Th??ng tin chu k??? h???c ph?? v?? danh s??ch h???c ph?? c???a t???t c??? h???c sinh s??? ???????c l??u v??o h??? th???ng!
						</Modal>
					</>,
				]}
			>
				<Descriptions size="default" column={2} layout="horizontal" bordered>
					<Descriptions.Item label="L???p h???c">
						<Select
							defaultValue={0}
							style={{ width: 280 }}
							onChange={handleChangeClass}
							showSearch
							onSearch={(e) => searchClass(e)}
							filterOption={false}
							notFoundContent={searchClassState === "loading" ? <Spin size="small" /> : null}
						>
							<Option key={0} value={0}>
								Ch???n l???p h???c...
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
					<Descriptions.Item label="H???c ph??/bu???i">
						<strong>{numeral(get(classInfo, "fee_per_session", 0)).format("0,0")}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Chu k???">
						<RangePicker
							ranges={{
								"1 Th??ng": [moment().startOf("month"), moment().endOf("month")],
								"2 Th??ng": [moment().startOf("month"), moment().add(1, "month").endOf("month")],
								"3 Th??ng": [moment().startOf("month"), moment().add(2, "months").endOf("month")],
							}}
							onChange={handleChangePeriod}
						/>
					</Descriptions.Item>
					<Descriptions.Item
						label={
							<>
								S??? bu???i ?????c t??nh{" "}
								<Tooltip title="S??? bu???i h???c ph?? ?????c t??nh d???a theo l???ch h???c c???a l???p v?? kho???ng th???i gian c???a chu k??? h???c ph??, kh??ng bao g???m ng??y ngh??? l???">
									<QuestionCircleOutlined style={{ color: "#f39c12" }} />
								</Tooltip>
							</>
						}
					>
						<strong>{estSessionNum}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="H???c ph?? ?????c t??nh">
						<strong>
							{numeral(get(classInfo, "fee_per_session", 0) * (estSessionNum - residualSessionNum)).format("0,0")}
						</strong>
						{estSessionNum > 0 || residualSessionNum > 0 ? (
							<span> ({estSessionNum - residualSessionNum} bu???i)</span>
						) : (
							""
						)}
					</Descriptions.Item>
					<Descriptions.Item
						label={
							<>
								S??? bu???i d?? k??? tr?????c{" "}
								<Tooltip title="D???a tr??n s??? bu???i h???c ?????c t??nh v?? s??? bu???i h???c th???c t??? c???a k??? tr?????c">
									<QuestionCircleOutlined style={{ color: "#f39c12" }} />
								</Tooltip>
							</>
						}
					>
						<strong style={{ color: "#e74c3c" }}>{residualSessionNum}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="C??c ng??y ngh??? l???">
						{
							dayoffsInPeriod.map((day: string) => <Tag key={day} color="red">{moment(day).format("DD-MM-YYYY")}</Tag>)
						}
					</Descriptions.Item>
				</Descriptions>
				{
					periodDateRangValid === false ?
						<Alert
							style={{ marginTop: 20 }}
							message="Sai kho???ng th???i gian t??nh h???c ph??"
							description={`Ng??y b???t ?????u t??nh h???c ph?? ph???i sau ng??y ${get(classInfo, "active_period_tuition.to_date", "")}`}
							type="error"
						/>
						: ""
				}
			</PageHeader>

			<strong style={{ marginTop: 40, padding: 20 }}>H???c ph?? m???i h???c sinh</strong>
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
