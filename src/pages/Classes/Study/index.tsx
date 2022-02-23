import {
	ExclamationCircleOutlined,
	InboxOutlined,
	LikeOutlined,
	MessageOutlined,
	NotificationOutlined,
	SearchOutlined,
	TeamOutlined,
	UploadOutlined,
	UnorderedListOutlined,
	EditOutlined,
	PlusOutlined,
	CaretRightOutlined
} from "@ant-design/icons";
import {
	Button,
	Col,
	Collapse,
	DatePicker,
	Descriptions,
	Form,
	Image,
	Input,
	Layout,
	List,
	Modal,
	ModalFuncProps,
	notification,
	PageHeader,
	Row,
	Space,
	Spin,
	Table,
	Tabs,
	Tooltip,
	Comment
} from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import TextArea from "antd/lib/input/TextArea";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import { FileType, StudentType, TestType } from "interface";
import { get } from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
	actionAddAttendance,
	actionGetAttendances,
	actionResetAddAttendanceStatus,
	actionResetGetAttendancesStatus,
	AttendanceStudentComment,
} from "store/attendances/slice";
import { actionGetLessons } from "store/lesson/slice";
import { actionGetClass, actionSetClassDetailTabKey, actionUpdateClass } from "store/classes/slice";
import { actionUploadFile } from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetTestes } from "store/testes/slice";
import { dayOptions, imageExtensionsList, NOTIFI_URIS, STUDY_TABS } from "utils/const";
import { dummyRequest } from "utils/ultil";
import AddStudentsModal from "../addStudentsModal";
import AddTest from "./addTestModal";
import { actionAddNotification } from "store/notifications/slice";
import { Lesson } from "./lesson";
import { ClassPhotos } from "./album";
import { Tests } from "./test";

