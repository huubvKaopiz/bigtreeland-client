import {
	CreditCardOutlined,
	ExclamationCircleOutlined,
	FileAddOutlined,
	NotificationOutlined,
	QuestionCircleOutlined,
	TransactionOutlined,
	FileTextOutlined,
	ReloadOutlined,
} from "@ant-design/icons"
import {
	Alert,
	Button,
	Checkbox,
	Descriptions,
	Input,
	InputNumber,
	Layout,
	Modal,
	PageHeader,
	Space,
	Statistic,
	Table,
	Tabs,
	Tag,
	Tooltip,
} from "antd"
import Column from "antd/lib/table/Column"
import { PeriodTuitionType, StudentType, TuitionFeeType } from "interface"
import { get } from "lodash"
import moment from "moment"
import numeral from "numeral"
import Revenues from "pages/Revenues"
import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { actionAddNotification } from "store/notifications/slice"
import { actionGetRevenues } from "store/revenues/slice"
import { RootState, useAppDispatch } from "store/store"
import { actionGetStudents } from "store/students/slice"
import { actionGetPeriodTuion } from "store/tuition/periodslice"
import {
	actionTuitionFeePayment,
	actionTuitionFeeTranferDebt,
} from "store/tuition/tuition"
import { formatCurrency } from "utils/ultil"
import ExportExcel from "./exportExcel"
import TuitionFeeDetailForm from "./tuitionFeeDetailForm"

const { TabPane } = Tabs
const { confirm } = Modal
const dateFormat = "DD/MM/YYYY"

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
]

