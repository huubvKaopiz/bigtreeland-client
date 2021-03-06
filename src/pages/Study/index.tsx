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
import { dayOptions, STUDY_TABS } from "utils/const";
import { isHavePermission } from 'utils/ultil';
import { ClassPhotos } from "./Album";
import Documents from "./Documents";
import { Lesson } from "./Lesson";
import StudentsOfClass from "./Students/StudentsOfClass";
import { StudySumaryBoard } from "./Summary";
import { CreateStudySummary } from "./Summary/createModal";
import { Tests } from "./Test";
import React from 'react';

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
			dispatch(actionGetClass({ class_id: parseInt(params.class_id), params: { students: true, active_periodinfo: true } }));
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
					subTitle="Qu???n l?? h???c t???p"
					extra={[
						(isAdmin || isHavePermission(permissionList, "notifications.store")) &&
						<Button
							type="primary"
							icon={<NotificationOutlined />}
							onClick={() => setShowNotiForm(true)}
						>
							G???i th??ng b??o
						</Button>
					]}
				></PageHeader>
				<Descriptions
					size="small"
					column={2}
					style={{ backgroundColor: "white", marginTop: 20 }}
					bordered
				>
					<Descriptions.Item label="Gi??o vi??n">
						<a>{get(classInfo, "user.profile.name", "")}</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ng??y b???t ?????u">
						<strong>
							{moment(get(classInfo, "start_date", "") ?? void 0).format(
								"DD-MM-YYYY"
							)}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item label="S??? h???c sinh">
						<strong style={{ color: "#e67e22" }}>
							{get(classInfo, "students_num", 0)}
						</strong>
					</Descriptions.Item>
					<Descriptions.Item label="L???ch h???c">
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
							({classInfo?.schedule_time ?? "Ch??a c?? th???i gian h???c"})
						</strong>
					</Descriptions.Item>

					<Descriptions.Item label="Chu k??? t??nh h???c ph??">
						{
							classInfo?.active_period_tuition
								&& moment().isSameOrAfter(moment(classInfo.active_period_tuition?.from_date))
								&& moment().isSameOrBefore(moment(classInfo.active_period_tuition?.to_date))
								?
								<strong>
									{moment(classInfo.active_period_tuition.from_date).format("DD-MM-YYYY")} &rarr;
									{moment(classInfo.active_period_tuition.to_date).format("DD-MM-YYYY")}
								</strong>
								:
								<Alert type="warning"
									description="Hi???n l???p h???c ??ang kh??ng c?? chu k??? h???c ph?? ???????c k??ch ho???t cho n??y h??m nay. 
												??i???u n??y ?????ng ngh??a v???i t???o bu???i h???c h??m n??y s??? kh??ng t??nh h???c ph?? cho h???c sinh.
												Vui l??ng x??c nh???n l???i v???i qu???n l?? ????? k??ch ho???t b???ng h???c ph??."
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
					<TabPane tab="DS h???c sinh" key={STUDY_TABS.STUDENTS}>
						<StudentsOfClass students={get(classInfo, "students", [])} class_id={get(classInfo, "id", 0)} />
					</TabPane>
					<TabPane tab="DS bu???i h???c" key={STUDY_TABS.LESSON}>
						<Lesson
							classInfo={classInfo}
							students={get(classInfo, "students", [])}
						/>
					</TabPane>
					<TabPane tab="B??i t???p" key={STUDY_TABS.TEST}>
						<Tests classInfo={classInfo} students={get(classInfo, "students", [])} />
					</TabPane>
					<TabPane tab="T??i li???u" key={STUDY_TABS.DOCUMENTS}>
						<Documents classInfo={classInfo} />
					</TabPane>
					<TabPane tab="Album ???nh" key={STUDY_TABS.ALBUM}>
						<ClassPhotos class_id={params.class_id} />
					</TabPane>
					<TabPane tab="B???ng t???ng k???t" key={STUDY_TABS.SUMMARY}>
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
				/>
			</Spin>
		</Layout.Content>
	);
}
