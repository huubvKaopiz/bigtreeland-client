import { QuestionCircleOutlined, NotificationOutlined, CreditCardOutlined, TransactionOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Descriptions, Input, Layout, Modal, PageHeader, Space, Statistic, Table, Tabs, Tag, Tooltip } from "antd";
import Column from "antd/lib/table/Column";
import { PeriodTuitionType, StudentType, TuitionFeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import { actionGetStudents } from "store/students/slice";
import { actionGetPeriodTuion } from "store/tuition/periodslice";
import { actionTuitionFeeTranferDebt, actionUpdateTuitionFee } from "store/tuition/tuition";
import { formatCurrency } from "utils/ultil";
import { CreateTuitionFeeModal } from "./createTuitionFreeModal";
import { EditTuitionFeeModal } from "./editTuitionFeeModal";

const { TabPane } = Tabs;
const { confirm } = Modal;
const dateFormat = "DD/MM/YYYY";

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
	const [showNotiForm, setShowNotiForm] = useState(false);
	const [notiIndex, setNotiIndex] = useState(-1);

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
			let paidCount = 0;
			const estTuiionFeeMap: number[] = [];
			get(tuitionPeriodInfo, "tuition_fees", []).forEach((tuition: TuitionFeeType) => {
				if (tuition.status === 1) {
					const est_session_num = get(tuition, "est_session_num", 0) > 0 ? get(tuition, "est_session_num", 0) : get(tuitionPeriodInfo, "est_session_num", 0);
					const est_fee = get(tuitionPeriodInfo, "fee_per_session", 0) * est_session_num + +get(tuition, "prev_debt", "0")
					const deduce_amount =
						+get(tuition, "residual", 0) +
						+get(tuition, "fixed_deduction", 0) +
						+get(tuition, "flexible_deduction", 0)
					const cal_fee = est_fee - deduce_amount;
					if (cal_fee > 0) totalTuitionFee += cal_fee;
				}
				if (tuition.status === 1) paidCount++;
				if (tuition.est_session_num === 0) {
					const est_fee = get(tuitionPeriodInfo, "est_session_num", 0) * get(tuitionPeriodInfo, "fee_per_session", 0)
					estTuiionFeeMap[tuition.id] = est_fee;
				} else {
					const est_fee = get(tuition, "est_session_num", 0) * get(tuitionPeriodInfo, "fee_per_session", 0)
					estTuiionFeeMap[tuition.id] = est_fee;
				}
			})
			setEstTuitionFee(totalTuitionFee);
			setPaymentCount(paidCount);
			setFeesPerStudent(estTuiionFeeMap);
		}

	}, [dispatch, tuitionPeriodInfo]);

	// handle students change
	useEffect(() => {
		setStudetnList([...(get(students, "data", []) as StudentType[])]);
		if (get(tuitionPeriodInfo, "active", 0) === 1) {
			const newList: StudentType[] = [];
			if (get(students, "data", []).length > get(tuitionPeriodInfo, "tuition_fees", []).length) {
				get(students, "data", []).forEach((st) => {
					const index = get(tuitionPeriodInfo, "tuition_fees", []).findIndex((tuition) => tuition.student_id === st.id);
					if (index === -1 && moment(st.admission_date).isSameOrAfter(moment(get(tuitionPeriodInfo, "from_date", "")))) newList.push(st);
				})
			}
			setNewStudentList(newList);
		}
	}, [students, tuitionPeriodInfo]);


	function handleTraferDebt(tuition: TuitionFeeType) {

		confirm({
			title: "Xác nhận chuyển nợ sang chu kỳ mới",
			content: "Lưu ý để chuyển nợ bắt buộc phải tồn tại một chu kỳ mới tương ứng của học sinh!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				const debt_tranfer = feesPerStudent[tuition.id] - +tuition.fixed_deduction - +tuition.flexible_deduction;
				dispatch(actionTuitionFeeTranferDebt({ debt_tranfer: String(debt_tranfer), tuition_fee_id: tuition.id })).finally(() => {
					dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
				})
			}
		})
	}

	function handlePaidConfirm(tuition: TuitionFeeType) {
		confirm({
			title: "Xác nhận đã thanh toán",
			content: "Lưu ý sau khi xác nhận đã thanh toán sẽ không thể sửa được bảng học phí!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				dispatch(actionUpdateTuitionFee({ data: { status: 1 }, tuition_id: get(tuition, "id", 0) })).finally(() => {
					dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
				})
			}
		})
	}

	function handleSendNotification(index:number){
		setShowNotiForm(true);
		setNotiIndex(index);
	}

	//render ui
	const renderContent = (column = 2) => (
		<Descriptions
			size="middle"
			column={column}
		>
			<Descriptions.Item label="Lớp học"><a>{get(tuitionPeriodInfo, "class.name", "")}</a></Descriptions.Item>
			<Descriptions.Item label="Chu kỳ">
				<strong>{moment(get(tuitionPeriodInfo, "from_date", "")).format(dateFormat)} - {" "}
					{moment(get(tuitionPeriodInfo, "to_date", "")).format(dateFormat)}</strong>
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
				<span style={{ color: "#e74c3c" }}>{get(tuitionPeriodInfo, "lessons", []).length}</span>
			</Descriptions.Item>
			<Descriptions.Item label="Trạng thái">
				<span style={{ color: "#e74c3c" }}>{get(tuitionPeriodInfo, "active", 0) === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Deactive</Tag>}</span>
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
				title="Học phí thu được"
				value={formatCurrency(estTuitionFee)}
				style={{
					marginRight: 32,
					fontWeight: 600,
					color: "#3498db"
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
			key: "student_name",
			render: function nameCol(student_id: number): JSX.Element {
				return <strong>{studentList.find((st) => st.id === student_id)?.name}</strong>;
			},
		},
		{
			title: "Ngày sinh",
			dataIndex: "student_id",
			key: "student_birthday",
			render: function nameCol(student_id: number): JSX.Element {
				return <>{studentList.find((st) => st.id === student_id)?.birthday}</>;
			},
		},
		{
			title: "Tổng học phí",
			dataIndex: "residual",
			key: "residual",
			render: function amountCol(_: number, feeItem: TuitionFeeType): JSX.Element {
				return (
					<span style={{ color: "#2980b9", fontWeight: 700 }}>
						{numeral(feesPerStudent[feeItem.id]! + +feeItem.prev_debt - +feeItem.fixed_deduction - +feeItem.flexible_deduction).format("0,0")}
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
						{status === 0 ? <Tag color="red">Chư nộp</Tag> : status === 1 ? <Tag color="green">Đã nộp</Tag> : <Tag color="orange">Chuyển nợ</Tag>}
					</>
				)
			}
		},
		{
			width: "5%",
			title: "Action",
			key: "action",
			render: function ActionCol(text:string, record: TuitionFeeType, index:number): JSX.Element {
				return (
					<>
						<Space>
							<Tooltip title="Chỉnh sửa">
								<EditTuitionFeeModal tuitionFeeInfo={record} periodInfo={tuitionPeriodInfo} stName={studentList.find((st) => st.id === record.student_id)?.name} />
							</Tooltip>
							<Tooltip title="Gửi thông báo cho phụ huynh">
								<Button
									type="link"
									onClick={() => handleSendNotification(index)}
									icon={<NotificationOutlined />}
								/>
							</Tooltip>
							{
								get(tuitionPeriodInfo, "active", 0) === 0 ?
									<Tooltip title="Chuyển nợ">
										<Button disabled={record.status === 0 ? false : true}
											icon={<TransactionOutlined style={{ color: record.status === 0 ? "#e67e22" : "#bdc3c7" }} />}
											type="link"
											onClick={() => handleTraferDebt(record)}
										/>
									</Tooltip> : ""

							}
							<Tooltip title="Xác nhận đã nộp">
								<Button disabled={record.status === 0 ? false : true}
									icon={<CreditCardOutlined style={{ color: record.status === 0 ? "#27ae60" : "#bdc3c7" }} />}
									type="link"
									onClick={() => handlePaidConfirm(record)}
								/>
							</Tooltip>
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
				title="Chi tiết chu kỳ học phí"
				style={{ backgroundColor: "white" }}
				extra={<Button type="primary" icon={<NotificationOutlined />}>Gửi thông báo</Button>}
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
				{/* <SendNotiModal tuitionIndex={notiIndex} periodTuitionInfo={tuitionPeriodInfo} */}
			</PageHeader>
		</Layout.Content>
	);
}


// SendNotiModal component
function SendNotiModal(prop: {
	tuitionIndex: number,
	isToAll: boolean,
	periodTuitionInfo: PeriodTuitionType
	show: boolean,
	setShow: (param: boolean) => void
}): JSX.Element {
	const { tuitionIndex, periodTuitionInfo, isToAll, show, setShow } = prop;

	const dispatch = useAppDispatch();

	const deleteStatus = useSelector((state: RootState) => state.periodTuitionReducer.deletePeriodTuitionStatus);


	function handleSendNotification() {
		console.log("Send notification", tuitionIndex)
		setShow(false);
	}

	return (
		<>

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


