import { LikeOutlined, MessageOutlined, NotificationOutlined, TeamOutlined, UploadOutlined } from "@ant-design/icons";
import {
	Button,
	Col,
	DatePicker,
	Descriptions,
	Image,
	Input,
	Layout,
	List,
	PageHeader,
	Row,
	Space,
	Spin,
	Table,
	Tabs,
	Upload,
} from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { TestType } from "interface";
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
import { actionGetClass } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import AddStudentsModal from "./addStudentsModal";
import AddTest from "./addTestModal";

const dateFormat = "DD-MM-YYYY";
export default function ClassDetail(): JSX.Element {
	const params = useParams() as { class_id: string };
	const history = useHistory();
	const dispatch = useAppDispatch();
	const { TabPane } = Tabs;
	const [today, setToday] = useState(moment(new Date()).format(dateFormat));
	const [attendantList, setAttendantList] = useState([0]);
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
			dispatch(actionGetClass(parseInt(params.class_id)));
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
		else listComments.push({ id: `${id}`, comment: "", conduct_point: e.target.value });
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
	];

	for (const key in get(attendances, "attendances", [])) {
		attendance_columns.push({
			title: `${moment(key).format("DD/MM/YYYY")}`,
			dataIndex: "",
			key: `${key}`,
			fixed: false,
			render: function col(st: { id: number; name: string }): JSX.Element {
				return <Checkbox checked={isAttendant(st.id, key)} disabled />;
			},
		});
	}

	const todayCol = {
		title: (
			<div style={{ textAlign: "center" }}>
				<Checkbox onChange={handleCheckAll} checked={checkAll} />
			</div>
		),
		key: "operation",
		dataIndex: "",
		// width: 10,
		render: function col(st: { id: number; name: string }): JSX.Element {
			return (
				<div style={{ textAlign: "center" }}>
					<Checkbox onChange={() => handleCheckbox(st.id)} checked={isAttendantToday(st.id)} />
				</div>
			);
		},
	};

	const commentCol = {
		title: "Nhận xét",
		key: "comment",
		dataIndex: "",
		// width: 80,
		render: function col(st: { id: number }): JSX.Element {
			return <Input style={{ width: "100%" }} placeholder="Nhận xét" onChange={(e) => handleChangeComment(e, st.id)} />;
		},
	};
	const conductPointCol = {
		title: "Điểm hạnh kiểm",
		key: "point",
		dataIndex: "",
		// width: 80,
		render: function col(st: { id: number }): JSX.Element {
			return (
				<Space>
					{" "}
					<Input placeholder="điểm hạnh kiểm" onChange={(e) => handleChangeCoductPoint(e, st.id)} />
				</Space>
			);
		},
	};
	const actionCol = {
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
	};

	attendance_columns.push(todayCol);
	attendance_columns.push(commentCol);
	attendance_columns.push(conductPointCol);
	attendance_columns.push(actionCol);

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
						<TabPane tab="Học tập" key="1">
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
									onChange: (page) => {
										// console.log(page);
									},
									pageSize: 3,
								}}
								dataSource={get(testList, "data", [])}
								renderItem={(item: TestType) => (
									<List.Item
										onClick={() => history.push({ pathname: `/tests/${item.id}` })}
										style={{ backgroundColor: "white", cursor: "pointer" }}
										key={item.id}
										actions={[
											<Space key="act1">
												<Button type="link" icon={<TeamOutlined />} />
												10
											</Space>,
											<Space key="act2">
												<Button type="link" icon={<LikeOutlined />} /> 0
											</Space>,
											<Space key="act3">
												<MessageOutlined /> 0
											</Space>,
										]}
										extra={
											<Image
												width={100}
												height={100}
												alt="logo"
												src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
											/>
										}
									>
										<List.Item.Meta title={item.title} description={<>{item.date}</>} />
									</List.Item>
								)}
							/>
							,
						</TabPane>
						<TabPane tab="Album ảnh" key="3">
							<Space style={{ paddingTop: 20, marginBottom: 20 }}>
								<Upload>
									<Button type="primary" icon={<UploadOutlined />}>
										Upload
									</Button>
								</Upload>
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
				<Descriptions size="small" column={2} style={{ backgroundColor: "white", padding: 20 }}>
					<Descriptions.Item label="Giáo viên">
						<a>{get(classInfo, "name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ngày bắt đầu">
						{moment(get(classInfo, "start_date", "") ?? void(0)).format("DD-MM-YYYY")}
					</Descriptions.Item>
					<Descriptions.Item label="Số học sinh">{classInfo?.students_num}</Descriptions.Item>
					<Descriptions.Item label="Lịch học">{classInfo?.schedule}</Descriptions.Item>
				</Descriptions>
			</PageHeader>
		</Layout.Content>
	);
}
