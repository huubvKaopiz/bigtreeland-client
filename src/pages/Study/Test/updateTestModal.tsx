import {
	Button,
	Input,
	Typography,
	Form,
	DatePicker,
	Select,
	Space,
} from "antd"
import { UploadOutlined, FormOutlined } from "@ant-design/icons"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Modal from "antd/lib/modal/Modal"
import { RootState } from "store/store"
import {
	actionGetTest,
	actionResetUpdateTest,
	actionUpdateTest,
} from "store/testes/slice"
import moment from "moment"

import FileSelectModal from "components/FileSelectModal"
import { FileType, LessonType, TestType } from "interface"
import { get } from "lodash"
import { actionGetLessons } from "store/lesson/slice"

export default function UpdateTestModal(props: {
	testInfo: TestType | null
}): JSX.Element {
	const { testInfo } = props
	const dispatch = useDispatch()
	const [utFrom] = Form.useForm()
	const [show, setShow] = useState(false)
	const [resultFilesModal, setResultFilesModal] = useState(false)
	const [showSelect, setShowSelect] = useState(false)
	const [resultFiles, setResultFiles] = useState<Array<FileType>>([])
	const [contentFiles, setContentFiles] = useState<Array<FileType>>([])

	const storeUpdateTestState = useSelector(
		(state: RootState) => state.testReducer.updateTestStatus
	)
	const lessonList = useSelector(
		(state: RootState) => state.lessonReducer.lessons
	)
	const getLessonListState = useSelector(
		(state: RootState) => state.lessonReducer.getLessonsState
	)

	useEffect(() => {
		if (testInfo && storeUpdateTestState === "success") {
			dispatch(actionResetUpdateTest())
			dispatch(actionGetTest(testInfo.id))
			setShow(false)
		}
	}, [dispatch, testInfo, storeUpdateTestState])

	useEffect(() => {
		if (testInfo) {
			utFrom.setFieldsValue({
				result_link: testInfo.result_link,
				content_link: testInfo.content_link,
				title: testInfo.title,
				date: moment(testInfo.date),
				lesson_id: testInfo.lesson_id,
				description: testInfo.description,
			})
			setResultFiles(testInfo.result_files)
			setContentFiles(testInfo.content_files)
		}
	}, [testInfo])

	function handleSubmit(values: any) {
		if (testInfo) {
			const { result_link, content_link, title, date, lesson_id } = values
			const result_files = resultFiles.map((file) => file.id)
			const content_files = contentFiles.map((file) => file.id)
			// Todo update
			dispatch(
				actionUpdateTest({
					id: testInfo.id,
					title,
					date: moment(date).format("YYYY-MM-DD"),
					content_files,
					content_link: content_link === "" ? null : content_link,
					result_link: result_link === "" ? null : result_link,
					result_files,
					lesson_id,
					description: values.description,
				})
			)
		}
	}
	if (testInfo == undefined) return <></>

	return (
		<>
			<Button
				type="primary"
				icon={<FormOutlined />}
				onClick={() => setShow(true)}
			>
				Cập nhật
			</Button>
			<Modal
				title="Cập nhật bài kiểm tra và đáp án"
				visible={show}
				closable
				width={1000}
				onCancel={() => setShow(false)}
				footer={[
					<Button key="btncancle" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button
						loading={storeUpdateTestState === "loading"}
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
					form={utFrom}
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
					<Form.Item label="Đề bài" name="description">
						<Input.TextArea />
					</Form.Item>
					<Form.Item label="Buổi học">
						<Space>
							<Form.Item>
								<DatePicker
									picker="month"
									format={"MMMM"}
									defaultValue={moment()}
									onChange={(value) => {
										if (value && testInfo) {
											const from_date = value
												.startOf("month")
												.format("YYYY-MM-DD")
											const to_date = value.endOf("month").format("YYYY-MM-DD")
											dispatch(
												actionGetLessons({
													from_date,
													to_date,
													class_id: testInfo.class_id,
												})
											)
										}
									}}
								/>
							</Form.Item>
							<Form.Item name="lesson_id">
								<Select
									placeholder="Chọn buổi học"
									style={{ width: 620 }}
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
					<Form.Item label="Link đề bài" name="content_link">
						<Input />
					</Form.Item>
					<Form.Item label="Chọn files đề thi">
						<FileSelectModal
							defaultSelected={contentFiles}
							isShow={showSelect}
							okFunction={setContentFiles}
							closeFunction={() => setShowSelect(false)}
							showSelectedList
							review={true}
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
							okFunction={setResultFiles}
							closeFunction={() => setResultFilesModal(false)}
							showSelectedList
							review={true}
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