export default function TuitionDetail(): JSX.Element {
	const params = useParams() as { tuition_id: string }
	const dispatch = useAppDispatch()
	const [studentList, setStudetnList] = useState<StudentType[]>([])
	const [newStudentList, setNewStudentList] = useState<StudentType[]>([])
	const [estTuitionFee, setEstTuitionFee] = useState<number>(0)
	const [feesPerStudent, setFeesPerStudent] = useState<number[]>([])
	const [paymentCount, setPaymentCount] = useState<number>(0)
	const [showNotiForm, setShowNotiForm] = useState(false)
	const [showTuitionFeeDetailForm, setShowTuitionFeeDetailForm] =
		useState(false)
	const [showPaymentForm, setShowPaymentForm] = useState(false)
	const [actionIndex, setActionIndex] = useState(-1)
	const [addTuitionFeeStudent, setAddTuitionFeeStudent] =
		useState<StudentType | null>(null)

	// application states
	const tuitionPeriodInfo = useSelector(
		(state: RootState) => state.periodTuitionReducer.periodTuition
	)
	const getTuitionPeriodState = useSelector(
		(state: RootState) => state.periodTuitionReducer.getPeriodTuitionStatus
	)
	const tuitionFeePaymentState = useSelector(
		(state: RootState) => state.tuitionFeeReducer.tuitionFeePaymentState
	)

	const students = useSelector(
		(state: RootState) => state.studentReducer.students
	)

	//get period information
	useEffect(() => {
		if (params.tuition_id || tuitionFeePaymentState === "success") {
			dispatch(actionGetPeriodTuion(+params.tuition_id))
			if (tuitionFeePaymentState === "success") {
				setShowPaymentForm(false)
				setActionIndex(-1)
			}
		}
	}, [dispatch, params.tuition_id, tuitionFeePaymentState])

	//handle period information change
	useEffect(() => {
		dispatch(
			actionGetStudents({
				class_id: tuitionPeriodInfo?.class_id ?? void 0,
				per_page: 100,
			})
		)

		//update tuition fees data
		if (tuitionPeriodInfo) {
			let totalTuitionFee = 0
			let paidCount = 0
			const estTuiionFeeMap: number[] = []
			get(tuitionPeriodInfo, "tuition_fees", []).forEach(
				(tuition: TuitionFeeType) => {
					if (tuition.status === 1) {
						const est_session_num =
							get(tuition, "est_session_num", 0) > 0
								? get(tuition, "est_session_num", 0)
								: get(tuitionPeriodInfo, "est_session_num", 0)
						const est_fee =
							get(tuitionPeriodInfo, "fee_per_session", 0) * est_session_num +
							+isNaN(+tuition.prev_debt)
								? 0
								: +tuition.prev_debt
						const deduce_amount = +isNaN(+tuition.residual)
							? 0
							: +tuition.residual + +isNaN(+tuition.fixed_deduction)
							? 0
							: +tuition.fixed_deduction +
							  +get(tuition, "flexible_deduction", 0)
						const cal_fee = est_fee - deduce_amount
						if (cal_fee > 0) totalTuitionFee += cal_fee
					}
					if (tuition.status === 1) paidCount++
					if (tuition.est_session_num === 0) {
						const est_fee =
							get(tuitionPeriodInfo, "est_session_num", 0) *
							get(tuitionPeriodInfo, "fee_per_session", 0)
						estTuiionFeeMap[tuition.id] = est_fee
					} else {
						const est_fee =
							get(tuition, "est_session_num", 0) *
							get(tuitionPeriodInfo, "fee_per_session", 0)
						estTuiionFeeMap[tuition.id] = est_fee
					}
				}
			)
			setEstTuitionFee(totalTuitionFee)
			setPaymentCount(paidCount)
			setFeesPerStudent(estTuiionFeeMap)
		}
	}, [dispatch, tuitionPeriodInfo])

	// handle students change
	useEffect(() => {
		setStudetnList([...(get(students, "data", []) as StudentType[])])
		if (get(tuitionPeriodInfo, "active", 0) === 1) {
			const newList: StudentType[] = []
			get(students, "data", []).forEach((st) => {
				const index = get(tuitionPeriodInfo, "tuition_fees", []).findIndex(
					(tuition) => tuition.student_id === st.id
				)
				if (index === -1) newList.push(st)
				// if (index === -1) {
				// 	if (st.class_histories.length >= 1) {
				// 		if (
				// 			moment(st.class_histories[st.class_histories.length - 1].date).isSameOrAfter(moment(get(tuitionPeriodInfo, "from_date", "")))
				// 		)
				// 			newList.push(st);
				// 	}
				// }
			})
			setNewStudentList(newList)
		}
	}, [students, tuitionPeriodInfo])

	const hanelCloseTuitionFeeDetailForm = (refresh: boolean) => {
		setActionIndex(-1)
		setAddTuitionFeeStudent(null)
		setShowTuitionFeeDetailForm(false)
		if (refresh) {
			dispatch(actionGetPeriodTuion(+params.tuition_id))
		}
	}

	const handleReloadRevenues = () => {
		if (tuitionPeriodInfo) {
			dispatch(actionGetRevenues({ period_tuition_id: tuitionPeriodInfo.id }))
		}
	}

	function handleTraferDebt(tuition: TuitionFeeType) {
		confirm({
			title: "Xác nhận chuyển nợ sang chu kỳ mới",
			content:
				"Lưu ý để chuyển nợ bắt buộc phải tồn tại một bảng học phí mới tương ứng của học sinh!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				const debt_tranfer =
					feesPerStudent[tuition.id] +
						+tuition.prev_debt -
						+tuition.paid_amount -
						+tuition.fixed_deduction -
						+tuition.flexible_deduction -
						+tuition.residual || 0
				dispatch(
					actionTuitionFeeTranferDebt({
						debt_tranfer: String(debt_tranfer),
						tuition_fee_id: tuition.id,
					})
				).finally(() => {
					dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)))
				})
			},
		})
	}

	//render ui
	const renderContent = (column = 2) => (
		<Descriptions size="middle" column={column}>
			<Descriptions.Item label="Lớp học">
				<a>{get(tuitionPeriodInfo, "class.name", "")}</a>
			</Descriptions.Item>
			<Descriptions.Item label="Chu kỳ">
				<strong>
					{moment(get(tuitionPeriodInfo, "from_date", "")).format(dateFormat)} -{" "}
					{moment(get(tuitionPeriodInfo, "to_date", "")).format(dateFormat)}
				</strong>
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
				<strong style={{ float: "right" }}>
					{formatCurrency(get(tuitionPeriodInfo, "class.fee_per_session", ""))}
				</strong>
			</Descriptions.Item>
			<Descriptions.Item label="Số buổi đã học">
				<span style={{ color: "#e74c3c" }}>
					{get(tuitionPeriodInfo, "lessons", []).length}
				</span>
			</Descriptions.Item>
			<Descriptions.Item label="Trạng thái">
				<span style={{ color: "#e74c3c" }}>
					{get(tuitionPeriodInfo, "active", 0) === 1 ? (
						<Tag color="green">Active</Tag>
					) : (
						<Tag color="red">Deactive</Tag>
					)}
				</span>
			</Descriptions.Item>
		</Descriptions>
	)
	const extraContent = (
		<div
			style={{
				display: "flex",
				width: "max-content",
				justifyContent: "flex-end",
			}}
		>
			<Statistic
				title="Học phí thu được"
				value={formatCurrency(estTuitionFee)}
				style={{
					marginRight: 32,
					fontWeight: 600,
					color: "#3498db",
				}}
			/>
			<Statistic
				title="Đã nộp"
				value={`${paymentCount} / ${
					get(tuitionPeriodInfo, "tuition_fees", []).length
				}`}
				style={{
					fontWeight: 600,
				}}
			/>
		</div>
	)

	const std_fee_columns = [
		{
			title: "STT",
			key: "stt",
			width:80,
			render: function nameCol(_: string, record: TuitionFeeType, index: number): JSX.Element {
				return <span>{index + 1}</span>
			},
		},
		{
			title: "Họ tên",
			dataIndex: "student",
			key: "student",
			render: function nameCol(_: string, record: TuitionFeeType): JSX.Element {
				return (
					<>
						<a>{get(record, "student.name", "")}</a>{" "}
						<i style={{ color: "#7f8c8d" }}>
							{moment(get(record, "student.birthday", "")).format("DD-MM-YYYY")}
						</i>
					</>
				)
			},
		},
		{
			title: "Tổng học phí",
			dataIndex: "residual",
			key: "residual",
			render: function amountCol(
				_: number,
				feeItem: TuitionFeeType
			): JSX.Element {
				return (
					<span style={{ color: "#2980b9", fontWeight: 700 }}>
						{numeral(
							feesPerStudent[feeItem.id]! +
								+feeItem.prev_debt -
								// +feeItem.paid_amount -
								+feeItem.fixed_deduction -
								+feeItem.flexible_deduction -
								+feeItem.residual || 0
						).format("0,0")}
					</span>
				)
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
						{status === 0 ? (
							<Tag color="red">Chưa nộp</Tag>
						) : status === 1 ? (
							<Tag color="green">Đã nộp</Tag>
						) : status === 2 ? (
							<Tag color="blue">Nộp một phần</Tag>
						) : (
							<Tag color="orange">Chuyển nợ</Tag>
						)}
					</>
				)
			},
		},
		{
			width: "5%",
			title: "Action",
			key: "action",
			render: function ActionCol(
				text: string,
				record: TuitionFeeType,
				index: number
			): JSX.Element {
				return (
					<>
						<Space>
							<Tooltip title="Chi tiết bảng học phí">
								<Button
									onClick={() => {
										setShowTuitionFeeDetailForm(true)
										setActionIndex(index)
									}}
									icon={<FileTextOutlined />}
									type="link"
								/>
							</Tooltip>

							<Tooltip title="Gửi thông báo cho phụ huynh">
								<Button
									type="link"
									onClick={() => {
										setShowNotiForm(true)
										setActionIndex(index)
									}}
									icon={<NotificationOutlined />}
								/>
							</Tooltip>
							{tuitionPeriodInfo?.active === 0 && (
								<Tooltip title="Chuyển nợ">
									<Button
										disabled={record.status === 0 ? false : true}
										icon={
											<TransactionOutlined
												style={{
													color: record.status === 0 ? "#e67e22" : "#bdc3c7",
												}}
											/>
										}
										type="link"
										onClick={() => handleTraferDebt(record)}
									/>
								</Tooltip>
							)}

							<Tooltip title="Xác nhận thanh toán">
								<Button
									disabled={record.status === 1}
									icon={
										<CreditCardOutlined
											style={{
												color: record.status === 1 ? "#bdc3c7" : "#27ae60",
											}}
										/>
									}
									type="link"
									onClick={() => {
										setActionIndex(index)
										setShowPaymentForm(true)
									}}
								/>
							</Tooltip>
						</Space>
					</>
				)
			},
		},
	]

	const Content = (props: {
		children: JSX.Element
		extra: JSX.Element
	}): JSX.Element => {
		const { children, extra } = props
		return (
			<div className="content" style={{ display: "flex" }}>
				<div className="main">{children}</div>
				<div className="extra">{extra}</div>
			</div>
		)
	}
	return (
		<Layout.Content>
			<PageHeader
				onBack={() => window.history.back()}
				className="site-page-header-responsive"
				title="Chi tiết chu kỳ học phí"
				style={{ backgroundColor: "white" }}
				extra={[
					<>
						<ExportExcel
							periodTuition={tuitionPeriodInfo}
							students={studentList}
							feesPerStudent={feesPerStudent}
						/>
						<Button
							type="primary"
							icon={<NotificationOutlined />}
							onClick={() => {
								setShowNotiForm(true)
								setActionIndex(-1)
							}}
						>
							Thông báo
						</Button>
					</>,
				]}
				footer={
					<Tabs defaultActiveKey="1">
						<TabPane tab="Học phí mỗi học sinh" key="stdTuition">
							<Alert
								style={{ marginBottom: 20, marginTop: 20 }}
								message=""
								description={
									<>
										<p>
											Với học sinh đã chuyển lớp, cần quyết toán học phí ở lớp
											cũ trước khi lập bảng học phí ở lớp mới!
										</p>
										<p>
											Quyết toán bằng cách cập nhật lại bảng học phí theo đúng
											số buổi đã học ở lớp cũ (cập nhật giảm trừ, ghi chú cụ
											thể...)
										</p>
									</>
								}
								type="warning"
								closable
							/>
							<Table
								rowKey="student_id"
								loading={getTuitionPeriodState === "loading"}
								bordered
								style={{ paddingTop: 20 }}
								dataSource={get(tuitionPeriodInfo, "tuition_fees", [])}
								columns={std_fee_columns}
								pagination={{ pageSize: 50 }}
							/>
						</TabPane>
						{newStudentList.length > 0 ? (
							<TabPane
								tab={
									<span>
										Học sinh mới (
										<span style={{ color: "#e74c3c" }}>
											{newStudentList.length}
										</span>
										)
									</span>
								}
								key="newSt"
							>
								<Alert
									style={{ marginBottom: 20, marginTop: 20 }}
									message=""
									description="DS học sinh mới là những học sinh vào lớp sau chu kỳ thu học phí và chưa lập bảng thu học phí cho chu kỳ này!"
									type="warning"
									closable
								/>
								<Table dataSource={newStudentList} rowKey="id">
									<Column
										title="Họ tên"
										dataIndex="name"
										key="name"
										render={(val) => <a>{val}</a>}
									/>
									<Column
										title="Ngày sinh"
										dataIndex="birthday"
										key="birthday"
										render={(val) => <>{moment(val).format("DD/MM/YYYY")}</>}
									/>
									<Column
										title="Ngày nhập học"
										dataIndex=""
										key="admission_date"
										render={(_: number, record: StudentType) => (
											<strong>
												{moment(
													record.class_histories[
														record.class_histories.length - 1
													].date
												).format("DD/MM/YYYY")}
											</strong>
										)}
									/>
									<Column
										title="Aaction"
										dataIndex="action"
										key="action"
										render={(_: number, record: StudentType) => (
											<Space>
												<Tooltip title="Tạo bảng học phí">
													<Button
														onClick={() => {
															setShowTuitionFeeDetailForm(true)
															setAddTuitionFeeStudent(record)
														}}
														icon={<FileAddOutlined />}
														type="link"
													/>
												</Tooltip>
											</Space>
										)}
									/>
								</Table>
							</TabPane>
						) : (
							""
						)}
						<TabPane tab="Danh sách buổi học" key="lessionInfo">
							<Space size={[8, 16]} wrap style={{ padding: 20 }}>
								{get(tuitionPeriodInfo, "lessons", []).map((lesson) => (
									<Tag key={lesson.id} color="blue">
										{lesson.date}
									</Tag>
								))}
							</Space>
						</TabPane>
						<TabPane tab="Danh sách phiếu thu" key="revenues">
							<div className="space-align-block">
								<Space align="end">
									<Button
										type="primary"
										onClick={handleReloadRevenues}
										icon={<ReloadOutlined />}
									>
										Tải lại
									</Button>
								</Space>
							</div>
							<Revenues period_tuition_id={get(tuitionPeriodInfo, "id", 0)} />
						</TabPane>
					</Tabs>
				}
			>
				<Content extra={extraContent}>{renderContent()}</Content>
				<TuitionFeeDetailForm
					periodTuition={tuitionPeriodInfo}
					studentInfo={addTuitionFeeStudent}
					show={showTuitionFeeDetailForm}
					onClose={hanelCloseTuitionFeeDetailForm}
					currentTuitionFee={
						actionIndex > -1
							? get(tuitionPeriodInfo, "tuition_fees", [])[actionIndex]
							: null
					}
				/>
				<SendNotiModal
					tuitionIndex={actionIndex}
					periodTuitionInfo={tuitionPeriodInfo}
					show={showNotiForm}
					setShow={setShowNotiForm}
					students={studentList}
				/>
				<PaymentModal
					tuition_fee={
						actionIndex !== -1
							? get(tuitionPeriodInfo, "tuition_fees", [])[actionIndex]
							: null
					}
					fee_per_student={
						actionIndex !== -1
							? feesPerStudent[
									get(tuitionPeriodInfo, "tuition_fees", [])[actionIndex].id
							  ]
							: 0
					}
					show={showPaymentForm}
					setShow={setShowPaymentForm}
				/>
			</PageHeader>
		</Layout.Content>
	)
}

