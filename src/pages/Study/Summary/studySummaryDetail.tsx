import { GiftOutlined } from "@ant-design/icons"
import {
	Button,
	Descriptions,
	Image,
	Layout,
	PageHeader,
	Space,
	Table,
	Tag,
	Typography,
} from "antd"
import Modal from "antd/lib/modal/Modal"
import { StudentGiftType, StudySummaryType } from "interface"
import { get } from "lodash"
import moment from "moment"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import { actionGetClassSummaryBoard } from "store/classes/slice"
import { RootState, useAppDispatch } from "store/store"
import { actionGetStudyGifts } from "store/study-summary/slice"

const { Title } = Typography

interface SummaryType {
	date: string
	conduct_point: number
	test_points: number[]
}

export function StudySummaryDetail(): JSX.Element {
	const location = useLocation()
	const dispatch = useAppDispatch()
	const history = useHistory()
	const summaryInfo = get(
		location,
		"state.summaryInfo",
		null
	) as StudySummaryType
	const [loading, setLoading] = useState(false)
	const [summaryBoardDataSource, setSummaryDataSource] = useState<any>({})
	const [summaryBoardAvgData, setSummaryBoardAvgData] = useState<{
		[id: number]: { final_conduct_point: number; avg_test_points: number }
	}>({})
	const [summaryBoardDateList, setSummaryBoardDateList] = useState<string[]>([])

	//application state
	const summaryBoard = useSelector(
		(state: RootState) => state.classReducer.summaryBoard
	)
	const getSummaryBoardStatus = useSelector(
		(state: RootState) => state.classReducer.getSummaryBoardStatus
	)
	// get list summary board data
	useEffect(() => {
		if (summaryInfo) {
			setLoading(true)
			dispatch(
				actionGetClassSummaryBoard({
					class_id: summaryInfo.class_id,
					from_date: summaryInfo.from_date,
					to_date: summaryInfo.to_date,
				})
			)
		}
	}, [dispatch, summaryInfo])

	// handle summary data received
	useEffect(() => {
		if (getSummaryBoardStatus === "error") {
			setLoading(false)
			return
		}
		if (summaryBoard) {
			const summaryBoardData: {
				[id: number]: {
					[date: string]: { conduct_point: number; test_points: number[] }
				}
			} = {}
			const dateList: string[] = []
			const finalScore: {
				[id: number]: { final_conduct_point: number; avg_test_points: number }
			} = {}
			summaryBoard.forEach((student) => {
				const summaryBoardStudentData: {
					[date: string]: { conduct_point: number; test_points: number[] }
				} = {}
				let score = 0
				student.attendances.forEach((attendance) => {
					score += attendance.conduct_point ?? 0
					const dateKey = attendance.lesson.date
					if (dateList.findIndex((date) => date === dateKey) === -1)
						dateList.push(dateKey)
					summaryBoardStudentData[dateKey] = {
						conduct_point: attendance.conduct_point ?? 0,
						test_points: [],
					}
				})
				let total = 0
				let count = 0
				student.test_results.forEach((test_result) => {
					const dateKey =
						test_result.test?.lesson?.date ?? test_result.test.date
					total += +test_result.point ?? 0
					count++
					if (dateList.findIndex((date) => date === dateKey) === -1)
						dateList.push(dateKey)
					if (summaryBoardStudentData[dateKey]) {
						summaryBoardStudentData[dateKey].test_points.push(
							+test_result.point
						)
					} else {
						summaryBoardStudentData[dateKey] = {
							conduct_point: 0,
							test_points: [+test_result.point],
						}
					}
				})
				summaryBoardData[student.id] = summaryBoardStudentData
				finalScore[student.id] = {
					final_conduct_point: score + 10,
					avg_test_points: count > 0 ? total / count : 0,
				}
			})
			setSummaryDataSource(summaryBoardData)
			setSummaryBoardAvgData(finalScore)
			setSummaryBoardDateList(dateList)
			setLoading(false)
		}
	}, [summaryBoard, getSummaryBoardStatus])

	//create table columns
	let columns: any[] = [
		{
			title: "Học sinh",
			dataIndex: "name",
			key: "name",
			width: 200,
			fixed: "left",
			render: function col(text: string): JSX.Element {
				return <strong>{text}</strong>
			},
		},
	]
	summaryBoardDateList.length > 0 &&
		summaryBoardDateList.forEach((date) => {
			columns.push({
				title: `${moment(date).format("DD/MM/YY")}`,
				dataIndex: "",
				width: 135,
				key: `${date}`,
				render: function col(_: string, record: StudySummaryType): JSX.Element {
					const studentSummaryBoard = summaryBoardDataSource[record.id]
					if (!studentSummaryBoard) return <></>
					let conduct_point = 0
					let test_points: number[] = []
					if (studentSummaryBoard[date]) {
						conduct_point = studentSummaryBoard[date].conduct_point
						test_points = studentSummaryBoard[date].test_points
					}
					return (
						<div style={{ textAlign: "center" }}>
							<span style={{ color: "#e67e22", height: 28 }}>
								{conduct_point !== 0 ? conduct_point : "-"}
							</span>{" "}
							|{" "}
							<span style={{ color: "#3498db" }}>
								{test_points.length > 0
									? test_points.map((tp, index) => (
											<span key={index}>{`${tp} ${
												index < test_points.length - 1 ? ", " : ""
											}`}</span>
									  ))
									: "-"}
							</span>
						</div>
					)
				},
			})
		})

	columns = columns.concat([
		{
			title: "Điểm HK",
			dataIndex: "total_conduct_point",
			key: "total_conduct_point",
			width: 80,
			fixed: "right",
			render: function col(_: number, record: StudySummaryType): JSX.Element {
				return (
					<strong style={{ color: "#e67e22" }}>
						{summaryBoardAvgData[record.id]?.final_conduct_point ?? 0}
					</strong>
				)
			},
		},
		{
			title: "Điểm HT",
			dataIndex: "test_point_avg",
			key: "test_point_avg",
			width: 80,
			fixed: "right",
			render: function col(_: number, record: StudySummaryType): JSX.Element {
				return (
					<strong style={{ color: "#3498db" }}>
						{summaryBoardAvgData[record.id]?.avg_test_points ?? 0}
					</strong>
				)
			},
		},
		{
			title: "Điểm TK",
			dataIndex: "tk",
			sorter: (a: StudySummaryType, b: StudySummaryType) => {
				const aScore =
					summaryBoardAvgData[a.id]?.avg_test_points > 0
						? (summaryBoardAvgData[a.id]?.final_conduct_point +
								summaryBoardAvgData[a.id]?.avg_test_points * 3) /
						  4
						: summaryBoardAvgData[a.id]?.final_conduct_point
				const bScore =
					summaryBoardAvgData[b.id]?.avg_test_points > 0
						? (summaryBoardAvgData[b.id]?.final_conduct_point +
								summaryBoardAvgData[b.id]?.avg_test_points * 3) /
						  4
						: summaryBoardAvgData[b.id]?.final_conduct_point
				return aScore - bScore
			},
			key: "tl",
			width: 80,
			fixed: "right",
			render: function col(_: string, record: StudySummaryType): JSX.Element {
				return (
					<strong style={{ color: "#27ae60" }}>
						{summaryBoardAvgData[record.id]?.avg_test_points > 0
							? Math.floor(
									((summaryBoardAvgData[record.id]?.final_conduct_point +
										summaryBoardAvgData[record.id]?.avg_test_points * 3) /
										4) *
										100
							  ) / 100
							: summaryBoardAvgData[record.id]?.final_conduct_point}
					</strong>
				)
			},
		},
	])

	// rendering
	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header-responsive"
				onBack={() => history.goBack()}
				title="Chi tiết bảng tổng kết"
				extra={<StudentGiftsModal summaryInfo={summaryInfo} />}
			/>
			<div style={{ paddingLeft: 20 }}>
				<Descriptions bordered>
					<Descriptions.Item label="Lớp">
						<Button
							type="link"
							onClick={() =>
								history.push({
									pathname: `/study/${get(summaryInfo, "class.id", "1")}`,
									state: { classInfo: get(summaryInfo, "class", "") },
								})
							}
						>
							{get(summaryInfo, "class.name", "")}
						</Button>
					</Descriptions.Item>
					{/* <Descriptions.Item label="Giáo viên">Hangzhou, Zhejiang</Descriptions.Item> */}
					<Descriptions.Item label="Số học sinh">
						{get(summaryInfo, "class.students_num", 0)}
					</Descriptions.Item>
					<Descriptions.Item span={3} label="Khoảng thời gian">
						<strong>
							{moment(get(summaryInfo, "from_date", "")).format("DD/MM/YYYY")} -{" "}
							{moment(get(summaryInfo, "to_date", "")).format("DD/MM/YYYY")}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item span={3} label="Ghi chú">
						Điểm tổng kết = (điểm trung bình bài tập * 3 + điểm hạnh kiểm) / 4
					</Descriptions.Item>
				</Descriptions>
				<Title level={4} style={{ marginTop: 20, marginBottom: 20 }}>
					Bảng tổng kết
				</Title>
				<Table
					rowKey="id"
					loading={loading}
					bordered
					columns={columns}
					dataSource={summaryBoard}
					pagination={{ defaultPageSize: 100 }}
					scroll={{ x: "calc(700px + 50%)" }}
				/>
			</div>
		</Layout.Content>
	)
}

