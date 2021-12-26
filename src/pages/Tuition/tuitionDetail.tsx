import { QuestionCircleOutlined } from "@ant-design/icons";
import { Descriptions, Layout, PageHeader, Statistic, Table, Tabs, Tooltip } from "antd";
import { StudentType, TuitionFeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents } from "store/students/slice";
import { actionGetPeriodTuion } from "store/tuition/periodslice";
import { formatCurrency } from "utils/ultil";
import EditStdTuition from "./editStdTuition";

const { TabPane } = Tabs;
const dateFormat = "DD-MM-YYYY";

const lesson_columns = [
	{
		title: "Ngày học",
		dataIndex: "date",
		key: "date",
	},
	{
		title: "Giáo viên",
		dataIndex: "",
		key: "",
	},
	{
		title: "Thời gian tạo",
		dataIndex: "created_at",
		key: "created_at",
	},
];

export default function TuitionDetail(): JSX.Element {
	const params = useParams() as { tuition_id: string };
	const dispatch = useAppDispatch();
	const tuitionPeriodInfo = useSelector((state: RootState) => state.periodTuitionReducer.periodTuition);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const [studentList, setStudetnList] = useState<StudentType[]>([]);
	const [estTuitionFee, setEstTuitionFee] = useState<number>(0);
	const [feePerStudent, setFeePerStudent] = useState<number>(0);

	useEffect(() => {
		dispatch(
			actionGetStudents({
				class_id: tuitionPeriodInfo?.class_id ?? void 0,
				per_page: tuitionPeriodInfo?.tuition_fees.length,
			})
		);
		setEstTuitionFee(
			(get(tuitionPeriodInfo, "tuition_fees", []) as TuitionFeeType[]).reduce((amount, student) => {
				const est_fee =
					get(tuitionPeriodInfo, "class.fee_per_session", 0) * get(tuitionPeriodInfo, "est_session_num", 0);
				const deduce_amount =
					+get(student, "residual", 0) +
					+get(student, "fixed_deduction", 0) +
					+get(student, "flexible_deduction", 0) -
					+get(student, "debt", 0);
				const cal_fee = est_fee - deduce_amount;
				return cal_fee > 0 ? amount + cal_fee : amount;
			}, 0)
		);
		setFeePerStudent(get(tuitionPeriodInfo, "est_session_num", 0) * get(tuitionPeriodInfo, "class.fee_per_session", 0));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, tuitionPeriodInfo]);

	useEffect(() => {
		setStudetnList([...(get(students, "data", []) as StudentType[])]);
	}, [students]);

	useEffect(() => {
		if (params.tuition_id) {
			dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
		}
	}, [dispatch, params.tuition_id]);

	const renderContent = (column = 2) => (
		<Descriptions size="middle" column={column}>
			<Descriptions.Item label="Lớp học">{get(tuitionPeriodInfo, "class.name", "")}</Descriptions.Item>
			<Descriptions.Item label="Chu kỳ">
				{moment(get(tuitionPeriodInfo, "from_date", "")).format(dateFormat)} -{" "}
				{moment(get(tuitionPeriodInfo, "to_date", "")).format(dateFormat)}
			</Descriptions.Item>
			<Descriptions.Item
				label={
					<span>
						Số buổi ước tính{" "}
						<Tooltip title="Số buổi học phí ước tính dựa theo lịch học của lớp và khoảng thời gian của chu kỳ học phí">
							{" "}
							<QuestionCircleOutlined style={{ color: "#f39c12" }} />
						</Tooltip>
					</span>
				}
			>
				<span>{get(tuitionPeriodInfo, "est_session_num", 0)}</span>
			</Descriptions.Item>
			<Descriptions.Item label="Học phí/buổi">
				<span style={{ float: "right" }}>{formatCurrency(get(tuitionPeriodInfo, "class.fee_per_session", ""))}</span>
			</Descriptions.Item>
			<Descriptions.Item label="Số buổi đã học">
				<span style={{ color: "#e74c3c" }}>{get(tuitionPeriodInfo, "class.act_session_num", "")}</span>
			</Descriptions.Item>
		</Descriptions>
	);
	const extraContent = (
		<div
			style={{
				display: "flex",
				width: "max-content",
				justifyContent: "flex-end",
			}}
		>
			<Statistic
				title="Học Phí Ước Tính"
				value={formatCurrency(estTuitionFee)}
				style={{
					marginRight: 32,
					fontWeight: 600,
				}}
			/>
			<Statistic
				title="Hoàn Thành"
				value={`${get(tuitionPeriodInfo, "class.act_session_num", 0)} / ${get(
					tuitionPeriodInfo,
					"est_session_num",
					0
				)}`}
				style={{
					fontWeight: 600,
				}}
			/>
		</div>
	);

	const std_fee_columns = [
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
			render: function amountCol(): JSX.Element {
				return <span>{numeral(feePerStudent).format("0,0")}</span>;
			},
			// align: 'right',
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
			dataIndex: "debt",
			key: "debt",
			render: function amountCol(amount: number): JSX.Element {
				return <span style={{ color: "#ff0000" }}>{numeral(amount).format("0,0")}</span>;
			},
			// align: 'right',
		},
		{
			title: "Giảm trừ cố định",
			dataIndex: "fixed_deduction",
			key: "fixed_deduction",
			render: function amountCol(amount: number): JSX.Element {
				return <span style={{ color: "#ff4300" }}>{numeral(amount).format("0,0")}</span>;
			},
			// align: 'right',
		},
		{
			title: (
				<>
					Giảm trừ theo đợt{" "}
					<Tooltip title="Giảm trừ học phí tuỳ chỉnh theo đợt">
						{" "}
						<QuestionCircleOutlined style={{ color: "#f39c12" }} />
					</Tooltip>
				</>
			),
			dataIndex: "flexible_deduction",
			key: "flexible_deduction",
			render: function amountCol(amount: number): JSX.Element {
				return <span style={{ color: "#ff8c00" }}>{numeral(amount).format("0,0")}</span>;
			},
			// align: 'right',
		},
		{
			title: "Thành tiền",
			dataIndex: "residual",
			key: "residual",
			render: function amountCol(_: number, feeItem: TuitionFeeType): JSX.Element {
				return (
					<span style={{ color: "#ffae00" }}>
						{numeral(feePerStudent + +feeItem.debt - +feeItem.fixed_deduction - +feeItem.flexible_deduction).format(
							"0,0"
						)}
					</span>
				);
			},
			// align: 'right',
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Ghi chú",
			dataIndex: "note",
			key: "note",
		},
		{
			width: "5%",
			title: "Action",
			key: "action",
			render: function ActionCol(record: TuitionFeeType): JSX.Element {
				return (
					<Tooltip title="Chỉnh sửa">
						<EditStdTuition stdTuitionFee={record} />
					</Tooltip>
				);
			},
		},
	];

	const Content = (props: { children: JSX.Element; extra: JSX.Element }): JSX.Element => {
		const { children, extra } = props;
		return (
			<div className="content" style={{ display: "flex" }}>
				<div className="main">{children}</div>
				<div className="extra">{extra}</div>
			</div>
		);
	};

	return (
		<Layout.Content>
			<PageHeader
				onBack={() => window.history.back()}
				className="site-page-header-responsive"
				title="Chi tiết học phí"
				style={{ backgroundColor: "white" }}
				footer={
					<Tabs defaultActiveKey="1">
						<TabPane tab="Học phí mỗi học sinh" key="stdTuition">
							<Table
								rowKey="student_id"
								bordered
								style={{ paddingTop: 20 }}
								dataSource={get(tuitionPeriodInfo, "tuition_fees", [])}
								columns={std_fee_columns}
								pagination={{ pageSize: 20 }}
							/>
						</TabPane>
						<TabPane tab="Danh sách buổi học" key="lessionInfo">
							<Table
								rowKey="lesson_id"
								bordered
								style={{ paddingTop: 20 }}
								dataSource={get(tuitionPeriodInfo, "lessons", [])}
								columns={lesson_columns}
								pagination={{ defaultPageSize: 100 }}
							/>
						</TabPane>
					</Tabs>
				}
			>
				<Content extra={extraContent}>{renderContent()}</Content>
			</PageHeader>
		</Layout.Content>
	);
}