const dateFormat = "DD-MM-YYYY";
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export default function (): JSX.Element {
	const params = useParams() as { class_id: string };
	const dispatch = useAppDispatch();
	const { TabPane } = Tabs;
	const [today, setToday] = useState(moment(new Date()).format(dateFormat));
	const [attendantList, setAttendantList] = useState<number[]>([]);
	const [checkAll, setCheckAll] = useState(false);
	const [listComments, setListComments] = useState<AttendanceStudentComment[]>([]);
	const [resetAttendance, setResetAttendance] = useState(1);
	const [createAttendance, setCreateAttedance] = useState(false);
	const [showNotiForm, setShowNotiForm] = useState(false);
	const [notiIndex, setNotiIndex] = useState(-1);

	// application states
	const activeTab = useSelector(
		(state: RootState) => state.classReducer.classDetailTabKey
	);
	const attendances = useSelector(
		(state: RootState) => state.attendanceReducer.attendances
	);
	const classInfo = useSelector(
		(state: RootState) => state.classReducer.classInfo
	);

	const addStudentsStatus = useSelector(
		(state: RootState) => state.classReducer.addStudentsStatus
	);
	const getAttendancesStatus = useSelector(
		(state: RootState) => state.attendanceReducer.getAttendancesStatus
	);
	const addAttendanceStatus = useSelector(
		(state: RootState) => state.attendanceReducer.addAttendanceStatus
	);

	const modalConfirmConfig: ModalFuncProps = {
		title: "",
		content: "Di chuyển đến danh sách buổi học",
		icon: <ExclamationCircleOutlined />,
		okText: "Ok",
		cancelText: "Ở lại",
		onOk: () => {
			setResetAttendance(resetAttendance + 1);
			setCheckAll(false);
			setAttendantList([]);
		},
	};

	useEffect(() => {
		if (params.class_id) {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetClass({ class_id: parseInt(params.class_id) }));
		}
	}, [dispatch, params]);

	useEffect(() => {
		if (addStudentsStatus === "success") {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
		}
	}, [addStudentsStatus, dispatch]);

	useEffect(() => {
		if (getAttendancesStatus === "success" || getAttendancesStatus === "error")
			dispatch(actionResetGetAttendancesStatus());
	}, [getAttendancesStatus, dispatch]);



	useEffect(() => {
		if (addAttendanceStatus === "success") {
			// Modal.confirm(modalConfirmConfig);
			setCreateAttedance(false)
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionResetAddAttendanceStatus());
		}
	}, [addAttendanceStatus]);


	const studentList = useMemo(
		() => get(attendances, "students", []),
		[attendances]
	);

	function isAttendant(sID: number, atKey: string) {
		const atList = attendances?.attendances[atKey];
		const found =
			atList && atList.find((element) => element.student_id === sID);
		if (found !== undefined) return true;
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

	function handleChangeComment(comment: string, id: number) {
		const f = listComments.findIndex((element) => element.id === `${id}`);
		if (f >= 0) {
			listComments[f].comment = comment;
		} else {
			listComments.push({
				id: `${id}`,
				comment: comment,
				conduct_point: "",
				reminder: "",
			});
		}
	}

	function handleChangeCoductPoint(
		e: React.ChangeEvent<HTMLInputElement>,
		id: number
	) {
		const finder = listComments.find((p) => p.id === `${id}`);
		if (finder) finder.conduct_point = e.target.value;
		else
			listComments.push({
				id: `${id}`,
				comment: "",
				conduct_point: parseFloat(e.target.value).toString(),
				reminder: "",
			});
	}

	function handleChangeReminder(reminder: string, id: number) {
		const finder = listComments.find((p) => p.id === `${id}`);
		if (finder) finder.reminder = reminder;
		else
			listComments.push({
				id: `${id}`,
				comment: "",
				conduct_point: "",
				reminder,
			});
	}

	function handleNotityToParent(index: number) {
		//Todo
		setNotiIndex(index);
		setShowNotiForm(true);
	}

	function handleSubmit() {
		const teacher_id = get(classInfo, "user.id", null);
		if (!teacher_id) {
			notification.warn({ message: "Chưa có thông tin giáo viên!" });
		} else if (attendantList.length > 0 && classInfo) {
			const studentAttendanceList: AttendanceStudentComment[] = [];
			attendantList.forEach((at) => {
				const student = listComments.find((p) => +p.id === at);
				if (student) studentAttendanceList.push(student);
				else
					studentAttendanceList.push({
						id: `${at}`,
						comment: "",
						conduct_point: "",
						reminder: "",
					});
			});
			const payload = {
				class_id: classInfo.id,
				teacher_id: teacher_id,
				students: studentAttendanceList,
				date: moment(today, "DD-MM-YYYY").format("YYYY-MM-DD"),
			};
			dispatch(actionAddAttendance(payload));
		} else {
			notification.warn({ message: "Danh sách điểm danh trống" });
		}
	}

	function handleChangeLessonRange(_: any, dateString: string[]) {
		const from_date = dateString[0] || void 0;
		const to_date = dateString[1] || void 0;
		dispatch(
			actionGetAttendances({ class_id: +params.class_id, from_date, to_date })
		);
	}

	const attendance_columns: any[] = [
		{
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			with: "40%",
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
						<Checkbox
							onChange={() => handleCheckbox(st.id)}
							checked={isAttendantToday(st.id)}
						/>
					</div>
				);
			},
		},
		{
			title: "Điểm hạnh kiểm",
			key: "point",
			dataIndex: "",
			width: 150,
			render: function col(st: { id: number }): JSX.Element {
				return (
					<Input
						className="_input_"
						style={{ width: "100%" }}
						type="number"
						step={0.1}
						placeholder="điểm hạnh kiểm"
						onChange={(e) => handleChangeCoductPoint(e, st.id)}
					/>
				);
			},
		},
		{
			title: "Reminder",
			key: "reminder",
			dataIndex: "",
			render: function col(st: { id: number }): JSX.Element {
				return (
					<TextArea
						className="_input_"
						style={{ width: "100%" }}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder="Lời nhắc nhở"
						onChange={({ target: { value } }) =>
							handleChangeReminder(value, st.id)
						}
					/>
				);
			},
		},
		{
			title: "Nhận xét",
			key: "comment",
			dataIndex: "",
			render: function col(st: { id: number }): JSX.Element {
				return (
					<TextArea
						className="_input_"
						style={{ width: "100%" }}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder="Nhận xét"
						onChange={({ target: { value } }) =>
							handleChangeComment(value, st.id)
						}
					/>
				);
			},
		},
		{
			title: "",
			key: "action",
			dataIndex: "",
			width: 80,
			render: function col(text: string, record: { id: number }, index: number): JSX.Element {
				return (
					<Space>

						<Tooltip title="Gửi thông báo">
							<Button
								icon={<NotificationOutlined />}
								type="link"
								onClick={() => handleNotityToParent(index)}
							/>
						</Tooltip>
					</Space>
				);
			},
		},
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
	});

	for (const key in get(attendances, "attendances", [])) {
		lessonCols.push({
			title: `${moment(key).format("DD/MM/YYYY")}`,
			dataIndex: "",
			key: `${key}`,
			width: 20,
			render: function col(st: { id: number; name: string }): JSX.Element {
				return (
					<>
						<Checkbox checked={isAttendant(st.id, key)} disabled />
					</>
				);
			},
		});
	}
	lessonCols.push({});



	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header-responsive"
				onBack={() => window.history.back()}
				title={classInfo?.name}
				subTitle="Chi tiết lớp học"
				extra={[
					<AddStudentsModal key="addStudents" class_id={params.class_id} />,
					// <Button key="2">In danh sách</Button>,
				]}
			>
			</PageHeader>
			<Descriptions
				size="small"
				column={2}
				style={{ backgroundColor: "white", marginTop: 20 }}
				bordered
			>
				<Descriptions.Item label="Giáo viên">
					<a>{get(classInfo, "user.profile.name", "")}</a>
				</Descriptions.Item>
				<Descriptions.Item label="Ngày bắt đầu">
					<strong>
						{moment(get(classInfo, "start_date", "") ?? void 0).format(
							"DD-MM-YYYY"
						)}
					</strong>
				</Descriptions.Item>
				<Descriptions.Item label="Số học sinh">
					<strong style={{ color: "#e67e22" }}>
						{get(classInfo, "students_num", 0)}
					</strong>
				</Descriptions.Item>
				<Descriptions.Item label="Lịch học">
					<strong>
						{(() => {
							const sortedSchedule = classInfo?.schedule
								? [...classInfo.schedule]
								: [];
							return sortedSchedule
								.sort()
								.map((day) => dayOptions[day])
								.join(", ");
						})()}{" "}
						({classInfo?.schedule_time ?? "Chưa có thời gian học"})
					</strong>
				</Descriptions.Item>
			</Descriptions>
			<Tabs activeKey={activeTab} onChange={(activeKey) => dispatch(actionSetClassDetailTabKey(activeKey))}>
				<TabPane tab="Điểm danh" key={STUDY_TABS.ATTENDACNE}>
					{
						createAttendance === true
							?
							<div key={resetAttendance}>
								<Space style={{ paddingTop: 20, marginBottom: 20 }}>
									Ngày học:
									<DatePicker
										disabledDate={(current) =>
											current && current > moment().endOf("day")
										}
										defaultValue={moment(new Date(), dateFormat)}
										format={dateFormat}
										onChange={(e) => setToday(moment(e).format("DD/MM/YYYY"))}
									/>
									<Button type="primary" onClick={handleSubmit}>
										Lưu lại
									</Button>
									<Button type="primary" danger onClick={() => setCreateAttedance(false)}>Huỷ bỏ</Button>
								</Space>

								<Row>
									<Col span={24}>
										<Spin
											spinning={
												getAttendancesStatus === "loading" ||
												addAttendanceStatus === "loading"
											}
										>
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
							</div>
							:
							<>
								<Space>
									<RangePicker
										style={{ marginTop: 20, marginBottom: 20 }}
										onChange={handleChangeLessonRange}
									/>
									<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateAttedance(true)}>Tạo mới</Button>

								</Space>
								<Table
									loading={getAttendancesStatus === "loading"}
									dataSource={get(attendances, "students", [])}
									columns={lessonCols}
									bordered
									rowKey="id"
									size="small"
									pagination={false}
								/>
							</>
					}

				</TabPane>
				<TabPane tab="Bài tập" key={STUDY_TABS.TEST}>
					<Tests classInfo={classInfo} students={studentList} />
				</TabPane>
				<TabPane tab="DS buổi học" key={STUDY_TABS.LESSON}>
					<Lesson classInfo={classInfo} />
				</TabPane>
				<TabPane tab="Album ảnh" key={STUDY_TABS.ALBUM}>
					<ClassPhotos class_id={params.class_id} />
				</TabPane>
			</Tabs>
			<SendNotiModal studentInfo={studentList[notiIndex]} show={showNotiForm} setShow={setShowNotiForm} />
		</Layout.Content>
	);
}