function PaymentModal(props: {
	tuition_fee: TuitionFeeType | null
	fee_per_student: number
	show: boolean
	setShow: (param: boolean) => void
}): JSX.Element {
	const { tuition_fee, fee_per_student, show, setShow } = props
	const dispatch = useAppDispatch()
	const [paid, setPaid] = useState(0)
	const [paidFull, setPaidFull] = useState(0)
	const tuitionFeePaymentState = useSelector(
		(state: RootState) => state.tuitionFeeReducer.tuitionFeePaymentState
	)

	useMemo(() => {
		if (tuition_fee) {
			const amount =
				fee_per_student +
					+tuition_fee.prev_debt -
					+tuition_fee.fixed_deduction -
					+tuition_fee.flexible_deduction -
					+tuition_fee.residual || 0
			setPaidFull(amount)
			setPaid(0)
		}
	}, [tuition_fee])

	function handleSubmit() {
		if (paid === 0) return
		const tuition_fee_id = get(tuition_fee, "id", 0)
		const payload = {
			tuition_fee_id,
			amount: String(paid),
			status: paid === paidFull - +get(tuition_fee, "paid_amount", 0) ? 1 : 2,
		}
		dispatch(actionTuitionFeePayment(payload))
	}
	return (
		<Modal
			title={
				<>
					Xác nhận đã thanh toán cho học sinh{" "}
					<a>{get(tuition_fee, "student.name", "")}</a>
				</>
			}
			visible={show}
			width={600}
			onCancel={() => {
				setShow(false)
				setPaid(0)
			}}
			cancelText="Huỷ bỏ"
			okText="Gửi lên"
			onOk={() => handleSubmit()}
			okButtonProps={{
				loading: tuitionFeePaymentState === "loading",
			}}
		>
			<div style={{ marginBottom: 20 }}>
				<span>Tổng:</span>{" "}
				<strong style={{ color: "#d35400", marginRight: 10 }}>
					{numeral(paidFull).format("0,0")}
				</strong>
				<span>Đã nộp:</span>{" "}
				<strong style={{ color: "#27ae60", marginRight: 10 }}>
					{numeral(tuition_fee?.paid_amount).format("0,0")}
				</strong>
				<span>Còn lại:</span>{" "}
				<strong style={{ color: "#d35400" }}>
					{numeral(
						paidFull - +get(tuition_fee, "paid_amount", 0) - paid
					).format("0,0")}
				</strong>
			</div>
			<Space>
				<span>Số tiền nộp lần này: </span>
				<InputNumber
					value={numeral(paid).format("0,0")}
					onChange={(value) => setPaid(+value)}
					style={{ fontWeight: "bold", width: 180, color: "#2980b9" }}
				/>
				<Button
					type="primary"
					ghost
					onClick={() =>
						setPaid(paidFull - +get(tuition_fee, "paid_amount", 0))
					}
				>
					Nộp hết
				</Button>
			</Space>
			<Alert
				style={{ marginTop: 20 }}
				type="warning"
				message="Lưu ý sau khi xác nhận đã thanh toán hết thì sẽ không thể sửa được bảng học phí!"
			/>
		</Modal>
	)
}

