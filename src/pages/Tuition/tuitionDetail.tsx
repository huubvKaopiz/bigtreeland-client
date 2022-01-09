import { QuestionCircleOutlined, NotificationOutlined, DollarOutlined } from "@ant-design/icons";
import { Alert, Button, Descriptions, Input, Layout, Modal, PageHeader, Space, Statistic, Table, Tabs, Tag, Tooltip } from "antd";
import Column from "antd/lib/table/Column";
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
import { actionUpdateTuitionFee } from "store/tuition/tuition";
import { formatCurrency } from "utils/ultil";
import { CreateTuitionFeeModal } from "./createTuitionFreeModal";
import { EditTuitionFeeModal } from "./editTuitionFeeModal";

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
		title: "Số học sinh tham gia",
		dataIndex: "attendances",
		key: "attendances",
	},
];

export default function TuitionDetail(): JSX.Element {
	const params = useParams() as { tuition_id: string };
	const dispatch = useAppDispatch();
	const tuitionPeriodInfo = useSelector((state: RootState) => state.periodTuitionReducer.periodTuition);
	const students = useSelector((state: RootState) => state.studentReducer.students);
	const [studentList, setStudetnList] = useState<StudentType[]>([]);
	const [newStudentList, setNewStudentList] = useState<StudentType[]>([]);
	const [estTuitionFee, setEstTuitionFee] = useState<number>(0);
	const [feesPerStudent, setFeesPerStudent] = useState<number[]>([]);
	const [paymentCount, setPaymentCount] = useState<number>(0);

	//get period information 
	useEffect(() => {
		if (params.tuition_id) {
			dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
		}
	}, [dispatch, params.tuition_id]);

	//handle period information change
	useEffect(() => {
		dispatch(
			actionGetStudents({
				class_id: tuitionPeriodInfo?.class_id ?? void 0,
				per_page: 100,
			})
		);

		//update tuition fees data
		if (tuitionPeriodInfo) {
			let totalTuitionFee = 0;
			let totalPayment = 0;
			const estTuiionFeeMap:number[] = [];
			get(tuitionPeriodInfo, "tuition_fees", []).forEach((tuition: TuitionFeeType) => {
				const est_fee =
					get(tuitionPeriodInfo, "class.fee_per_session", 0) * get(tuitionPeriodInfo, "est_session_num", 0);
				const deduce_amount =
					+get(tuition, "residual", 0) +
					+get(tuition, "fixed_deduction", 0) +
					+get(tuition, "flexible_deduction", 0)
				const cal_fee = est_fee - deduce_amount;
				if (cal_fee > 0) totalTuitionFee += cal_fee;
				if (tuition.status === 1) totalPayment++;
				if (tuition.est_session_num === 0) {
					const est_fee = get(tuitionPeriodInfo, "est_session_num", 0) * get(tuitionPeriodInfo, "fee_per_session", 0)
					estTuiionFeeMap[tuition.id] = est_fee;
				} else {
					const est_fee = get(tuition, "est_session_num", 0) * get(tuitionPeriodInfo, "fee_per_session", 0)
					estTuiionFeeMap[tuition.id] = est_fee;
				}
			})
			setEstTuitionFee(totalTuitionFee);
			setPaymentCount(totalPayment);
			setFeesPerStudent(estTuiionFeeMap);
		}

	}, [dispatch, tuitionPeriodInfo]);

	// handle students change
	useEffect(() => {
		setStudetnList([...(get(students, "data", []) as StudentType[])]);
		const newList: StudentType[] = [];
		if (get(students, "data", []).length > get(tuitionPeriodInfo, "tuition_fees", []).length) {
			get(students, "data", []).forEach((st) => {
				const index = get(tuitionPeriodInfo, "tuition_fees", []).findIndex((tuition) => tuition.student_id === st.id);
				if (index === -1) newList.push(st);
			})
		}
		setNewStudentList(newList);
	}, [students, tuitionPeriodInfo]);

	// console.log(feesPerStudent);
	//render ui
	const renderContent = (column = 2) => (
		<Descriptions size="middle" column={column}>
			<Descriptions.Item label="Lớp học"><a>{get(tuitionPeriodInfo, "class.name", "")}</a></Descriptions.Item>
			<Descriptions.Item label="Chu kỳ">
				{moment(get(tuitionPeriodInfo, "from_date", "")).format(dateFormat)} - {" "}
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
				<strong style={{ float: "right" }}>{formatCurrency(get(tuitionPeriodInfo, "class.fee_per_session", ""))}</strong>
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
					color: "#2980b9"
				}}
			/>
			<Statistic
				title="Đã nộp"
				value={`${paymentCount} / ${get(tuitionPeriodInfo, "tuition_fees", []).length}`}
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
			dataIndex: "",
			key: "tuition",
			render: function amountCol(record: TuitionFeeType): JSX.Element {
				return <span style={{ fontWeight:700 }}>{numeral(feesPerStudent[record.id]).format("0,0")}</span>;
			},
			// align: 'right',
		},
		{
			title: "Giảm trừ đặc biệt",
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
					<span style={{ color: "#2980b9", fontWeight:700 }}>
						{numeral(feesPerStudent[feeItem.id]! - +feeItem.fixed_deduction - +feeItem.flexible_deduction).format("0,0")}
					</span>
				);
			},
			// align: 'right',
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			render: function statusCol(status: number): JSX.Element {
				return (
					<>
						{status === 0 ? <Tag color="red">Chư nộp</Tag> : <Tag color="green">Đã nộp</Tag>}
					</>
				)
			}
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
					<>
						<Space>
							<Tooltip title="Chỉnh sửa">
								<EditTuitionFeeModal tuitionFeeInfo={record} periodInfo={tuitionPeriodInfo} stName={studentList.find((st) => st.id === record.student_id)?.name} />
							</Tooltip>
							<PaymentConfirmModal tuition={record} period_id={get(tuitionPeriodInfo, "id", 0)} />
							<SendNotiModal tuition={record} />
						</Space>
					</>

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
					<Tabs defaultActiveKey="1" >
						<TabPane tab="Học phí mỗi học sinh" key="stdTuition">
							<Table
								rowKey="student_id"
								bordered
								style={{ paddingTop: 20 }}
								dataSource={get(tuitionPeriodInfo, "tuition_fees", [])}
								columns={std_fee_columns}
								pagination={{ pageSize: 50 }}
							/>
						</TabPane>
						{
							newStudentList.length > 0 ?

								<TabPane tab={<span>Học sinh mới (<span style={{ color: "#e74c3c" }}>{newStudentList.length}</span>)</span>} key="newSt" >
									<Alert
										style={{ marginBottom: 20, marginTop: 20 }}
										message=""
										description="DS học sinh mới là những học sinh vào sau chu kỳ thu học phí và chưa lập bảng thu học phí cho chu kỳ này!"
										type="warning"
										closable
									/>
									<Table dataSource={newStudentList} rowKey="id">
										<Column title="Họ tên" dataIndex="name" key="name" render={(val) => <a>{val}</a>} />
										<Column title="Ngày sinh" dataIndex="birthday" key="birthday" />
										<Column title="Ngày nhập học" dataIndex="admission_date" key="admission_date" />
										<Column title="Aaction" dataIndex="action" key="action" render={(_: number, record: StudentType) => (
											<Space>
												<CreateTuitionFeeModal periodInfo={tuitionPeriodInfo} studentInfo={record} />
											</Space>
										)} />
									</Table>
								</TabPane>
								: ""
						}
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


