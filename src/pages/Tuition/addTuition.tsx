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
import { actionGetClass, actionGetClasses, actionSetClassStateNull } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents, actionSetStudentsStateNull } from "store/students/slice";
import { countDaysInDateRange } from "utils/dateUltils";
import { StudentType } from "interface";

const { Option } = Select;
const { RangePicker } = DatePicker;
// const dateFormat = 'YYYY/MM/DD';

interface TuitionFeeType {
	student_id: number;
	name: string;
	fixed_deduction: string;
	flexible_deduction: string;
	debt: string;
	note: string;
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

	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const getClassInfoStatus = useSelector((state: RootState) => state.classReducer.getClassStatus);

	const fixed_deductions_ref = useRef<any>([]);
	const flexible_deductions_ref = useRef<any>([]);
	const notes_ref = useRef<any>([]);

	// useEffect(() => {
	// 	itemsRef.current = itemsRef.current.slice(0, get(students, "data.length", 0));
	// }, [students]);

	useEffect(() => {
		dispatch(actionGetClasses({}));
		dispatch(actionSetClassStateNull());
		dispatch(actionSetStudentsStateNull());
	}, [dispatch]);

	useEffect(() => {
		if (classInfo) {
			dispatch(actionGetStudents({ class_id: classInfo.id, per_page: 100 }));
		}
	}, [dispatch, classInfo]);

	// count days in period
	useEffect(() => {
		if (classInfo) {
			// tại sao cần get lại student khi thay đổi ngày tháng thế c?
			// student thay đổi thì danh sách tuition fees lại bị reset
			// dispatch(actionGetStudents({ class_id: classInfo.id, per_page: 100 }));
			setrResidualSessionNum(
				get(classInfo, "period_tuitions", []).length > 0
					? get(classInfo, "period_tuitions", [])[0].est_session_num - get(classInfo, "act_session_num", 0)
					: 0
			);
			if (classInfo.schedule.length > 0) {
				let count = 0;
				for (let index = 0; index < classInfo.schedule.length; index++) {
					const day = classInfo.schedule[index];
					count += countDaysInDateRange(fromDate, toDate, day);
				}
				setEstSessionNum(count);
			}
		}
	}, [classInfo, dispatch, fromDate, toDate]);

	useEffect(() => {
		if (students && classInfo) {
			fixed_deductions_ref.current = [];
			flexible_deductions_ref.current = [];
			notes_ref.current = [];
			setFixedDeductionTypeList(Array(students.data.length).fill(0));
			setFlexibleDeductionTypeList(Array(students.data.length).fill(0));
		}
	}, [students, classInfo]);

	function handleCreateTuition() {
		const params =
			students?.data.map((st, idx) => ({
				// Duyệt qua mảng student để điền thông tin tuition_fees[0] cho từng student.
				// Thông tin lấy như dưới đây nhé
				// console.log(fixed_deductions_ref.current[idx].input.value);
				// console.log(fixedDeductionTypeList[idx])
				// console.log(flexible_deductions_ref.current[idx].input.value);
				// console.log(flexibleDeductionTypeList[idx])
				// console.log(notes_ref.current[idx].resizableTextArea.textArea.value);
			})) ?? {};
	}

	function handleChangePeriod(dates: any, dateString: [string, string]) {
		setFromDate(dateString[0]);
		setToDate(dateString[1]);
		// console.log(countDaysInDateRange(dateString[0], dateString[1], 2))
	}

	function handleChangeClass(classID: number) {
		dispatch(actionSetStudentsStateNull());
		if (classID > 0) {
			dispatch(actionGetClass(classID));
		} else dispatch(actionSetClassStateNull());
	}

	function estPeriodTuitionFee(): string {
		const fee = get(classInfo, "fee_per_session", 0);
		return numeral((estSessionNum - residualSessionNum) * fee).format("0,0");
	}

	function handleChangeSetAllFixedDeductionSate(e: boolean) {
		setFixedDeductionAlState(e);
		setShowFixedDeductionAllModal(e);
	}

	function handleSetAllFixedDeduction() {
		flexible_deductions_ref.current.forEach((el: any) => (el.state.value = fixedDeductionAlAmount));
		fixedDeductionTypeList.forEach((v, idx) => (fixedDeductionTypeList[idx] = fixedDeductionAllType));
		console.log(fixedDeductionTypeList);
		handleChangeSetAllFixedDeductionSate(false);
		setFixedDeductionAlState(true);
		setFixedDeductionAlAmount("");
		setFixedDeductionTypeList([...fixedDeductionTypeList]);
	}

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
					<Tooltip title="Học phí ước tính của kỳ này, dựa trên số buổi học ước tính kỳ này trừ đi số buổi dư kỳ trước">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			dataIndex: "tuition",
			key: "tuition",
			render: function tuitionCol(): JSX.Element {
				return <span>{estPeriodTuitionFee()}</span>;
			},
		},
		{
			title: (
				<>
					Nợ kỳ trước{" "}
					<Tooltip title="Có thể là nợ học phí do nhập học sau kỳ thu học phí">
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			key: "debt",
			render: function debtCol(_: string, st: StudentType, index: number): JSX.Element {
				return (
					<>
						<span style={{ color: "#e74c3c" }}>{numeral(tuitionFees[index]?.debt).format("0,0")}</span>
					</>
				);
			},
		},
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
		{
			title: (
				<>
					Giảm trừ theo đợt{" "}
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
							ref={(e) => (flexible_deductions_ref.current[index] = e)}
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
			render: function residualCol(): JSX.Element {
				return (
					<>
						<strong style={{ color: "#2980b9" }}>{numeral(300000).format("0,0")}</strong>
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
					<Button type="primary" key="1" icon={<CheckCircleOutlined />} onClick={handleCreateTuition}>
						Hoàn tất
					</Button>,
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
							dateRender={(current) => {
								const style = { border: "", borderRadius: "" };
								if ((get(classInfo, "schedule", []) as number[]).includes(current.day())) {
									style.border = "1px solid #1890ff";
									style.borderRadius = "50%";
								}
								return (
									<div className="ant-picker-cell-inner" style={style}>
										{current.date()}
									</div>
								);
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
						<strong>{estPeriodTuitionFee()}</strong>
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
				rowKey="student_id"
				bordered
				style={{ padding: 20 }}
				dataSource={get(students, "data", [])}
				columns={columns}
				loading={getClassInfoStatus === "loading"}
				pagination={{ defaultPageSize: 100 }}
			/>
		</Layout.Content>
	);
}
