import { PlusOutlined, UploadOutlined } from "@ant-design/icons"
import { Button, DatePicker, Form, Input, Modal, Select, Space } from "antd"
import FileSelectModal from "components/FileSelectModal"
import { ClassType, FileType, LessonType } from "interface"
import { get } from "lodash"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { resetRecentFileTestUploaded } from "store/files/slice"
import { actionGetLessons } from "store/lesson/slice"
import { RootState, useAppDispatch } from "store/store"
import { actionAddTest, actionGetTestes } from "store/testes/slice"
// import { dummyRequest } from "utils/ultil";
const { RangePicker } = DatePicker
export default function AddTest(props: {
	classInfo: ClassType | null
}): JSX.Element {
	const { classInfo } = props
	const dispatch = useAppDispatch()
	const [show, setShow] = useState(false)
	const [submiting, setSubmiting] = useState(false)
	const [showSelect, setShowSelect] = useState(false)
	const [resultFilesModal, setResultFilesModal] = useState(false)
	const [fileSelected, setFileSelected] = useState<Array<FileType>>([])
	const [resultFiles, setResultFiles] = useState<Array<FileType>>([])

	const lessonList = useSelector(
		(state: RootState) => state.lessonReducer.lessons
	)
	const getLessonListState = useSelector(
		(state: RootState) => state.lessonReducer.getLessonsState
	)

	useEffect(() => {
		if (classInfo) {
			const from_date = moment().startOf("month").format("YYYY-MM-DD")
			const to_date = moment().endOf("month").format("YYYY-MM-DD")
			dispatch(actionGetLessons({ from_date, to_date, class_id: classInfo.id }))
		}
	}, [classInfo])

	function handleFileSelected(filesSelected: Array<FileType>) {
		setFileSelected(filesSelected)
	}

	function handleResultFileSelected(filesSelected: Array<FileType>) {
		setResultFiles(filesSelected)
	}

	function handleSubmit(values: any) {
		setSubmiting(true)
		const listIdFile = fileSelected.map((file) => file.id) as number[]
		const listResultsFileId = resultFiles.map((file) => file.id) as number[]
		const data = {
			class_id: get(classInfo, "id", 0),
			title: values.title,
			date: moment(values.date).format("YYYY-MM-DD"),
			content_files: listIdFile,
			description: values.description,
			content_link: values.content_link,
			result_files: listResultsFileId,
			result_link: values.result_link,
			lesson_id: values.lesson_id,
		}
		dispatch(actionAddTest(data))
			.then(() => {
				setShow(false)
				dispatch(resetRecentFileTestUploaded())
				dispatch(actionGetTestes({ class_id: get(classInfo, "id", 0) }))
			})
			.finally(() => setSubmiting(false))
	}

	return (
		<>
			<Button
				icon={<PlusOutlined />}
				type="primary"
				onClick={() => setShow(true)}
			>
				Tạo bài test
			</Button>
			<Modal
				visible={show}
				closable
				onCancel={() => setShow(false)}
				title="Tạo bài test mới"
				width={1000}
				footer={[
					<Button key="btncancle" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button
						loading={submiting}
						key="btnok"
						type="primary"
						htmlType="submit"
						form="aForm"
					>
						Lưu lại
					</Button>,
				]}
			>
				<Form
					id="aForm"
					initialValues={{ date: moment() }}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 18 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
					<Form.Item
						label="Tiêu đề"
						name="title"
						rules={[
							{
								required: true,
								message: "Tiêu đề bài test không được bỏ trống",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item label="Buổi học">
						<Space>
							<Form.Item>
								<DatePicker
									picker="month"
									format={"MMMM"}
									defaultValue={moment()}
									onChange={(value) => {
										if (value && classInfo) {
											const from_date = value
												.startOf("month")
												.format("YYYY-MM-DD")
											const to_date = value.endOf("month").format("YYYY-MM-DD")
											dispatch(
												actionGetLessons({
													from_date,
													to_date,
													class_id: classInfo.id,
												})
											)
										}
									}}
								/>
							</Form.Item>
							<Form.Item name="lesson_id">
								<Select
									placeholder="Chọn buổi học"
									style={{ width: 600 }}
									allowClear
									loading={getLessonListState === "loading"}
									disabled={getLessonListState === "loading"}
									filterOption={(input, option) =>
										(option?.label as string)
											?.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
								>
									{get(lessonList, "data", []).map((lesson: LessonType) => {
										return (
											<Select.Option
												key={lesson.id}
												value={lesson.id}
												// label={}
											>
												<>
													<a>{lesson.title} </a>{" "}
													<span
														style={{ fontStyle: "italic", color: "#7f8c8d" }}
													>
														{moment(lesson.date, "YYYY-MM-DD").format(
															"DD-MM-YYYY"
														)}
													</span>
												</>
											</Select.Option>
										)
									})}
								</Select>
							</Form.Item>
						</Space>
					</Form.Item>

					<Form.Item label="Ngày" name="date">
						<DatePicker format="DD-MM-YYYY" />
					</Form.Item>
					<Form.Item label="Mô tả bài test" name="description">
						<Input />
					</Form.Item>
					<Form.Item label="Link đề bài" name="content_link">
						<Input />
					</Form.Item>
					<Form.Item label="Chọn files đề thi">
						<FileSelectModal
							defaultSelected={fileSelected}
							isShow={showSelect}
							okFunction={handleFileSelected}
							closeFunction={() => setShowSelect(false)}
							review={true}
							showSelectedList
						>
							<Button
								onClick={() => setShowSelect(true)}
								type="primary"
								ghost
								size="middle"
								icon={<UploadOutlined />}
							>
								Chọn files
							</Button>
						</FileSelectModal>
					</Form.Item>
					<Form.Item label="Link đáp án" name="result_link">
						<Input />
					</Form.Item>
					<Form.Item label="Chọn files đáp án">
						<FileSelectModal
							defaultSelected={resultFiles}
							isShow={resultFilesModal}
							okFunction={handleResultFileSelected}
							closeFunction={() => setResultFilesModal(false)}
							review={true}
							showSelectedList
						>
							<Button
								onClick={() => setResultFilesModal(true)}
								type="primary"
								ghost
								size="middle"
								icon={<UploadOutlined />}
							>
								Chọn files
							</Button>
						</FileSelectModal>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