// SendNotiModal component
function SendNotiModal(prop: {
	tuitionIndex: number
	periodTuitionInfo: PeriodTuitionType | null
	students: StudentType[]
	show: boolean
	setShow: (param: boolean) => void
}): JSX.Element {
	const { tuitionIndex, periodTuitionInfo, show, setShow, students } = prop
	const dispatch = useAppDispatch()
	const [onlyUnpaid, setOnlyUnpaid] = useState(false)
	const [message, setMessage] = useState("")

	const sending = useSelector(
		(state: RootState) => state.notificationReducer.addNotificationStatus
	)

	function handleSendNotification() {
		console.log("Send notification", tuitionIndex)
		setShow(false)
		const user_ids: number[] = []
		if (tuitionIndex === -1) {
			get(periodTuitionInfo, "tuition_fees", []).forEach((tuition) => {
				if (onlyUnpaid) {
					if (tuition.status !== 1) {
						const student = students.find((st) => st.id === tuition.student_id)
						const userID = get(student, "parent.id", 0)
						if (userID > 0) user_ids.push(userID)
					}
				} else {
					const student = students.find((st) => st.id === tuition.student_id)
					const userID = get(student, "parent.id", 0)
					if (userID > 0) user_ids.push(userID)
				}
			})
		} else {
			const student = students.find(
				(st) =>
					st.id ===
					get(periodTuitionInfo, "tuition_fees", [])[tuitionIndex].student_id
			)
			const userID = get(student, "parent.id", 0)
			if (userID > 0) user_ids.push(userID)
		}

		const payload = {
			user_ids,
			message: {
				title: "Thông báo học phí",
				body: message,
				data: {},
			},
		}
		dispatch(actionAddNotification(payload)).finally(() => {
			setShow(false)
		})
	}

	return (
		<>
			<Modal
				title="Gửi thông báo cho phụ huynh!"
				visible={show}
				onCancel={() => setShow(false)}
				onOk={handleSendNotification}
				footer={[
					<Button key="btncancel" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button
						key="btnsubmit"
						type="primary"
						onClick={() => handleSendNotification()}
						loading={sending === "loading" ? true : false}
					>
						Gửi đi
					</Button>,
				]}
			>
				<Input.TextArea
					placeholder="Write something here!"
					style={{ marginBottom: 20 }}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				{tuitionIndex === -1 ? (
					<Checkbox onChange={(e) => setOnlyUnpaid(e.target.checked)}>
						Chỉ những học sinh chưa nộp
					</Checkbox>
				) : (
					""
				)}
			</Modal>
		</>
	)
}
