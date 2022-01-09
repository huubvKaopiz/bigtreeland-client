/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Image,
	Button,
	Descriptions,
	Input,
	Layout,
	List,
	PageHeader,
	Skeleton,
	Space,
	Typography,
	Upload,
	Card,
	Spin,
	Form,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Modal from "antd/lib/modal/Modal";
import { RootState } from "store/store";
import { actionGetClass } from "store/classes/slice";
import { actionGetTest, actionResetUpdateTest, actionUpdateTest } from "store/testes/slice";
import moment from "moment";
import { dayOptions, fileIconList } from "utils/const";
import { isImageType } from "utils/ultil";
import FileSelectModal from "components/FileSelectModal";
import { FileType } from "interface";
import {
	actionGetTestResults,
	actionUpdateTestResults,
	resetUpdateTestResultsStatus,
} from "store/test-results/slice";
import { actionGetAttendances } from "store/attendances/slice";
import { get } from "lodash";
import { actionGetListFile } from "store/files/slice";

const { Title } = Typography;
const dateFormat = "DD-MM-YYYY";
interface TestResult {
	id: number;
	name: string;
	result_files: FileType[];
	date: string;
	teacher_comment: string;
	point: string;
	correct_files: FileType[];
}

export function ListTestResults(): JSX.Element {
	const params = useParams() as { test_id: string; class_id: string };
	const dispatch = useDispatch();
	const storeClassInfo = useSelector(
		(state: RootState) => state.classReducer.classInfo
	);
	const storeTestInfo = useSelector(
		(state: RootState) => state.testReducer.testInfo
	);
	const storeTestResultInfo = useSelector(
		(state: RootState) => state.testResultsReducer.testResults
	);
	const storeAttendancesInfo = useSelector(
		(state: RootState) => state.attendanceReducer.attendances
	);
	// status
	const storeGetTestResultStatus = useSelector(
		(state: RootState) => state.testResultsReducer.getTestResultsStatus
	);
	const storeGetAttendenceStatus = useSelector(
		(state: RootState) => state.attendanceReducer.getAttendancesStatus
	);
	const storeGetClassStatus = useSelector(
		(state: RootState) => state.classReducer.getClassStatus
	);
	const storeGetTestStatus = useSelector(
		(state: RootState) => state.testReducer.getTestStatus
	);

	//State
	const [listResults, setListResults] = useState<TestResult[]>([]);

	console.log("re-render");

	useEffect(() => {
		if (params.test_id && params.class_id) {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetClass({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetTest(+params.test_id));
			dispatch(actionGetTestResults({ test_id: +params.test_id }));
		}
	}, [dispatch, params]);

	useEffect(() => {
		if (storeTestResultInfo && storeAttendancesInfo) {
			const listResults: TestResult[] = [];
			storeTestResultInfo.data?.map((testResult) => {
				listResults.push({
					id: testResult.id,
					name:
						storeAttendancesInfo.students.find(
							(st) => st.id === testResult.student_id
						)?.name ?? "",
					date: testResult.updated_at,
					teacher_comment: testResult.teacher_comment,
					point: testResult.point,
					correct_files: testResult.correct_files,
					result_files: testResult.result_files,
				});
			});
			setListResults(listResults);
		}
	}, [storeTestResultInfo, storeAttendancesInfo]);

	//Todo remove listRs, instead by listResults
	// const listRs = [
	// 	{
	// 		id: 1,
	// 		name: "Nguyen Van A",
	// 		result_file: "",
	// 		date: "2021-11-21 09:20",
	// 		point: "9",
	// 		teacher_comment: "abc",
	// 		correct_files: [1,2]
	// 	},
	// 	{
	// 		id: 2,
	// 		name: "Nguyen Van B",
	// 		result_file: "",
	// 		date: "2021-11-21 10:12",
	// 		point: "7",
	// 		teacher_comment: "abcd",
	// 		correct_files: [1]
	// 	},
	// 	{
	// 		id: 3,
	// 		name: "Nguyen Van C",
	// 		result_file: "",
	// 		date: "2021-11-21 11:11",
	// 		point: "8",
	// 		teacher_comment: "abcfeasdf",
	// 		correct_files: [2]
	// 	},
	// ];

	return (
		<Layout.Content>
			<Spin
				spinning={
					storeGetTestStatus === "loading" &&
					storeGetTestResultStatus === "loading" &&
					storeGetAttendenceStatus === "loading" &&
					storeGetClassStatus === "loading"
				}
			>
				<PageHeader
					title={storeTestInfo?.title ?? "Tên bài test"}
					subTitle={moment(storeTestInfo?.date).format(dateFormat)}
					onBack={() => window.history.back()}
					style={{ backgroundColor: "white", marginTop: 20 }}
					extra={[
						<UploadTestResultModal
							key={params.test_id}
							id={+params.test_id}
							result_link={storeTestInfo?.result_link ?? ""}
							result_files={storeTestInfo?.result_files ?? []}
						/>,
					]}
				>
					<Descriptions size="small" column={2}>
						<Descriptions.Item label="Giáo viên">
							<a>{storeClassInfo?.user.name ?? "Tên giáo viên"}</a>
						</Descriptions.Item>
						<Descriptions.Item label="Lớp">
							{storeClassInfo?.name ?? "Tên Lớp"}
						</Descriptions.Item>
						<Descriptions.Item label="Số bài nộp">
							<a>
								{get(storeTestResultInfo, "data", []).length}/
								{get(storeAttendancesInfo, "students", []).length}
							</a>
						</Descriptions.Item>
						<Descriptions.Item label="Lịch học">
							{(() => {
								const sortedSchedule = storeClassInfo?.schedule
									? [...storeClassInfo.schedule]
									: [];
								return sortedSchedule
									.sort()
									.map((day) => dayOptions[day])
									.join(", ");
							})()}
						</Descriptions.Item>
					</Descriptions>
				</PageHeader>
				<div style={{ padding: "0 24px" }}>
					<Title style={{ marginTop: 20 }} level={4}>
						Đề bài
					</Title>
					<Space
						style={{ backgroundColor: "white", padding: 10 }}
						size={[10, 10]}
						wrap
					>
						Link đề bài:{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href={storeTestInfo?.content_link}
						>
							{storeTestInfo?.content_link}
						</a>
					</Space>
					<div style={{ padding: 10 }}>
						<Space style={{ backgroundColor: "white" }} size={[10, 10]} wrap>
							{storeTestInfo?.content_files.map((file, index) => (
								<Card
									key={index}
									hoverable
									style={{ width: 240 }}
									cover={
										<Image
											width={240}
											height={240}
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
									}
								>
									<Card.Meta
										style={{ padding: 0 }}
										title={
											<a href={file.url} rel="noreferrer" target="_blank">
												<div>{file.name}</div>
											</a>
										}
									/>
								</Card>
							))}
						</Space>
					</div>
					<Title style={{ marginTop: 20 }} level={4}>
						Đáp án
					</Title>
					<Space
						style={{ backgroundColor: "white", padding: 10 }}
						size={[10, 10]}
						wrap
					>
						Link kết quả:{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href={storeTestInfo?.result_link}
						>
							{storeTestInfo?.result_link ?? ""}
						</a>
					</Space>
					<div style={{ padding: 10 }}>
						<Space
							style={{ marginTop: 20, backgroundColor: "white" }}
							size={[10, 10]}
							wrap
						>
							{storeTestInfo?.result_files.map((file, index) => (
								<Card
									key={index}
									hoverable
									style={{ width: 240 }}
									cover={
										<Image
											width={240}
											height={240}
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
									}
								>
									<Card.Meta
										title={
											<a href={file.url} rel="noreferrer" target="_blank">
												{file.name}
											</a>
										}
									/>
								</Card>
							))}
						</Space>
					</div>
					<Space
						style={{ backgroundColor: "white", padding: 10 }}
						size={[10, 10]}
						wrap
					>
						Danh sách học sinh nộp bài:
					</Space>
					<List
						rowKey="id"
						className="demo-loadmore-list"
						loading={storeGetTestResultStatus === "loading"}
						itemLayout="horizontal"
						style={{ backgroundColor: "white", padding: 20 }}
						loadMore={true}
						dataSource={listResults}
						renderItem={(item) => (
							<List.Item
								actions={[
									<UploadResultModal
										key="upload"
										id={item.id}
										correct_files={item.correct_files}
									/>,
									<CommentModal
										key="cmt"
										id={item.id}
										point={item.point}
										teacher_comment={item.teacher_comment}
									/>,
								]}
							>
								<Skeleton avatar title={false} loading={false} active>
									<List.Item.Meta
										avatar={
											<Image
												width={100}
												height={100}
												alt="image"
												src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
											/>
										}
										/* Todo go to student test details */
										title={<a href="#">{item.name}</a>}
										description={item.date}
									/>
								</Skeleton>
							</List.Item>
						)}
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
			<Button type="link" onClick={() => setShow(true)}>
				Nhận xét
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
		const fileList = props.correct_files.map((propsFile) => {
			return listFile.data?.find((file) => file.id === propsFile.id);
		});
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
			<Button type="link" onClick={() => setShow(true)}>
				Đăng bài chấm
			</Button>
			<Modal
				title="Tải bài chấm"
				visible={show}
				closable
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
				okText="Lưu lại"
				confirmLoading={storeUpdateTestResultState === "loading"}
			>
				<FileSelectModal
					defaultSelected={fileSelected}
					isShow={showSelect}
					okFunction={handleFileSelected}
					closeFunction={() => setShowSelect(false)}
					showSelectedList
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

function UploadTestResultModal(props: {
	id: number;
	result_link: string;
	result_files: FileType[];
}): JSX.Element {
	const dispatch = useDispatch();
	const [show, setShow] = useState(false);
	const [resultFilesModal, setResultFilesModal] = useState(false);
	const storeUpdateTestState = useSelector(
		(state: RootState) => state.testReducer.updateTestStatus
	);
	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const [resultFiles, setResultFiles] = useState<Array<FileType>>([]);

	useEffect(() => {
		if(storeUpdateTestState === 'success'){
			dispatch(actionResetUpdateTest())
			dispatch(actionGetTest(props.id))
			setShow(false)
		}
	}, [dispatch, props.id, storeUpdateTestState])

	useEffect(() => {
		const fileList = props.result_files.map((propsFile) => {
			return listFile.data?.find((file) => file.id === propsFile.id);
		});
		setResultFiles(fileList.filter(Boolean) as FileType[]);
	}, [props.result_files, listFile]);

	function handleSubmit(values: any) {
		const { result_link } = values;
		const result_files = resultFiles.map(file => file.id)
		// Todo update
		dispatch(actionUpdateTest({id: props.id, result_link, result_files}))
	}

	function handleResultFileSelected(filesSelected: Array<FileType>) {
		setResultFiles(filesSelected);
	}

	return (
		<>
			<Button type="primary" onClick={() => setShow(true)}>
				Cập nhật đáp án
			</Button>
			<Modal
				title="Cập nhật đán án bài kiểm tra"
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
					initialValues={{ result_link: props?.result_link ?? "" }}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 18 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
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
