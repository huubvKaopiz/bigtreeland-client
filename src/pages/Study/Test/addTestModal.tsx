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
			content_link: values.content_link,
			result_files: listResultsFileId,
			result_link: values.result_link,
			lesson_id: values.lesson_id,
			description: values.description,
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
				T???o b??i test
			</Button>
			<Modal
				visible={show}
				closable
				onCancel={() => setShow(false)}
				title="T???o b??i test m???i"
				width={1000}
				footer={[
					<Button key="btncancle" onClick={() => setShow(false)}>
						Hu??? b???
					</Button>,
					<Button
						loading={submiting}
						key="btnok"
						type="primary"
						htmlType="submit"
						form="aForm"
					>
						L??u l???i
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
						label="Ti??u ?????"
						name="title"
						rules={[
							{
								required: true,
								message: "Ti??u ????? b??i test kh??ng ???????c b??? tr???ng",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item label="????? b??i" name="description">
						<Input.TextArea />
					</Form.Item>
					<Form.Item label="Bu???i h???c">
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
									placeholder="Ch???n bu???i h???c"
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

					<Form.Item label="Ng??y" name="date">
						<DatePicker format="DD-MM-YYYY" />
					</Form.Item>
					<Form.Item label="Link ????? b??i" name="content_link">
						<Input />
					</Form.Item>
					<Form.Item label="Ch???n files ????? thi">
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
								Ch???n files
							</Button>
						</FileSelectModal>
					</Form.Item>
					<Form.Item label="Link ????p ??n" name="result_link">
						<Input />
					</Form.Item>
					<Form.Item label="Ch???n files ????p ??n">
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
								Ch???n files
							</Button>
						</FileSelectModal>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
