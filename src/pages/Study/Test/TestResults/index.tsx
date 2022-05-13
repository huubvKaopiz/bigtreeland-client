import React, { useEffect, useState } from "react"
import { FileType, StudentType, TestResultsType, TestType } from "interface"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "store/store"
import ReactPlayer from "react-player"
import { actionGetStudents } from "store/students/slice"
import { Button, Space, Table, Tag, Tooltip, Image, Modal } from "antd"
import {
	NotificationOutlined,
	IssuesCloseOutlined,
	PauseCircleFilled,
	PlayCircleFilled,
	ExclamationCircleOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons"
import moment from "moment"
import get from "lodash/get"
import { defaul_image_base64, NOTIFI_URIS } from "utils/const"
import UpdateModal from "./updateModal"
import {
	actionDeleteTestResult,
	resetUpdateTestResultsStatus,
} from "store/test-results/slice"
import { actionGetTest } from "store/testes/slice"
import SendNotificationModal from "components/SendNotificationModal"

const { confirm } = Modal

export interface TestResultDataType {
	student: StudentType
	test_result: TestResultsType | undefined
	tranferred: boolean
}

export default function (props: { testInfo: TestType | null }): JSX.Element {
	const { testInfo } = props
	const dispatch = useDispatch()
	const [testResultData, setTestResultData] = useState<TestResultDataType[]>([])
	const [showAddTestCommentModal, setShowAddTestCommentModal] = useState(false)
	const [showSendNotiModal, setShowSendNotiModal] = useState(false)
	const [testResultSelected, setTestResultSelected] =
		useState<TestResultDataType | null>(null)
	const [videoPlaying, setVideoPlaying] = useState(false)
	const [videoPlayingId, setVideoPlayingId] = useState(-1)

	const students = useSelector(
		(state: RootState) => state.studentReducer.students
	)
	const updateTestResultState = useSelector(
		(state: RootState) => state.testResultsReducer.updateTestResultStatus
	)
	const addTestResultState = useSelector(
		(state: RootState) => state.testResultsReducer.addTestResultStatus
	)

	const deleteTestResultState = useSelector(
		(state: RootState) => state.testResultsReducer.deleteTestResultStatus
	)

	// get the testinfo following the test_id
	useEffect(() => {
		if (testInfo) {
			dispatch(actionGetStudents({ class_id: testInfo.class_id, per_page: 50 }))
		}
	}, [testInfo])

	useEffect(() => {
		if (testInfo && students) {
			const testRsData: TestResultDataType[] = []
			const mapped: number[] = []
			// check if the student has submited or not
			students.data?.forEach((st) => {
				const rs = testInfo.test_results.find(
					(rs_el) => rs_el.student_id === st.id
				)
				if (rs) mapped.push(rs.id)
				testRsData.push({
					student: st,
					test_result: rs,
					tranferred: false,
				})
			})
			// in case of student is tranfered to a different class
			if (mapped.length < testInfo.test_results.length) {
				testInfo.test_results.forEach((ts_el) => {
					const ts = mapped.find((mapped_el) => mapped_el === ts_el.id)
					if (ts === undefined)
						testRsData.push({
							student: ts_el.student,
							test_result: ts_el,
							tranferred: true,
						})
				})
			}
			setTestResultData(testRsData)
		}
	}, [students])

	// When the updatting is complete, reload the data.
	useEffect(() => {
		if (
			updateTestResultState === "success" ||
			addTestResultState === "success" ||
			deleteTestResultState === "success"
		) {
			setShowAddTestCommentModal(false)
			dispatch(resetUpdateTestResultsStatus())

			if (testInfo) {
				dispatch(actionGetTest(testInfo.id))
			}
		}
	}, [
		dispatch,
		updateTestResultState,
		addTestResultState,
		deleteTestResultState,
	])

	const handleCancelTest = (id: number) => {
		if (id > 0) {
			confirm({
				title: "Xác nhận huỷ bỏ bài làm này?",
				icon: <ExclamationCircleOutlined />,
				onOk() {
					dispatch(actionDeleteTestResult(id))
				},
			})
		}
	}

	const testResultCols: any[] = [
		{
			title: "STT",
			dataIndex: "stt",
			key: "stt",
			with: 10,
			fixed: "left",
			render: function col(
				_: string,
				record: TestResultDataType,
				index: number
			): JSX.Element {
				return <span>{index + 1}</span>
			},
		},
		Table.EXPAND_COLUMN,
		{
			title: "Name",
			dataIndex: "",
			key: "name",
			width: 240,
			fixed: "left",
			render: function nameCol(
				_: string,
				record: TestResultDataType
			): JSX.Element {
				return (
					<>
						<strong>{record.student.name}</strong>
						{record.tranferred && (
							<span style={{ fontStyle: "italic", color: "#95a5a6" }}>
								{" "}
								(đã chuyển lớp)
							</span>
						)}
					</>
				)
			},
		},
		{
			title: "Ngày nộp",
			dataIndex: "",
			key: "date",
			render: function nameCol(
				_: string,
				record: TestResultDataType
			): JSX.Element {
				return (
					<span>
						{record.test_result ? (
							moment(record.test_result.updated_at).format("DD-MM-YYYY HH:mm")
						) : (
							<Tag color="red">Chưa nộp</Tag>
						)}
					</span>
				)
			},
		},
		{
			title: "Điểm",
			dataIndex: "",
			key: "point",
			render: function nameCol(
				_: string,
				record: TestResultDataType
			): JSX.Element {
				return (
					<strong style={{ color: "#e67e22" }}>
						{record.test_result ? record.test_result.point : ""}
					</strong>
				)
			},
		},
		{
			title: "Nhận xét",
			dataIndex: "",
			key: "comment",
			render: function nameCol(
				_: string,
				record: TestResultDataType
			): JSX.Element {
				return (
					<span>
						{record.test_result ? record.test_result.teacher_comment : ""}
					</span>
				)
			},
		},
		{
			title: "",
			dataIndex: "action",
			key: "address",
			width: 140,
			render: function actionCol(
				text: string,
				record: TestResultDataType
			): JSX.Element {
				return (
					<>
						<Tooltip title="Chấm và chữa bài">
							<Button
								type="link"
								icon={<IssuesCloseOutlined style={{ color: "#2ecc71" }} />}
								onClick={() => {
									setShowAddTestCommentModal(true)
									setTestResultSelected(record)
								}}
							/>
						</Tooltip>
						<Tooltip title="Nhắc nhở nộp bài">
							<Button
								type="link"
								icon={<NotificationOutlined />}
								disabled={record.test_result !== undefined}
								onClick={() => {
									setShowSendNotiModal(true)
									setTestResultSelected(record)
								}}
							/>
						</Tooltip>

						<Tooltip title="Huỷ bài làm">
							<Button
								disabled={record.test_result == null}
								type="link"
								icon={
									<CloseCircleOutlined
										style={{
											color: record.test_result ? "#f5222d" : "#bfbfbf",
										}}
									/>
								}
								onClick={() => handleCancelTest(record.test_result?.id || 0)}
							/>
						</Tooltip>
					</>
				)
			},
		},
	]
	return (
		<>
			<Table
				// bordered
				rowKey={(record) => record.student.id}
				dataSource={testResultData}
				columns={testResultCols}
				expandable={{
					expandedRowRender: (record) => (
						<div>
							{record.test_result && (
								<>
									{record.test_result.correct_link && (
										<div style={{ marginBottom: 10 }}>
											<h1>Link chữa bài:</h1>
											<a href={record.test_result.correct_link}>
												{record.test_result.correct_link}
											</a>
										</div>
									)}
									{record.test_result.result_files.length > 0 && (
										<>
											<h1 style={{ marginBottom: 10 }}>Files bài làm:</h1>
											<Space size={[10, 10]} wrap>
												<Image.PreviewGroup>
													{get(record, "test_result.result_files", []).map(
														(file: FileType, index: number) => (
															<div key={index}>
																{file.type === "mp4" || file.type === "mov" ? (
																	<div>
																		<ReactPlayer
																			loop={true}
																			style={{ width: 200, height: "auto" }}
																			url={file.url}
																			playing={
																				videoPlaying &&
																				videoPlayingId === file.id
																			}
																		/>
																		<div
																			style={{
																				justifyContent: "center",
																				alignItems: "center",
																				display: "flex",
																				fontSize: 18,
																				marginTop: 10,
																				color: "#e67e22",
																			}}
																		>
																			{videoPlaying ? (
																				<PauseCircleFilled
																					onClick={() => {
																						setVideoPlaying(!videoPlaying)
																						setVideoPlayingId(file.id)
																					}}
																				/>
																			) : (
																				<PlayCircleFilled
																					onClick={() => {
																						setVideoPlaying(!videoPlaying)
																						setVideoPlayingId(file.id)
																					}}
																				/>
																			)}
																		</div>
																	</div>
																) : (
																	<Image
																		width={150}
																		height={150}
																		style={{ objectFit: "cover" }}
																		alt="logo"
																		src={file.url}
																		fallback={defaul_image_base64}
																	/>
																)}
															</div>
														)
													)}
												</Image.PreviewGroup>
											</Space>
										</>
									)}
									{record.test_result.correct_files.length > 0 && (
										<>
											<h1 style={{ marginBottom: 10 }}>Ảnh chữa bài:</h1>
											<Space
												style={{ backgroundColor: "white" }}
												size={[10, 10]}
												wrap
											>
												<Image.PreviewGroup>
													{get(record, "test_result.correct_files", []).map(
														(photo: FileType, index: number) => (
															<Image
																key={index}
																width={100}
																height={100}
																style={{ objectFit: "cover" }}
																alt="logo"
																src={photo.url}
																fallback={defaul_image_base64}
															/>
														)
													)}
												</Image.PreviewGroup>
											</Space>
										</>
									)}
								</>
							)}
						</div>
					),
				}}
				pagination={{ pageSize: 40 }}
			/>
			<UpdateModal
				key="cmt"
				test_id={testInfo && testInfo.id}
				testResultInfo={testResultSelected}
				show={showAddTestCommentModal}
				setShow={setShowAddTestCommentModal}
			/>
			<SendNotificationModal
				title="Nhắc nhở nộp bài tập"
				uri={NOTIFI_URIS.SUBMIT_TEST_RESULT_REMIND}
				students={
					testResultSelected ? new Array(testResultSelected.student) : []
				}
				show={showSendNotiModal}
				setShow={setShowSendNotiModal}
			/>
		</>
	)
}
