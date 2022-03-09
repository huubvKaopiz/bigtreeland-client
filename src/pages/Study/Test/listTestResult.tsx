import {
	Image,
	Button,
	Descriptions,
	Input,
	Layout,
	PageHeader,
	Space,
	Typography,
	Spin,
	Form,
	DatePicker,
	Select,
	Divider,
	Table,
} from "antd";
import { UploadOutlined, FormOutlined, FileDoneOutlined, StarOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Modal from "antd/lib/modal/Modal";
import { RootState } from "store/store";
import {
	actionGetTest,
	actionResetUpdateTest,
	actionUpdateTest,
} from "store/testes/slice";
import moment from "moment";
import { dayOptions, defaul_image_base64, fileIconList } from "utils/const";
import { isImageType } from "utils/ultil";
import FileSelectModal from "components/FileSelectModal";
import { FileType, LessonType, TestType } from "interface";
import {
	actionUpdateTestResults,
	resetUpdateTestResultsStatus,
	TestResultsType,
} from "store/test-results/slice";
import { get } from "lodash";

const { Title } = Typography;
const dateFormat = "DD-MM-YYYY";

export function ListTestResults(): JSX.Element {
	const params = useParams() as { test_id: string; class_id: string };
	const dispatch = useDispatch();
	const [showResultDetail, setShowResultDetail] = useState(-1);

	const testInfo = useSelector(
		(state: RootState) => state.testReducer.testInfo
	);
	const storeGetTestStatus = useSelector(
		(state: RootState) => state.testReducer.getTestStatus
	);

	useEffect(() => {
		if (params.test_id) {
			dispatch(actionGetTest(+params.test_id));
		}
	}, [dispatch, params]);


	const testResultCols: any[] = [
		Table.EXPAND_COLUMN,
		{
			title: 'Name',
			dataIndex: '',
			key: 'name',
			render: function nameCol(text: string, record: TestResultsType): JSX.Element {
				return <strong>{record.student.name}</strong>
			}
		},
		{ title: 'Ngày nộp', dataIndex: 'created_at', key: 'date' },
		{ title: 'Điểm', dataIndex: 'point', key: 'point' },
		{ title: 'Nhận xet', dataIndex: 'teacher_comment', key: 'comment' },
		{
			title: '',
			dataIndex: 'action',
			key: 'address',
			render: function actionCol(text: string, record: TestResultsType): JSX.Element {
				return (
					<>
						<UploadResultModal
							key="upload"
							id={record.id}
							correct_files={record.correct_files && []}
						/>
						<CommentModal
							key="cmt"
							id={record.id}
							point={record.point}
							teacher_comment={record.teacher_comment}
						/>
					</>
				)
			}
		},
	];

	return (
		<Layout.Content>
			<Spin
				spinning={storeGetTestStatus === "loading"}
			>
				<PageHeader
					title={get(testInfo, "title", "")}
					subTitle={moment(get(testInfo, "date", null)).format(dateFormat)}
					onBack={() => window.history.back()}
					style={{ backgroundColor: "white", marginTop: 20 }}
					extra={[
						<UploadTestResultModal
							testInfo={testInfo}
						/>,
					]}
				>
					<Descriptions size="small" column={2} bordered>

						<Descriptions.Item label="Lớp">
							<p>{testInfo?.class.name ?? ""}</p>
						</Descriptions.Item>
						<Descriptions.Item label="Số bài nộp">
							<a>
								{get(testInfo, "test_results", []).length}/
								{get(testInfo, "class.students_num", 0)}
							</a>
						</Descriptions.Item>
						<Descriptions.Item label="Lịch học">
							{(() => {
								const sortedSchedule = testInfo?.class.schedule
									? [...testInfo?.class.schedule]
									: [];
								return sortedSchedule
									.sort()
									.map((day) => dayOptions[day])
									.join(", ");
							})()}
							<span>({testInfo?.class.schedule_time ?? ""})</span>
						</Descriptions.Item>
					</Descriptions>
				</PageHeader>
				<div style={{ padding: "0 24px" }}>
					<Title style={{ marginTop: 20 }} level={5}>
						Đề bài
					</Title>
					{
						testInfo?.content_link &&
						<Space
							style={{ backgroundColor: "white", marginBottom: 10 }}
							size={[10, 10]}
							wrap
						>
							Link đề bài:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href={testInfo?.content_link}
							>
								{testInfo?.content_link}
							</a>
						</Space>
					}
					{
						get(testInfo, "content_files", []).length > 0 &&
						<div style={{}}>
							<p>Ảnh đề bài</p>
							<Space style={{ backgroundColor: "white" }} size={[10, 10]} wrap>
								{testInfo?.content_files.map((file, index) => (
									<div key={index}>
										<Image
											width={100}
											height={100}
											style={{ objectFit: "cover" }}
											alt="logo"
											src={
												isImageType(file.type || "")
													? file.url
													: fileIconList[
													Object.keys(fileIconList).find(
														(k) => k === file.type
													) as keyof typeof fileIconList
													]
											}
										/>
									</div>

								))}
							</Space>
						</div>
					}

					<Title style={{ marginTop: 20 }} level={5}>
						Đáp án
					</Title>
					{
						testInfo?.result_link &&
						<Space
							style={{ backgroundColor: "white", marginBottom: 10 }}
							size={[10, 10]}
							wrap
						>
							Link đáp án:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href={testInfo?.result_link}
							>
								{testInfo?.result_link ?? ""}
							</a>
						</Space>
					}
					{
						get(testInfo, "result_files", []).length > 0 &&
						<div>
							<p>Ảnh đáp án</p>
							<Space
								style={{ backgroundColor: "white" }}
								size={[10, 10]}
								wrap
							>
								{testInfo?.result_files.map((file, index) => (
									<div key={index}>
										<Image
											width={100}
											height={100}
											style={{ objectFit: "cover" }}
											alt="logo"
											src={
												isImageType(file.type || "")
													? file.url
													: fileIconList[
													Object.keys(fileIconList).find(
														(k) => k === file.type
													) as keyof typeof fileIconList
													]
											}
										/>
									</div>
								))}
							</Space>
						</div>
					}

					<Divider />
					<Title style={{ marginTop: 20 }} level={5}>
						Danh sách học sinh nộp bài
					</Title>
					<Table
						bordered
						rowKey="id"
						dataSource={get(testInfo, "test_results", [])}
						columns={testResultCols}
						expandable={{
							expandedRowRender: record =>
								<div>
									{
										record.result_link &&
										<div style={{ marginBottom: 10 }}>
											<h1>Link bài làm:</h1>
											<a href={record.result_link}>{record.result_link}</a>
										</div>
									}
									{
										record.correct_link &&
										<div style={{ marginBottom: 10 }}>
											<h1>Link bài sửa:</h1>
											<a href={record.correct_link}>{record.correct_link}</a>
										</div>
									}
									{
										record.result_files.length > 0 &&
										<>
											<h1 style={{ marginBottom: 10 }}>Ảnh bài làm:</h1>
											<Space
												style={{ backgroundColor: "white" }}
												size={[10, 10]}
												wrap
											>
												{get(record, "result_files", []).map(
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
											</Space>
										</>
									}
									{
										record.correct_files.length > 0 &&
										<>
											<h1 style={{ marginBottom: 10 }}>Ảnh bài sửa:</h1>
											<Space
												style={{ backgroundColor: "white" }}
												size={[10, 10]}
												wrap
											>
												{get(record, "correct_files", []).map(
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
											</Space>
										</>
									}
								</div>
						}}
					/>
				</div>
			</Spin>
		</Layout.Content>
	);
}

const { TextArea } = Input;
function CommentModal(props: {
	id: number;
	teacher_comment: string;
	point: string;
}): JSX.Element {
	const dispatch = useDispatch();
	const [show, setShow] = useState(false);
	const [comment, setComment] = useState(props.teacher_comment);
	const [point, setPoint] = useState(props.point);
	const storeUpdateTestResultState = useSelector(
		(state: RootState) => state.testResultsReducer.updateTestResultsStatus
	);

	function handleSubmit() {
		const data = { id: props.id, teacher_comment: comment, point };
		dispatch(actionUpdateTestResults(data));
	}

	useEffect(() => {
		if (storeUpdateTestResultState === "success") {
			setShow(false);
			dispatch(resetUpdateTestResultsStatus());
		}
	}, [dispatch, storeUpdateTestResultState]);

	return (
		<>
			<Button type="primary" ghost icon={<StarOutlined />} onClick={() => setShow(true)}>
				Chấm bài
			</Button>
			<Modal
				title="Chấm điểm bài làm"
				visible={show}
				closable
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
				okText="Lưu lại"
				confirmLoading={storeUpdateTestResultState === "loading"}
			>
				<Input
					placeholder="Điểm"
					onChange={({ target: { value } }) => setPoint(value)}
					style={{ marginBottom: 20 }}
					value={point}
				/>
				<TextArea
					placeholder="Nhận xét"
					onChange={({ target: { value } }) => setComment(value)}
					value={comment}
					style={{ height: 100 }}
				/>
			</Modal>
		</>
	);
}

function UploadResultModal(props: {
	id: number;
	correct_files: FileType[];
}): JSX.Element {
	const dispatch = useDispatch();
	const [show, setShow] = useState(false);
	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const storeUpdateTestResultState = useSelector(
		(state: RootState) => state.testResultsReducer.updateTestResultsStatus
	);
	const [fileSelected, setFileSelected] = useState<FileType[]>([]);
	const [showSelect, setShowSelect] = useState(false);

	useEffect(() => {
		const fileList = props.correct_files?.map((propsFile) => {
			return listFile.data?.find((file) => file.id === propsFile.id);
		}) ?? [];
		setFileSelected(fileList.filter(Boolean) as FileType[]);
	}, [props.correct_files, listFile]);

	useEffect(() => {
		if (storeUpdateTestResultState === "success") {
			setShow(false);
			dispatch(resetUpdateTestResultsStatus());
		}
	}, [dispatch, storeUpdateTestResultState]);

	const handleSubmit = () => {
		const data = {
			id: props.id,
			correct_files: fileSelected.map((file) => file.id),
		};
		dispatch(actionUpdateTestResults(data));
	};

	function handleFileSelected(filesSelected: Array<FileType>) {
		setFileSelected(filesSelected);
	}

	return (
		<>
			<Button type="primary" style={{ marginRight: 10 }} icon={<FileDoneOutlined />} onClick={() => setShow(true)}>
				Chữa bài
			</Button>
			<Modal
				title="Chữa bài cho học sinh"
				width={800}
				visible={show}
				closable
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
				okText="Lưu lại"
				confirmLoading={storeUpdateTestResultState === "loading"}
			>
				<p>Link bài chữa:</p>
				<Input placeholder="Link bài chữa" />
				<p style={{ marginTop: 20 }}>Ảnh bài chữa:</p>
				<FileSelectModal
					defaultSelected={fileSelected}
					isShow={showSelect}
					okFunction={handleFileSelected}
					closeFunction={() => setShowSelect(false)}
					showSelectedList
					review={true}
				>
					<Button
						onClick={() => setShowSelect(true)}
						type="default"
						size="middle"
						icon={<UploadOutlined />}
					>
						Chọn files
					</Button>
				</FileSelectModal>
			</Modal>
		</>
	);
}

function UploadTestResultModal(props: { testInfo: TestType | null }): JSX.Element {
	const { testInfo } = props;
	const dispatch = useDispatch();
	const [utFrom] = Form.useForm();
	const [show, setShow] = useState(false);
	const [resultFilesModal, setResultFilesModal] = useState(false);
	const [showSelect, setShowSelect] = useState(false);
	const storeUpdateTestState = useSelector(
		(state: RootState) => state.testReducer.updateTestStatus
	);
	const lessonList = useSelector(
		(state: RootState) => state.lessonReducer.lessons
	);
	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const [resultFiles, setResultFiles] = useState<Array<FileType>>([]);
	const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);

	useEffect(() => {
		if (testInfo && storeUpdateTestState === "success") {
			dispatch(actionResetUpdateTest());
			dispatch(actionGetTest(testInfo.id));
			setShow(false);
		}
	}, [dispatch, testInfo, storeUpdateTestState]);

	useEffect(() => {
		if (testInfo) {
			utFrom.setFieldsValue({
				result_link: testInfo.result_link,
				content_link: testInfo.content_link,
				title: testInfo.title,
				date: moment(testInfo.date),
				lesson_id: testInfo.lesson_id
			})
			const results = testInfo.result_files.map((propsFile) => {
				return listFile.data?.find((file) => file.id === propsFile.id);
			});
			const contents = testInfo.content_files.map((propsFile) => {
				return listFile.data?.find((file) => file.id === propsFile.id);
			});
			setResultFiles(results.filter(Boolean) as FileType[]);
			setFileSelected(contents.filter(Boolean) as FileType[]);
		}
	}, [testInfo]);

	function handleSubmit(values: any) {
		if (testInfo) {
			const { result_link, content_link, title, date, lesson_id } = values;
			const result_files = resultFiles.map((file) => file.id);
			const content_files = fileSelected.map((file) => file.id);
			// Todo update
			dispatch(
				actionUpdateTest({
					id: testInfo.id,
					title,
					date: moment(date).format('YYYY-MM-DD'),
					content_files,
					content_link,
					result_link,
					result_files,
					lesson_id
				})
			);
		}

	}

	function handleResultFileSelected(filesSelected: Array<FileType>) {
		setResultFiles(filesSelected);
	}

	function handleFileSelected(filesSelected: Array<FileType>) {
		setFileSelected(filesSelected);
	}
	if (testInfo == undefined) return (<></>)

	return (
		<>
			<Button type="primary" icon={<FormOutlined />} onClick={() => setShow(true)}>
				Cập nhật
			</Button>
			<Modal
				title="Cập nhật bài kiểm tra và đáp án"
				visible={show}
				closable
				width={800}
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
					<Form.Item label="Bài học ngày" name="lesson_id">
						<Select
							showSearch
							allowClear
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
										label={moment(lesson.date, "YYYY-MM-DD").format(
											"DD-MM-YYYY"
										)}
									>
										<a>
											{moment(lesson.date, "YYYY-MM-DD").format("DD-MM-YYYY")}{" "}
										</a>
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item label="Ngày" name="date">
						<DatePicker format="DD-MM-YYYY" />
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
							showSelectedList
							review={true}
						>
							<Button
								onClick={() => setShowSelect(true)}
								type="default"
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
							showSelectedList
							review={true}
						>
							<Button
								onClick={() => setResultFilesModal(true)}
								type="default"
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
	);
}
