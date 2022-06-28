import { CheckCircleOutlined, CloseOutlined, FormOutlined, SaveOutlined } from "@ant-design/icons";
import {
	Button,
	Checkbox,
	Descriptions,
	Input,
	Layout,
	notification,
	PageHeader,
	Space,
	Spin,
	Table, Tooltip,
	DatePicker
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import TextArea from "antd/lib/input/TextArea";
import useIsAdmin from "hooks/useIsAdmin";
import usePermissionList from "hooks/usePermissionList";
import get from "lodash/get";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import {
	actionUpdateAttendance,
	AttendanceStudentComment
} from "store/attendances/slice";
import { actionGetClass } from "store/classes/slice";
import { actionGetLessonInfo } from "store/lesson/slice";
import { RootState, useAppDispatch } from "store/store";
import { dateFormat, dayOptions, submitDateFormat } from "utils/const";
import { isHavePermission } from "utils/ultil";

interface AttendanceDetailType {
	id: number;
	name: string;
	birthday: string;
	isAttendance: boolean;
	conduct_point: string;
	reminder: string;
	comment: string;
	reviewd: number;
}

function LessonDetails(): JSX.Element {
	const { class_id, lesson_id } = useParams() as {
		class_id: string;
		lesson_id: string;
	};
	const { pathname } = useLocation();
	const [editMode, setEditMode] = useState(false);
	const history = useHistory();
	const dispatch = useAppDispatch();
	const [lessonName, setLessonName] = useState("");
	const [date, setDate] = useState(moment(new Date()).format(dateFormat));
	const [hasAssistant, setHasAssistant] = useState(false);
	const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();


	//state
	const [checkAll, setCheckAll] = useState(false);
	const [studentList, setStudentList] = useState<AttendanceDetailType[]>([]);

	//app state
	const storeUpdateAttendanceStatus = useSelector(
		(state: RootState) => state.attendanceReducer.updateAttendanceStatus
	);

	const getLessonInfoState = useSelector(
		(state: RootState) => state.lessonReducer.getLessonInfoSate
	);

	const lessonInfo = useSelector(
		(state: RootState) => state.lessonReducer.lessonInfo
	);

	const classInfo = useSelector(
		(state: RootState) => state.classReducer.classInfo
	);

	useEffect(() => {
		dispatch(actionGetLessonInfo(+lesson_id))
		dispatch(actionGetClass({ class_id: parseInt(class_id), params: { students: true, active_periodinfo: false } }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, class_id]);

	useEffect(() => {
		pathname.includes("edit-attendace") && setEditMode(true);
	}, [pathname]);

	useEffect(() => {
		lessonInfoDataHandler();
	}, [lessonInfo, classInfo]);


	useEffect(() => {
		if (storeUpdateAttendanceStatus === "success") {
			setEditMode(false)
			dispatch(actionGetLessonInfo(+lesson_id));
		}
	}, [class_id, dispatch, storeUpdateAttendanceStatus]);

	const lessonInfoDataHandler = () => {
		if (lessonInfo && classInfo) {
			setLessonName(lessonInfo.title);
			setDate(moment(lessonInfo.date).format(dateFormat));
			setHasAssistant(lessonInfo.assistant_id ? true : false)
			const { students = [] } = classInfo;
			const { attendances = [], review_lessons = [] } = lessonInfo;
			const studentList = students.reduce(
				(listStudents: AttendanceDetailType[], currentStudent) => {
					const { id, name, birthday } = currentStudent;

					const attendanceInList = attendances.find(
						(st) => st.student_id === id
					);

					const reviewLessonInList = review_lessons.find((rl) => rl.student_id === id);

					const conduct_point = attendanceInList?.conduct_point
						? attendanceInList.conduct_point.toString()
						: "";
					const reminder = attendanceInList?.reminder
						? attendanceInList.reminder
						: "";
					const comment = attendanceInList?.comment
						? attendanceInList.comment
						: "";
					let reviewd = 0;
					if (attendanceInList === undefined && reviewLessonInList) {
						reviewd = reviewLessonInList.reviewed + 1;
					}
					listStudents.push({
						id,
						name,
						birthday,
						isAttendance: !!attendanceInList,
						conduct_point,
						reminder,
						comment,
						reviewd,
					});
					return listStudents;
				},
				[]
			);
			setStudentList(studentList);
			setCheckAll(attendances.length === students.length);
		}
	}

	console.log(date)

	const handleCheckAll = (e: CheckboxChangeEvent) => {
		const checked = e.target.checked;
		setStudentList(
			studentList.map((student) => {
				return {
					...student,
					isAttendance: checked,
				};
			})
		);
		setCheckAll(checked);
	}
	const handleCheckbox = (index: number) => {
		studentList[index].isAttendance = !studentList[index].isAttendance;
		const checkedNumber = studentList.reduce((checkedNumber, student) => {
			if (student.isAttendance) {
				checkedNumber++;
			}
			return checkedNumber;
		}, 0);
		setStudentList([...studentList]);
		setCheckAll(checkedNumber === studentList.length);
	}

	const handleChangeCoductPoint = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		const conduct_point = e.target.value;
		studentList[index].conduct_point = conduct_point;
	}

	const handleChangeReminder = (reminder: string, index: number) => {
		studentList[index].reminder = reminder;
	}

	const handleChangeComment = (comment: string, index: number) => {
		studentList[index].comment = comment;
	}

	const handleCancelEdit = () => {
		// dispatch(actionGetAttendances({ class_id: parseInt(class_id) }));
		lessonInfoDataHandler();
		setEditMode(false);
	}

	const handleSubmit = () => {
		if (!classInfo) {
			notification.warn({
				message: "Thông tin lớp học bị lỗi, xin hãy thử lại",
			});
			return;
		}
		const students = studentList.reduce<AttendanceStudentComment[]>(
			(list, student) => {
				if (student.isAttendance) {
					list.push({
						id: `${student.id}`,
						comment: student.comment,
						conduct_point: student.conduct_point,
						reminder: student.reminder,
					});
				}
				return list;
			},
			[]
		);
		if (students.length > 0 && lessonInfo) {
			const params = {
				// class_id:classInfo.id,
				lesson_id: lessonInfo.id,
				lesson_title: lessonName,
				assistant_id: hasAssistant ? classInfo.assistant_id : 0,
				students,
				date:moment(date, dateFormat).format(submitDateFormat)
			};
			dispatch(actionUpdateAttendance(params));
		} else {
			notification.warn({ message: "Danh sách điểm danh trống" });
		}
	}

	const attendance_columns: any = [
		{
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			with: 100,
			fixed: 'left',
			render: function col(value: string, record: { name: string, birthday: string }): JSX.Element {
				return <Tooltip title={`Ngày sinh: ${moment(record.birthday).format("DD-MM-YYYY")}`}><strong>{value}</strong></Tooltip>;
			},
		},
		{
			title: (
				<Tooltip title="Điểm danh">
					<Checkbox
						onChange={handleCheckAll}
						disabled={!editMode}
						checked={checkAll}
					/>
				</Tooltip>
			),
			key: "operation",
			dataIndex: "isAttendance",
			render: function col(
				isAttendance: boolean,
				_: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<Space style={{ textAlign: "center" }}>
						<Checkbox
							onChange={() => handleCheckbox(index)}
							checked={isAttendance}
							disabled={!editMode || _.reviewd === 2}
						/>
						{
							isAttendance ? null :
								_.reviewd === 2 ?
									<Tooltip title="Đã xem lại bài "><CheckCircleOutlined style={{ color: "#27ae60", marginLeft: 5 }} /></Tooltip> :
									<Tooltip title="Chưa xem lại bài "><CheckCircleOutlined style={{ color: "#e74c3c", marginLeft: 5 }} /></Tooltip>
						}
					</Space>
				);
			},
		},
		{
			title: "Hạnh kiểm",
			key: "point",
			dataIndex: "conduct_point",
			width: 100,
			render: function col(
				conduct_point: number,
				record: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<Input
						className="_input_"
						style={{ width: "100%", color: "#34495e" }}
						type="number"
						step={0.1}
						placeholder={editMode ? "0.0" : ""}
						onChange={(e) => handleChangeCoductPoint(e, index)}
						defaultValue={conduct_point}
						disabled={!editMode || !record?.isAttendance}
					/>
				);
			},
		},
		{
			title: "Nhắc nhở",
			key: "reminder",
			dataIndex: "reminder",
			render: function col(
				reminder: string,
				record: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<TextArea
						className="_input_"
						style={{ width: "100%", color: "#34495e" }}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder={editMode ? "Lời nhắc nhở" : ""}
						onChange={({ target: { value } }) => {
							handleChangeReminder(value, index);
						}}
						defaultValue={reminder}
						disabled={!editMode || !record?.isAttendance}
					/>
				);
			},
		},
		{
			title: "Nhận xét",
			key: "comment",
			dataIndex: "comment",
			render: function col(
				comment: string,
				_: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<TextArea
						className="_input_"
						style={{ width: "100%", color: "#34495e" }}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder={editMode ? "Nhận xét" : ""}
						onChange={({ target: { value } }) => {
							handleChangeComment(value, index);
						}}
						defaultValue={comment}
						disabled={!editMode}
					/>
				);
			},
		},
		// {
		// 	title: "",
		// 	key: "action",
		// 	dataIndex: "",
		// 	width: 80,
		// 	render: function col(student: AttendanceDetailType): JSX.Element {
		// 		return (
		// 			<Space>
		// 				{" "}
		// 				<Button
		// 					icon={<NotificationOutlined />}
		// 					type="link"
		// 					onClick={() => handleNotityToParent()}
		// 				/>
		// 			</Space>
		// 		);
		// 	},
		// },
	];

	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header-responsive"
				onBack={() => history.goBack()}
				title={moment(lessonInfo?.date || "").format(dateFormat)}
				subTitle={`Chi tiết buổi học`}
				extra={
					(isAdmin || isHavePermission(permissionList, "lessons.update")) &&
					<Space style={{ paddingTop: 20, marginBottom: 20 }}>
						{/* Ngày điểm danh: {moment(attendanceDate).format("DD-MM-YYYY")} */}
						{editMode && (
							<Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
								Lưu lại
							</Button>
						)}
						{
							editMode
								? <Button type="primary" icon={<CloseOutlined />} danger onClick={handleCancelEdit}>Huỷ bỏ cập nhật</Button>
								: <Button type="primary" icon={<FormOutlined />} onClick={() => setEditMode(true)}>Cập nhật</Button>
						}
					</Space>
				}
				footer={
					<Spin
						spinning={
							getLessonInfoState === "loading" ||
							storeUpdateAttendanceStatus === "loading"
						}
					>
						<Space style={{ marginTop: 15, marginBottom: 15 }}>
							<span>Ngày học:</span>
							<DatePicker
								disabledDate={(current) =>
									current && current > moment().endOf("day")
								}
								disabled={!editMode}
								allowClear={false}
								value={moment(date, dateFormat)}
								format={dateFormat}
								onChange={(date: any, dateStr: string) => setDate(dateStr)}
							/>
							<span>Tên buổi học:</span>
							<Input
								style={{ width: 460, color: "#34495e" }}
								placeholder="Nhập tên buổi học"
								value={lessonName}
								onChange={(e) => setLessonName(e.target.value)}
								disabled={!editMode}
							/>
							<Tooltip title={classInfo?.assistant_id === null ? "Lớp này chưa có trợ giảng" : "Điểm danh cho trợ giảng"}>
								<Checkbox
									checked={hasAssistant}
									disabled={classInfo?.assistant_id === null || !editMode}
									onChange={(e) => setHasAssistant(e.target.checked)}
								>
									<span style={{ color: "#2980b9" }}>Có trợ giảng</span>
								</Checkbox>
							</Tooltip>
						</Space>
						<Table
							dataSource={studentList}
							columns={attendance_columns}
							bordered
							rowKey="id"
							size="small"
							pagination={{
								pageSize:50
							}}
						/>
					</Spin>
				}
			>
				<Descriptions
					size="small"
					column={2}
					style={{ backgroundColor: "white", marginTop: 20 }}
					bordered
				>
					<Descriptions.Item label="Giáo viên">
						<a>{get(classInfo, "user.profile.name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Lớp học">
						<strong>
							{get(classInfo, "name", "")}
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
			</PageHeader>
		</Layout.Content>
	);
}

export default LessonDetails;