// SendNotiModal component
function SendNotiModal(prop: {
	studentInfo: { id: number; name: string; birthday: string, parent: { id: number, name: string } },
	show: boolean,
	setShow: (param: boolean) => void
}): JSX.Element {
	const { studentInfo, show, setShow } = prop;
	const dispatch = useAppDispatch();
	const [message, setMessage] = useState("");

	const sending = useSelector((state: RootState) => state.notificationReducer.addNotificationStatus);

	function handleSendNotification() {
		setShow(false);
		const user_ids: number[] = [];
		console.log(studentInfo)
		const userID = get(studentInfo, "parent.id", 0);
		if (userID > 0) user_ids.push(userID)
		const payload = {
			user_ids,
			message: {
				title: "Thông báo vào lớp!",
				body: message,
				data: {
					uri: NOTIFI_URIS.ATTENDANCE_REMIND
				}
			}
		}
		dispatch(actionAddNotification(payload)).finally(() => {
			setShow(false);
		})
	}

	return (
		<>
			<Modal title="Gửi thông báo cho phụ huynh!"
				visible={show}
				onCancel={() => setShow(false)}
				onOk={handleSendNotification}
				footer={[
					<Button key="btncancel" onClick={() => setShow(false)}>Huỷ bỏ</Button>,
					<Button
						key="btnsubmit"
						type="primary"
						onClick={() => handleSendNotification()}
						loading={sending === 'loading' ? true : false}>Gửi đi
					</Button>

				]}
			>
				<Input.TextArea
					placeholder="Write something here!"
					style={{ marginBottom: 20 }}
					value={message}
					onChange={(e) => setMessage(e.target.value)} />
			</Modal>

		</>
	)
}
