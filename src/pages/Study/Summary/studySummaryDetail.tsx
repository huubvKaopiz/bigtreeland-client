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
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import { actionGetClassSummaryBoard } from "store/classes/slice"
import { RootState, useAppDispatch } from "store/store"
import { actionGetStudyGifts } from "store/study-summary/slice"
import { isAfter, isBefore } from "utils/dateUltils"

const { Title } = Typography

export default function StudySummaryDetail(): JSX.Element {
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
					if(test_result.test?.lesson?.date && isBefore(test_result?.test?.lesson?.date, summaryInfo.from_date)) return;
					const dateKey =
						test_result.test?.lesson?.date ?? test_result.test.date;
					const test_point = test_result.point
						? +test_result.point.replace(",", ".")
						: 0
					total += test_point
					count++
					if (dateList.findIndex((date) => date === dateKey) === -1)
						dateList.push(dateKey)
					if (summaryBoardStudentData[dateKey]) {
						summaryBoardStudentData[dateKey].test_points.push(test_point)
					} else {
						summaryBoardStudentData[dateKey] = {
							conduct_point: 0,
							test_points: [test_point],
						}
					}
				})
				summaryBoardData[student.id] = summaryBoardStudentData
				finalScore[student.id] = {
					final_conduct_point: score + 10,
					avg_test_points:
						count > 0 ? Math.floor((total / count) * 100) / 100 : 0,
				}
			})
			setSummaryDataSource(summaryBoardData)
			setSummaryBoardAvgData(finalScore)
			dateList.sort((a,b) => Date.parse(a) - Date.parse(b))
			setSummaryBoardDateList(dateList)
			setLoading(false)
		}
	}, [summaryBoard, getSummaryBoardStatus, summaryInfo.from_date])

	//create table columns
	let columns: any[] = [
		{
			title: "STT",
			key: "stt",
			width:60,
			render:(_:string,record:StudySummaryType,index) => <span>{index + 1}</span>
		},
		{
			title: "H???c sinh",
			dataIndex: "name",
			key: "name",
			width: 200,
			fixed: "left",
			render: function col(text: string) {
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
				render: function col(_: string, record: StudySummaryType) {
					const studentSummaryBoard = summaryBoardDataSource[record.id]
					if (!studentSummaryBoard) return null;
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
			title: "??i???m HK",
			dataIndex: "total_conduct_point",
			key: "total_conduct_point",
			width: 80,
			fixed: "right",
			render: function col(_: number, record: StudySummaryType) {
				return (
					<strong style={{ color: "#e67e22" }}>
						{summaryBoardAvgData[record.id]?.final_conduct_point ?? 0}
					</strong>
				)
			},
		},
		{
			title: "??i???m HT",
			dataIndex: "test_point_avg",
			key: "test_point_avg",
			width: 80,
			fixed: "right",
			render: function col(_: number, record: StudySummaryType) {
				return (
					<strong style={{ color: "#3498db" }}>
						{summaryBoardAvgData[record.id]?.avg_test_points ?? 0}
					</strong>
				)
			},
		},
		{
			title: "??i???m TK",
			dataIndex: "tk",
			defaultSortOrder: 'descend',
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
			render: function col(_: string, record: StudySummaryType) {
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
				title="Chi ti???t b???ng t???ng k???t"
				extra={<StudentGiftsModal summaryInfo={summaryInfo} />}
			/>
			<div style={{ paddingLeft: 20 }}>
				<Descriptions bordered>
					<Descriptions.Item label="L???p">
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
					{/* <Descriptions.Item label="Gi??o vi??n">Hangzhou, Zhejiang</Descriptions.Item> */}
					<Descriptions.Item label="S??? h???c sinh">
						{get(summaryInfo, "class.students_num", 0)}
					</Descriptions.Item>
					<Descriptions.Item span={3} label="Kho???ng th???i gian">
						<strong>
							{moment(get(summaryInfo, "from_date", "")).format("DD/MM/YYYY")} -{" "}
							{moment(get(summaryInfo, "to_date", "")).format("DD/MM/YYYY")}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item span={3} label="Ghi ch??">
						??i???m t???ng k???t = (??i???m trung b??nh b??i t???p * 3 + ??i???m h???nh ki???m) / 4
					</Descriptions.Item>
				</Descriptions>
				<Title level={4} style={{ marginTop: 20, marginBottom: 20 }}>
					B???ng t???ng k???t
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
}) {
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
			title: "STT",
			key: "stt",
			render:(_:string,record:StudentGiftType,index) => <span>{index}</span>
		},
		{
			title: "H???c sinh",
			key: "student",
			dataIndex: "",
			render: function StudentCol(
				_: string,
				record: StudentGiftType
			) {
				return <strong>{get(record, "student.name", "")}</strong>
			},
		},
		{
			title: "Qu?? ch???n",
			key: "gift",
			dataIndex: "",
			render: function GiftCol(
				_: string,
				record: StudentGiftType
			) {
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
			title: "??i???m ??i???u ki???n",
			key: "condition_point",
			dataIndex: "",
			render: function StatusCol(
				_: string,
				record: StudentGiftType
			) {
				return (
					<strong style={{ color: "#109444" }}>
						{get(record, "gift.condition_point", "")}
					</strong>
				)
			},
		},
		{
			title: "Tr???ng th??i",
			key: "status",
			dataIndex: "status",
			render: function statusCol(status: number) {
				return (
					<Tag color={status === 1 ? "green" : "red"}>
						{status === 1 ? "???? nh???n" : "Ch??a nh???n"}
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
				DS ch???n qu?? t???ng
			</Button>
			<Modal
				visible={show}
				width={1000}
				title="Danh s??ch ch???n qu?? t???ng"
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
