import {
	Layout,
	PageHeader,
	Tabs,
	Button,
	DatePicker,
	Descriptions,
	Table,
	Space,
	List,
	Image,
	Input,
	Row,
	Col,
} from "antd";
import { TeamOutlined, LikeOutlined, MessageOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import { actionAddAttendance, actionGetAttendances } from "store/attendances/slice";
import { useSelector } from "react-redux";
import { actionGetClass } from "store/classes/slice";
import { get } from "lodash";
import AddStudentsModal from "./addStudentsModal";
import Checkbox from "antd/lib/checkbox/Checkbox";
import AddTest from "./addTestModal";
import { TestType } from "interface";
// import numeral from 'numeral';

const dateFormat = "YYYY-MM-DD";
export default function ClassDetail(): JSX.Element {
	const params = useParams() as { class_id: string };
	const history = useHistory();
	const dispatch = useAppDispatch();
	const { TabPane } = Tabs;
	const [today, setToday] = useState(moment(new Date()).format(dateFormat));
	const [attendantList, setAttendantList] = useState([0]);
	// const classInfo = location.state.classInfo as ClassType;
	const attendances = useSelector((state: RootState) => state.attendanceReducer.attendances);
	const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
	const testList = useSelector((state: RootState) => state.testReducer.testes);

	const listComments: { sID: number; comment: string }[] = [];

	useEffect(() => {
		if (params.class_id) {
			dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
			dispatch(actionGetClass(parseInt(params.class_id)));
		}
	}, [dispatch, params]);

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

	function handleCheckAll(e: any) {
		setAttendantList([0]);
		const newList: number[] = [];
		if (e.target.checked) {
			get(attendances, "students", []).map((el) => {
				newList.push(el.id);
			});
		}
		setAttendantList(newList);
	}

	function handleCheckbox(sID: number) {
		const newList = attendantList;
		const found = attendantList.indexOf(sID);
		console.log(found);
		if (found === -1) {
			newList.push(sID);
		} else {
			newList.splice(found, 1);
		}
		setAttendantList(newList);
	}

	function handleChangeComment(e: any, sID: number) {
		const f = listComments.findIndex((element) => element.sID === sID);
		if (f >= 0) {
			listComments[f].comment = e.target.value;
		} else {
			listComments.push({
				sID: sID,
				comment: e.target.value,
			});
		}
	}

	function handleSubmit() {
		if (attendantList.length > 0 && classInfo) {
			const params = {
				class_id: classInfo.id,
				teacher_id: get(classInfo, "employee.id", 0),
				student_ids: attendantList,
				date: today,
			};
			dispatch(actionAddAttendance(params));
		}
	}
	const attendance_columns: any[] = [
		{
			title: "Họ tên",
			// width: 80,
			dataIndex: "name",
			key: "name",
			fixed: true,
			render: function col(value: string): JSX.Element {
				return <span>{value}</span>;
			},
		},
		{
			title: "Ngày sinh",
			// width: 30,
			dataIndex: "birthday",
			key: "birthday",
			fixed: true,
			render: function col(value: string): JSX.Element {
				return <span>{moment(value).format("DD-MM-YYYY")}</span>;
			},
		},
	];

	for (const key in get(attendances, "attendances", [])) {
		attendance_columns.push({
			title: `${moment(key).format("DD/MM/YYYY")}`,
			// width: 80,
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
			<>
				<Checkbox onChange={handleCheckAll} />
			</>
		),
		key: "operation",
		dataIndex: "",
		// width: 10,
		fixed: false,
		render: function col(st: { id: number; name: string }): JSX.Element {
			return <Checkbox onChange={() => handleCheckbox(st.id)} checked={isAttendantToday(st.id)} />;
		},
	};

	const commentCol = {
		title: "Nhận xét",
		key: "comment",
		dataIndex: "",
		// width: 80,
		fixed: false,
		render: function col(st: { id: number }): JSX.Element {
			return (
				<Space>
					{" "}
					<Input placeholder="Nhận xét" onChange={(e) => handleChangeComment(e, st.id)} />
				</Space>
			);
		},
	};
	attendance_columns.push(todayCol);
	attendance_columns.push(commentCol);

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
								<Col span={16}>
									<Table
										dataSource={get(attendances, "students", [])}
										columns={attendance_columns}
										bordered
										rowKey="id"
										size="small"
										pagination={false}
									/>
								</Col>
							</Row>
						</TabPane>
						<TabPane tab="Bài test" key="3">
							<Space style={{ paddingTop: 20, marginBottom: 20 }}>
								<AddTest classInfo={classInfo} />
							</Space>
							<List
								itemLayout="vertical"
								size="large"
								pagination={{
									onChange: (page) => {
										console.log(page);
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
					</Tabs>
				}
			>
				<Descriptions size="small" column={2} style={{ backgroundColor: "white", padding: 20 }}>
					<Descriptions.Item label="Giáo viên">
						<a>{get(classInfo, "employee.name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ngày bắt đầu">
						{moment(get(classInfo, "start_date", "")).format("DD-MM-YYYY")}
					</Descriptions.Item>
					<Descriptions.Item label="Số buổi">{classInfo?.sessions_num}</Descriptions.Item>
					<Descriptions.Item label="Ngày kết thúc">
						{moment(get(classInfo, "end_date", "")).format("DD-MM-YYYY")}
					</Descriptions.Item>
					<Descriptions.Item label="Số học sinh">{classInfo?.students_num}</Descriptions.Item>
					<Descriptions.Item label="Lịch học">{classInfo?.schedule}</Descriptions.Item>
				</Descriptions>
			</PageHeader>
		</Layout.Content>
	);
}
