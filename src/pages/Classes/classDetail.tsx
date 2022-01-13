import { LikeOutlined, MessageOutlined, NotificationOutlined, TeamOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons";
import {
	Button,
	Col,
	DatePicker,
	Descriptions,
	Form,
	Image,
	Input,
	Layout,
	List,
	Modal,
	PageHeader,
	Row,
	Space,
	Spin,
	Table,
	Tabs,
} from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import { TestType } from "interface";
import { get } from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
	actionAddAttendance,
	actionGetAttendances,
	actionResetAddAttendanceStatus,
	actionResetGetAttendancesStatus,
	AttendanceStudentComment,
} from "store/attendances/slice";
import { actionGetClass } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetTestes } from "store/testes/slice";
import { dayOptions, imageExtensionsList } from "utils/const";
import { dummyRequest } from "utils/ultil";
import AddStudentsModal from "./addStudentsModal";
import AddTest from "./addTestModal";

const dateFormat = "DD-MM-YYYY";
const { RangePicker } = DatePicker;

export default function ClassDetail(): JSX.Element {
	const params = useParams() as { class_id: string };
	const history = useHistory();
	const dispatch = useAppDispatch();
	const { TabPane } = Tabs;
	const [today, setToday] = useState(moment(new Date()).format(dateFormat));
	const [attendantList, setAttendantList] = useState<number[]>([]);
	const [checkAll, setCheckAll] = useState(false);
	const [listComments, setListComments] = useState<AttendanceStudentComment[]>([]);
	// const classInfo = location.state.classInfo as ClassType;
	const attendances = useSelector((state: RootState) => state.attendanceReducer.attendances);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	const testList = useSelector((state: RootState) => state.testReducer.testes);
	const addStudentsStatus = useSelector((state: RootState) => state.classReducer.addStudentsStatus);
	const getAttendancesStatus = useSelector((state: RootState) => state.attendanceReducer.getAttendancesStatus);


	useEffect(() => {
		if (addStudentsStatus === "success") {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionResetAddAttendanceStatus());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addStudentsStatus, dispatch]);

	useEffect(() => {
		if (getAttendancesStatus === "success" || getAttendancesStatus === "error")
			dispatch(actionResetGetAttendancesStatus());
	}, [getAttendancesStatus, dispatch]);

	useEffect(() => {
		if (params.class_id) {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetClass({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetTestes({ class_id: +params.class_id }))
		}
	}, [dispatch, params]);

	const studentList = useMemo(() => get(attendances, "students", []), [attendances]);

	function isAttendant(sID: number, atKey: string) {
		const atList = attendances?.attendances[atKey];
		const found = atList && atList.find((element: number) => element === sID);
		if (found !== undefined && found > 0) return true;
		else return false;
	}

	function isAttendantToday(sID: number) {
		const found = attendantList.find((element: number) => element === sID);
		if (found !== undefined) return true;
		else return false;
	}

	function handleCheckAll(e: CheckboxChangeEvent) {
		setAttendantList([0]);
		const newList: number[] = [];
		if (e.target.checked) {
			studentList.map((el) => {
				newList.push(el.id);
			});
		}
		setCheckAll(e.target.checked);
		setAttendantList(newList);
	}

	function handleCheckbox(sID: number) {
		const found = attendantList.indexOf(sID);
		if (found === -1) {
			attendantList.push(sID);
		} else {
			attendantList.splice(found, 1);
		}
		setCheckAll(studentList.length === attendantList.length);
		setAttendantList([...attendantList]);
	}

	function handleChangeComment(e: React.ChangeEvent<HTMLInputElement>, id: number) {
		const f = listComments.findIndex((element) => element.id === `${id}`);
		if (f >= 0) {
			listComments[f].comment = e.target.value;
		} else {
			listComments.push({
				id: `${id}`,
				comment: e.target.value,
				conduct_point: "",
			});
		}
	}

	function handleChangeCoductPoint(e: React.ChangeEvent<HTMLInputElement>, id: number) {
		const finder = listComments.find((p) => p.id === `${id}`);
		if (finder) finder.conduct_point = e.target.value;
		else listComments.push({ id: `${id}`, comment: "", conduct_point: parseFloat(e.target.value).toString() });
	}

	function handleNotityToParent() {
		//Todo
	}

	function handleSubmit() {
		if (attendantList.length > 0 && classInfo) {
			const studentAttendanceList: AttendanceStudentComment[] = [];
			attendantList.forEach((at) => {
				const student = listComments.find((p) => +p.id === at);
				if (student) studentAttendanceList.push(student);
				else studentAttendanceList.push({ id: `${at}`, comment: "", conduct_point: "" });
			});
			const params = {
				class_id: classInfo.id,
				// Todo teacher_id is null becaues user is null
				teacher_id: get(classInfo, "user.id", 0),
				students: studentAttendanceList,
				date: moment(today, "DD-MM-YYYY").format("YYYY-MM-DD"),
			};
			dispatch(actionAddAttendance(params));
		}
	}
	const attendance_columns: any[] = [
		{
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function col(value: string): JSX.Element {
				return <strong>{value}</strong>;
			},
		},
		{
			title: "Ngày sinh",
			dataIndex: "birthday",
			key: "birthday",
			with: "20%",
			render: function col(value: string): JSX.Element {
				return <span>{moment(value).format("DD-MM-YYYY")}</span>;
			},
		},
		{
			title: (
				<div style={{ textAlign: "center" }}>
					<Checkbox onChange={handleCheckAll} checked={checkAll} />
				</div>
			),
			key: "operation",
			dataIndex: "",
			// width: 10,
			render: function col(st: { id: number }): JSX.Element {
				return (
					<div style={{ textAlign: "center" }}>
						<Checkbox onChange={() => handleCheckbox(st.id)} checked={isAttendantToday(st.id)} />
					</div>
				);
			},
		},
		{
			title: "Nhận xét",
			key: "comment",
			dataIndex: "",
			// width: 80,
			render: function col(st: { id: number }): JSX.Element {
				return <Input style={{ width: "100%" }} placeholder="Nhận xét" onChange={(e) => handleChangeComment(e, st.id)} />;
			},
		},
		{
			title: "Điểm hạnh kiểm",
			key: "point",
			dataIndex: "",
			// width: 80,
			render: function col(st: { id: number }): JSX.Element {
				return (
					<Input
						style={{ width: "100%" }}
						type="number"
						step={0.1}
						placeholder="điểm hạnh kiểm"
						onChange={(e) => handleChangeCoductPoint(e, st.id)}
					/>
				);
			}
		},
		{
			title: "",
			key: "action",
			dataIndex: "",
			width: 80,
			render: function col(st: { id: number }): JSX.Element {
				return (
					<Space>
						{" "}
						<Button icon={<NotificationOutlined />} type="link" onClick={(e) => handleNotityToParent()} />
					</Space>
				);
			},
		}

	];
	const lessonCols: any[] = [];
	lessonCols.push({
		title: "Họ tên",
		dataIndex: "name",
		key: "name",
		width: 180,
		render: function col(value: string): JSX.Element {
			return <strong>{value}</strong>;
		},
	})
	for (const key in get(attendances, "attendances", [])) {
		lessonCols.push({
			title: `${moment(key).format("DD/MM/YYYY")}`,
			dataIndex: "",
			key: `${key}`,
			width:20,
			render: function col(st: { id: number; name: string }): JSX.Element {
				return (
					<>
					<Checkbox checked={isAttendant(st.id, key)} disabled />
					</>
				);
			},
		});
	}
	lessonCols.push({
		
	})


	/* For Test */
	function handleChangePageOfTest(page: number) {
		dispatch(actionGetTestes({ class_id: +params.class_id, page }))
	}

	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header-responsive"
				onBack={() => window.history.back()}
				title={classInfo?.name}
				subTitle="Chi tiết lớp học"
				extra={[
					<AddStudentsModal key="addStudents" class_id={params.class_id} />,
					<Button key="2">In danh sách</Button>,
				]}
				footer={
					<Tabs defaultActiveKey="1">
						<TabPane tab="Điểm danh" key="1">
							<Space style={{ paddingTop: 20, marginBottom: 20 }}>
								Ngày:
								<DatePicker
									defaultValue={moment(new Date(), dateFormat)}
									format={dateFormat}
									onChange={(e) => setToday(moment(e).format("DD/MM/YYYY"))}
								/>
								<Button type="primary" onClick={handleSubmit}>
									Lưu lại
								</Button>
							</Space>

							<Row>
								<Col span={24}>
									<Spin spinning={getAttendancesStatus === "loading"}>
										<Table
											dataSource={studentList}
											columns={attendance_columns}
											bordered
											rowKey="id"
											size="small"
											pagination={false}
										/>
									</Spin>
								</Col>
							</Row>
						</TabPane>
						<TabPane tab="Bài tập" key="2">
							<Space style={{ paddingTop: 20, marginBottom: 20 }}>
								<AddTest classInfo={classInfo} />
							</Space>
							<List
								itemLayout="vertical"
								size="large"
								pagination={{
									onChange: handleChangePageOfTest,
									pageSize: 20,
									total: get(testList, "total", 0)
								}}
								dataSource={get(testList, "data", [])}
								renderItem={(item: TestType) => (
									<List.Item
										onClick={() => history.push({ pathname: `/tests/${item.id}/${params.class_id}` })}
										style={{ backgroundColor: "white", cursor: "pointer" }}
										key={item.id}
										actions={[
											<Space key="act1" onClick={e => { e.stopPropagation() }}>
												<Button type="link" icon={<TeamOutlined />} />
												{studentList.length}
											</Space>,
											<Space key="act2" onClick={e => { e.stopPropagation(); }}>
												{/* Todo refer liked */}
												<Button type="link" icon={<LikeOutlined />} /> 0
											</Space>,
											<Space key="act3" onClick={e => { e.stopPropagation() }}>
												{/* Todo refer commented */}
												<MessageOutlined /> 0
											</Space>,
										]}
										extra={
											<Image
												width={100}
												height={100}
												alt="logo"
												src="https://images.unsplash.com/photo-1641231366774-0260d3ee85d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
												onClick={e => { e.stopPropagation() }}
											/>
										}
									>
										<List.Item.Meta title={item.title} description={<>{item.date}</>} />
									</List.Item>
								)}
							/>
							,
						</TabPane>
						<TabPane tab="DS buổi học" key="3">
							<RangePicker style={{ marginTop: 20, marginBottom: 20 }} />
							<Table
								dataSource={studentList}
								columns={lessonCols}
								bordered
								rowKey="id"
								size="small"
								pagination={false}
							/>
						</TabPane>
						<TabPane tab="Album ảnh" key="4">
							<Space style={{ paddingTop: 20, marginBottom: 20 }}>
								<ClassPhotoAlbum class_id={+params.class_id} />
							</Space>

							<Space style={{ backgroundColor: "white", padding: 10 }} size={[10, 10]} wrap>
								{new Array(10).fill(null).map((_, index) => (
									<Image
										key={index}
										width={200}
										src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
									/>
								))}
							</Space>
						</TabPane>
					</Tabs>
				}
			>
				<Descriptions size="small" column={2} style={{ backgroundColor: "white", marginTop: 20 }} bordered>
					<Descriptions.Item label="Giáo viên">
						<a>{get(classInfo, "user.name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ngày bắt đầu">
						{moment(get(classInfo, "start_date", "") ?? void 0).format("DD-MM-YYYY")}
					</Descriptions.Item>
					<Descriptions.Item label="Số học sinh">{classInfo?.students_num}</Descriptions.Item>
					<Descriptions.Item label="Lịch học">
						{(() => {
							const sortedSchedule = classInfo?.schedule ? [...classInfo.schedule] : [];
							return sortedSchedule
								.sort()
								.map((day) => dayOptions[day])
								.join(", ");
						})()}
					</Descriptions.Item>
				</Descriptions>
			</PageHeader>
		</Layout.Content>
	);
}

function ClassPhotoAlbum(props: { class_id: number }): JSX.Element {
	const dispatch = useDispatch();
	const [show, setShow] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();

	useEffect(() => {
		// if (statusUploadFile === "success" || statusUploadFile === "error") {
		// 	setLoading(false);
		// 	dispatch(resetUploadFileStatus());
		// 	if (statusUploadFile === "success") {
		// 		setFileList([]);
		// 	}
		// }
	}, []);

	function handleUploadFile() {
		if (fileList.length > 0) {
			const listFileUpload = fileList.map((file) => {
				return file.originFileObj as File;
			});
			//Todo dispatch action to upload file then reset
			// dispatch(actionUploadFile(listFileUpload));
			// const data = {class_id: props.class_id, file_id: }
		}
	}

	return (
		<>
			<Button
				type="primary"
				icon={<UploadOutlined />}
				onClick={() => {
					setShow(true);
				}}
			>
				Upload
			</Button>
			<Modal
				title="Chọn ảnh để upload"
				centered
				visible={show}
				onCancel={() => {
					setShow(false);
				}}
				footer={null}
				width={950}
				maskClosable={false}
			>
				{/* Todo */}
				<Spin spinning={false}>
					<Form onFinish={handleUploadFile} form={form}>
						<Form.Item>
							<Dragger
								accept={imageExtensionsList.map((ext) => `.${ext}`).join(",")}
								name="file"
								multiple={true}
								customRequest={dummyRequest}
								onDrop={(e) => {
									// console.log(e.dataTransfer.files);
								}}
								listType="picture-card"
								fileList={fileList}
								onChange={({ fileList }) => {
									setFileList(fileList);
								}}
							// className="upload-list-inline"
							>
								<p className="ant-upload-drag-icon">
									<InboxOutlined />
								</p>
								<p className="ant-upload-text">
									Nhấn hoặc kéo thả file vào khu vực để upload!
								</p>
							</Dragger>
						</Form.Item>
						<Form.Item style={{ textAlign: "center" }}>
							<Button type="primary" htmlType="submit">
								Upload
							</Button>
							<Button
								style={{ marginLeft: 30 }}
								onClick={() => {
									setShow(false);
								}}
							>
								Cancel
							</Button>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</>
	);
}