import { NotificationOutlined } from "@ant-design/icons";
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
	Table,
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import TextArea from "antd/lib/input/TextArea";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import {
	actionGetAttendances,
	actionUpdateAttendance,
	AttendanceStudentComment,
} from "store/attendances/slice";
import { actionGetClass } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { updateStudentStatus } from "store/students/slice";
import { dayOptions } from "utils/const";

interface AttendanceDetailType {
	id: number;
	name: string;
	birthday: string;
	isAttendance: boolean;
	conduct_point: string;
	reminder: string;
	comment: string;
}

function AttendanceDetails(): JSX.Element {
	const { class_id, date: attendanceDate } = useParams() as {
		class_id: string;
		date: string;
	};
	const { pathname } = useLocation();
	const [editMode, setEditMode] = useState(false);
	const history = useHistory();
	const dispatch = useAppDispatch();
	//state
	const [checkAll, setCheckAll] = useState(false);
	const [studentList, setStudentList] = useState<AttendanceDetailType[]>([]);

	//selector
	const storeAttendances = useSelector(
		(state: RootState) => state.attendanceReducer.attendances
	);
	const storeGetAttendanceStatus = useSelector(
		(state: RootState) => state.attendanceReducer.getAttendancesStatus
	);
	const storeUpdateAttendanceStatus = useSelector(
		(state: RootState) => state.attendanceReducer.updateAttendanceStatus
	);
	const storeClassInfo = useSelector(
		(state: RootState) => state.classReducer.classInfo
	);

	useEffect(() => {
		if (storeAttendances) {
			const { students = [] } = storeAttendances;
			const { attendances = {} } = storeAttendances;
			const currentAttendance = attendances[attendanceDate];
			const studentList = students.reduce(
				(listStudents: AttendanceDetailType[], currentStudent) => {
					const { id, name, birthday } = currentStudent;
					const attendanceInList = currentAttendance.find(
						(st) => st.student_id === id
					);
					const conduct_point = attendanceInList?.conduct_point
						? attendanceInList.conduct_point.toString()
						: "";
					const reminder = attendanceInList?.reminder
						? attendanceInList.reminder
						: "";
					const comment = attendanceInList?.comment
						? attendanceInList.comment
						: "";
					listStudents.push({
						id,
						name,
						birthday,
						isAttendance: !!attendanceInList,
						conduct_point,
						reminder,
						comment,
					});
					return listStudents;
				},
				[]
			);
			setStudentList(studentList);
			setCheckAll(currentAttendance.length === students.length);
		}
	}, [attendanceDate, storeAttendances]);

	useEffect(() => {
		dispatch(actionGetAttendances({ class_id: parseInt(class_id) }));
		dispatch(actionGetClass({ class_id: parseInt(class_id) }));
	}, [dispatch, class_id]);

	useEffect(() => {
		pathname.includes("edit-attendace") && setEditMode(true);
	}, [pathname]);

	useEffect(() => {
		if (storeUpdateAttendanceStatus === "success") {
			dispatch(actionGetAttendances({ class_id: parseInt(class_id) }));
			dispatch(actionGetClass({ class_id: parseInt(class_id) }));
		}
	}, [class_id, dispatch, storeUpdateAttendanceStatus]);

	function handleCheckAll(e: CheckboxChangeEvent) {
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
	function handleCheckbox(index: number) {
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

	function handleChangeCoductPoint(
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) {
		const conduct_point = e.target.value;
		studentList[index].conduct_point = conduct_point;
	}

	function handleChangeReminder(reminder: string, index: number) {
		studentList[index].reminder = reminder;
	}

	function handleChangeComment(comment: string, index: number) {
		studentList[index].comment = comment;
	}

	function handleCancelEdit(){
		dispatch(actionGetAttendances({ class_id: parseInt(class_id) }));
		setEditMode(false);
	}

	function handleSubmit() {
		if (!storeClassInfo) {
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
		if (students.length > 0) {
			const params = {
				class_id: storeClassInfo.id,
				students,
				date: attendanceDate,
			};
			dispatch(actionUpdateAttendance(params)).finally(()=>{
				if(storeUpdateAttendanceStatus === "success"){
					setEditMode(false)
				}
			})
		} else {
			notification.warn({ message: "Danh sách điểm danh trống" });
		}
	}

	function handleNotityToParent() {
		//
	}

	const attendance_columns: any = [
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
					<Checkbox
						onChange={handleCheckAll}
						disabled={!editMode}
						checked={checkAll}
					/>
				</div>
			),
			key: "operation",
			dataIndex: "isAttendance",
			render: function col(
				isAttendance: boolean,
				_: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<div style={{ textAlign: "center" }}>
						<Checkbox
							onChange={() => handleCheckbox(index)}
							checked={isAttendance}
							disabled={!editMode}
						/>
					</div>
				);
			},
		},
		{
			title: "Điểm hạnh kiểm",
			key: "point",
			dataIndex: "conduct_point",
			width: 150,
			render: function col(
				conduct_point: number,
				_: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<Input
						className="_input_"
						style={{ width: "100%" }}
						type="number"
						step={0.1}
						placeholder={editMode ? "điểm hạnh kiểm" : ""}
						onChange={(e) => handleChangeCoductPoint(e, index)}
						defaultValue={conduct_point}
						disabled={!editMode}
					/>
				);
			},
		},
		{
			title: "Reminder",
			key: "reminder",
			dataIndex: "reminder",
			render: function col(
				reminder: string,
				_: AttendanceDetailType,
				index: number
			): JSX.Element {
				return (
					<TextArea
						className="_input_"
						style={{ width: "100%" }}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder={editMode ? "Lời nhắc nhở" : ""}
						onChange={({ target: { value } }) => {
							handleChangeReminder(value, index);
						}}
						defaultValue={reminder}
						disabled={!editMode}
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
						style={{ width: "100%" }}
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
		{
			title: "",
			key: "action",
			dataIndex: "",
			width: 80,
			render: function col(student: AttendanceDetailType): JSX.Element {
				return (
					<Space>
						{" "}
						<Button
							icon={<NotificationOutlined />}
							type="link"
							onClick={() => handleNotityToParent()}
						/>
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<PageHeader
				className="site-page-header-responsive"
				onBack={() => history.goBack()}
				title={storeClassInfo?.name}
				subTitle="Chi tiết lớp học"
				footer={
					<>
						<Space style={{ paddingTop: 20, marginBottom: 20 }}>
							Ngày điểm danh: {moment(attendanceDate).format("DD-MM-YYYY")}
							{editMode && (
								<Button type="primary" onClick={handleSubmit}>
									Lưu lại
								</Button>
							)}
							{
								editMode ?  <Button type="primary" danger onClick={()=>handleCancelEdit()}>Huỷ bỏ cập nhật</Button> : <Button type="primary" onClick={()=>setEditMode(true)}>Cập nhật</Button>
							}
						</Space>
						<div>
							<Spin
								spinning={
									storeGetAttendanceStatus === "loading" ||
									storeUpdateAttendanceStatus === "loading"
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
						</div>
					</>
				}
			>
				<Descriptions
					size="small"
					column={2}
					style={{ backgroundColor: "white", marginTop: 20 }}
					bordered
				>
					<Descriptions.Item label="Giáo viên">
						<a>{get(storeClassInfo, "user.profile.name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ngày bắt đầu">
						<strong>
							{moment(get(storeClassInfo, "start_date", "") ?? void 0).format(
								"DD-MM-YYYY"
							)}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Số học sinh">
						<strong style={{ color: "#e67e22" }}>
							{get(storeClassInfo, "students_num", 0)}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Lịch học">
						<strong>
							{(() => {
								const sortedSchedule = storeClassInfo?.schedule
									? [...storeClassInfo.schedule]
									: [];
								return sortedSchedule
									.sort()
									.map((day) => dayOptions[day])
									.join(", ");
							})()}{" "}
							({storeClassInfo?.schedule_time ?? "Chưa có thời gian học"})
						</strong>
					</Descriptions.Item>
				</Descriptions>
			</PageHeader>
		</Layout.Content>
	);
}

export default AttendanceDetails;
