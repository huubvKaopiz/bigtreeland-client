import {
	Descriptions,
	Layout,
	PageHeader,
	Spin,
	Tabs,
} from "antd";
import { get } from "lodash";
import moment from "moment";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { actionGetClass, actionSetClassDetailTabKey } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { dayOptions, STUDY_TABS } from "utils/const";
import { Lesson } from "./Lesson";
import { ClassPhotos } from "./Album";
import { Tests } from "./Test";
import AddStudentsModal from "pages/Classes/addStudentsModal";
import { StudySumaryBoard } from "./Summary";
import { CreateStudySummary } from "./Summary/createModal";
import { actionGetStudents } from "store/students/slice";

export default function (): JSX.Element {
	const params = useParams() as { class_id: string };
	const dispatch = useAppDispatch();
	const { TabPane } = Tabs;

	// application states
	const activeTab = useSelector(
		(state: RootState) => state.classReducer.classDetailTabKey
	);

	const classInfo = useSelector(
		(state: RootState) => state.classReducer.classInfo
	);
	const getClassInfoState = useSelector(
		(state: RootState) => state.classReducer.getClassStatus
	);

	const students = useSelector(
		(state: RootState) => state.studentReducer.students
	);

	useEffect(() => {
		if (params.class_id) {
			dispatch(actionGetClass({ class_id: parseInt(params.class_id)}));
			dispatch(actionGetStudents({ class_id: parseInt(params.class_id)}));

		}
	}, [dispatch, params]);

	return (
		<Layout.Content>
			<Spin
				spinning={
					getClassInfoState === "loading"
				}>
				<PageHeader
					className="site-page-header-responsive"
					onBack={() => window.history.back()}
					title={classInfo?.name}
					subTitle="Quản lý học tập"
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
					<TabPane tab="DS buổi học" key={STUDY_TABS.LESSON}>
						<Lesson classInfo={classInfo}  students={get(students,"data",[])}/>
					</TabPane>
					<TabPane tab="Bài tập" key={STUDY_TABS.TEST}>
						<Tests classInfo={classInfo} students={get(students,"data",[])}/>
					</TabPane>
					<TabPane tab="Album ảnh" key={STUDY_TABS.ALBUM}>
						<ClassPhotos class_id={params.class_id} />
					</TabPane>
					<TabPane tab="Bảng tổng kết" key={STUDY_TABS.SUMMARY}>
						 <div style={{marginTop:10, marginBottom:20}}>
						 <CreateStudySummary class_id={+params.class_id} classList={null} />
						 </div>
						<StudySumaryBoard class_id={+params.class_id} />
					</TabPane>
				</Tabs>
			</Spin>
		</Layout.Content>
	);
}


