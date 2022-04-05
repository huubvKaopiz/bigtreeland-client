import { NotificationOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Layout, notification, PageHeader, Spin, Tabs } from "antd";
import SendNotificationModal from "components/SendNotificationModal";
import useIsAdmin from 'hooks/useIsAdmin';
import usePermissionList from 'hooks/usePermissionList';
import get from "lodash/get";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
	actionGetClass,
	actionSetClassDetailTabKey
} from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { dayOptions, NOTIFI_URIS, STUDY_TABS } from "utils/const";
import { isHavePermission } from 'utils/ultil';
import { ClassPhotos } from "./Album";
import Documents from "./Documents";
import { Lesson } from "./Lesson";
import StudentsOfClass from "./Students/StudentsOfClass";
import { StudySumaryBoard } from "./Summary";
import { CreateStudySummary } from "./Summary/createModal";
import { Tests } from "./Test";

export default function Test(): JSX.Element {
	const params = useParams() as { class_id: string };
	const dispatch = useAppDispatch();
	const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();

	const { TabPane } = Tabs;
	const [showNotiform, setShowNotiForm] = useState(false);
	const [showActivePeriodTuitionWarning, setShowActivePeriodTuitionWarning] = useState(false)
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

	const addStudentState = useSelector((state: RootState) => state.classReducer.addStudentsStatus);


	useEffect(() => {
		if (params.class_id || addStudentState === 'success') {
			dispatch(actionGetClass({ class_id: parseInt(params.class_id), params: { students: true, active_periodinfo: false } }));
			// dispatch(actionGetStudents({ class_id: parseInt(params.class_id) }));
		}
	}, [dispatch, params, addStudentState]);


	useEffect(() => {
		if (classInfo) {
			const { period_tuition_lastest } = classInfo;
			const today = moment().format("YYYY-MM-DD");
			if (period_tuition_lastest) {
				if (
					moment(period_tuition_lastest.from_date).isSameOrBefore(moment(today))
					&&
					moment(period_tuition_lastest.to_date).isSameOrAfter(moment(today))
				)
					if (period_tuition_lastest.active === 0) {
						setShowActivePeriodTuitionWarning(true)
					}
			} else setShowActivePeriodTuitionWarning(true)
		}
	}, [classInfo])

	return (
		<Layout.Content>
			<Spin spinning={getClassInfoState === "loading"}>
				<PageHeader
					className="site-page-header-responsive"
					onBack={() => window.history.back()}
					title={classInfo?.name}
					subTitle="Quản lý học tập"
					extra={[
						(isAdmin || isHavePermission(permissionList, "notifications.store")) &&
						<Button
							type="primary"
							icon={<NotificationOutlined />}
							onClick={() => setShowNotiForm(true)}
						>
							Gửi thông báo
						</Button>
					]}
				></PageHeader>
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

					<Descriptions.Item label="Chu kỳ tính học phí">
						{
							classInfo?.period_tuition_lastest
								&& classInfo.period_tuition_lastest.active === 1
								&& moment().isSameOrAfter(moment(classInfo.period_tuition_lastest?.from_date)) 
								&& moment().isSameOrBefore(moment(classInfo.period_tuition_lastest?.to_date)) 
								?
								<strong>
									{moment(classInfo.period_tuition_lastest.from_date).format("DD-MM-YYYY")} &rarr;
									{moment(classInfo.period_tuition_lastest.to_date).format("DD-MM-YYYY")}
								</strong>
								:
								<Alert type="warning"
									description="Hiện lớp học đang không có chu kỳ học phí được kích hoạt cho này hôm nay. 
												Điều này đồng nghĩa với tạo buổi học hôm này sẽ không tính học phí cho học sinh.
												Vui lòng xác nhận lại với quản lý để kích hoạt bảng học phí."
								/>

						}
					</Descriptions.Item>
				</Descriptions>
				{
					showActivePeriodTuitionWarning &&
					<div style={{ marginBottom: 15, marginTop: 15 }}>

					</div>}
				<Tabs
					style={{ marginTop: 20 }}
					activeKey={activeTab}
					onChange={(activeKey) =>
						dispatch(actionSetClassDetailTabKey(activeKey))
					}
				>
					<TabPane tab="DS học sinh" key={STUDY_TABS.STUDENTS}>
						<StudentsOfClass students={get(classInfo, "students", [])} class_id={get(classInfo, "id", 0)} />
					</TabPane>
					<TabPane tab="DS buổi học" key={STUDY_TABS.LESSON}>
						<Lesson
							classInfo={classInfo}
							students={get(classInfo, "students", [])}
						/>
					</TabPane>
					<TabPane tab="Bài tập" key={STUDY_TABS.TEST}>
						<Tests classInfo={classInfo} students={get(classInfo, "students", [])} />
					</TabPane>
					<TabPane tab="Tài liệu" key={STUDY_TABS.DOCUMENTS}>
						<Documents classInfo={classInfo} />
					</TabPane>
					<TabPane tab="Album ảnh" key={STUDY_TABS.ALBUM}>
						<ClassPhotos class_id={params.class_id} />
					</TabPane>
					<TabPane tab="Bảng tổng kết" key={STUDY_TABS.SUMMARY}>
						{
							(isAdmin || isHavePermission(permissionList, "study-summary-boards.store")) &&
							<div style={{ marginTop: 10, marginBottom: 20 }}>
								<CreateStudySummary
									class_id={+params.class_id}
									classList={null}
								/>
							</div>
						}
						<StudySumaryBoard class_id={+params.class_id} />
					</TabPane>
				</Tabs>
				<SendNotificationModal
					show={showNotiform}
					setShow={setShowNotiForm}
					students={get(classInfo, "students", [])}
					uri={NOTIFI_URIS.STUDY}
				/>
			</Spin>
		</Layout.Content>
	);
}