function StudentGiftsModal(props: {
	summaryInfo: StudySummaryType
}): JSX.Element {
	const { summaryInfo } = props
	const dispatch = useAppDispatch()
	const [show, setShow] = useState(false)

	//application state
	const studentGifts = useSelector(
		(state: RootState) => state.studySummaryReducer.studentGifts
	)
	const getStudentGiftsStatus = useSelector(
		(state: RootState) => state.studySummaryReducer.getStudyGiftsState
	)

	useEffect(() => {
		if (summaryInfo) {
			dispatch(actionGetStudyGifts({ study_summary_board_id: summaryInfo.id }))
		}
	}, [dispatch, summaryInfo])

	const cols: any[] = [
		{
			title: "Học sinh",
			key: "student",
			dataIndex: "",
			render: function StudentCol(
				_: string,
				record: StudentGiftType
			): JSX.Element {
				return <strong>{get(record, "student.name", "")}</strong>
			},
		},
		{
			title: "Quà chọn",
			key: "gift",
			dataIndex: "",
			render: function GiftCol(
				_: string,
				record: StudentGiftType
			): JSX.Element {
				return (
					<Space>
						<Image
							width={60}
							src={get(record, "gift.photo.url", "error")}
							style={{ marginRight: 10 }}
						/>
						<span>{get(record, "gift.name", "")}</span>
					</Space>
				)
			},
		},
		{
			title: "Điểm điều kiện",
			key: "condition_point",
			dataIndex: "",
			render: function StatusCol(
				_: string,
				record: StudentGiftType
			): JSX.Element {
				return (
					<strong style={{ color: "#109444" }}>
						{get(record, "gift.condition_point", "")}
					</strong>
				)
			},
		},
		{
			title: "Trạng thái",
			key: "status",
			dataIndex: "status",
			render: function statusCol(status: number): JSX.Element {
				return (
					<Tag color={status === 1 ? "green" : "red"}>
						{status === 1 ? "Đã nhận" : "Chưa nhận"}
					</Tag>
				)
			},
		},
	]

	return (
		<>
			<Button
				icon={<GiftOutlined />}
				type="primary"
				onClick={() => setShow(true)}
			>
				DS chọn quà tặng
			</Button>
			<Modal
				visible={show}
				width={1000}
				title="Danh sách chọn quà tặng"
				onCancel={() => setShow(false)}
				onOk={() => setShow(false)}
			>
				<Table
					columns={cols}
					dataSource={get(studentGifts, "data", [])}
					loading={getStudentGiftsStatus === "loading" ? true : false}
				/>
			</Modal>
		</>
	)
}