// SendNotiModal component
function SendNotiModal(prop: { tuition: TuitionFeeType }): JSX.Element {
	const { tuition } = prop;

	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const deleteStatus = useSelector((state: RootState) => state.periodTuitionReducer.deletePeriodTuitionStatus);

	useEffect(() => {
		if (deleteStatus === 'success') {
			setShow(false);
		}
	}, [deleteStatus, dispatch])

	function handleSendNotification() {
		console.log("Send notification", tuition.id)
		setShow(false);
	}

	return (
		<>
			<Tooltip title="Gửi thông báo cho phụ huynh">
				<Button
					type="link"
					onClick={() => setShow(true)}
					icon={<NotificationOutlined />}
					disabled={tuition.status === 1 ? true : false}
				/>
			</Tooltip>
			<Modal title="Gửi thông báo nhắc nhở cho phụ huynh!"
				visible={show}
				onCancel={() => setShow(false)}
				onOk={handleSendNotification}
			>
				<Input.TextArea placeholder="Write something here!" />

			</Modal>

		</>
	)
}

function PaymentConfirmModal(prop: { tuition: TuitionFeeType, period_id: number }): JSX.Element {
	const { tuition, period_id } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);

	function handleSubmit() {
		if (tuition) {
			dispatch(actionUpdateTuitionFee({ data: { status: 1 }, tuition_id: get(tuition, "id", 0) }))
				.then(() => {
					setShow(false);
					dispatch(actionGetPeriodTuion(period_id));
				})

		}
	}

	return (
		<>
			<Tooltip title="Xác nhận đã thanh toán">
				<Button
					type="link"
					onClick={() => setShow(true)}
					icon={<DollarOutlined style={{ color: tuition.status === 0 ? "#27ae60" : "" }} />}
					disabled={tuition.status === 1 ? true : false}
				/>
			</Tooltip>
			<Modal title="Xác nhận đã thanh toán!"
				visible={show}
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
			>
				Lưu ý sau khi xác nhận đã thanh toán sẽ không thể sửa được bảng học phí!

			</Modal>

		</>
	)
}
