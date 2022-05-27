import {
	LikeOutlined,
	MessageOutlined,
	TeamOutlined,
	QuestionCircleOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { Button, Image, List, Space, DatePicker, Popconfirm } from "antd";
import useIsAdmin from "hooks/useIsAdmin";
import usePermissionList from "hooks/usePermissionList";
import { ClassType, StudentType, TestType } from "interface";
import { get } from "lodash";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import { actionDeleteTest, actionGetTestes } from "store/testes/slice";
import { defaul_image_base64, STUDY_TABS } from "utils/const";
import { isHavePermission } from "utils/ultil";
import AddTest from "./addTestModal";
import React from "react";
const { RangePicker } = DatePicker;

export function Tests(props: {
	classInfo: ClassType | null;
	students: StudentType[];
}): JSX.Element {
	const { classInfo, students } = props;
	const dispatch = useAppDispatch();
	const history = useHistory();

	const testList = useSelector((state: RootState) => state.testReducer.testes);
	const deleteTestStatus = useSelector((state: RootState) => state.testReducer.testes);

	const getTestListState = useSelector(
		(state: RootState) => state.testReducer.getTestesStatus
	);
	const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();

	const activeTab = useSelector(
		(state: RootState) => state.classReducer.classDetailTabKey
	);
	useEffect(() => {
		if (classInfo && activeTab === STUDY_TABS.TEST) {
			dispatch(actionGetTestes({ class_id: classInfo.id }));
		}
	}, [classInfo, activeTab]);
	/* For Test */
	function handleChangePageOfTest(page: number) {
		dispatch(actionGetTestes({ class_id: get(classInfo, "id", 0), page }));
	}

	const handleChangeDateRange = (_: any, dateString: string[]) => {
		const from_date = dateString[0] || void 0;
		const to_date = dateString[1] || void 0;
		if (classInfo) {
			dispatch(actionGetTestes({ class_id: classInfo.id, from_date, to_date }));
		}
	};

	const handleDeleteTest = async (id: number) => {
		await dispatch(actionDeleteTest(id))
        if(classInfo)
            dispatch(actionGetTestes({ class_id: classInfo.id }));
	};
	return (
		<>
			<Space>
				<RangePicker
					style={{ marginTop: 20, marginBottom: 20 }}
					onChange={handleChangeDateRange}
				/>
				{(isAdmin || isHavePermission(permissionList, "tests.store")) && (
					<AddTest classInfo={classInfo} />
				)}
			</Space>
			<List
				itemLayout="vertical"
				size="large"
				loading={getTestListState === "loading" || deleteTestStatus === "loading"}
				pagination={{
					onChange: handleChangePageOfTest,
					pageSize: 20,
					total: get(testList, "total", 0),
				}}
				dataSource={get(testList, "data", [])}
				renderItem={(item: TestType) => (
					<List.Item
						onClick={() =>
							history.push({
								pathname: `/study-tests/${item.id}/${get(classInfo, "id", 0)}`,
							})
						}
						style={{ backgroundColor: "white", cursor: "pointer" }}
						key={item.id}
						actions={[
							<Space
								key="act1"
								onClick={(e) => {
									e.stopPropagation();
								}}
							>
								<Button type="link" icon={<TeamOutlined />} />
								{students.length}
							</Space>,
							<Space
								key="act2"
								onClick={(e) => {
									e.stopPropagation();
								}}
							>
								{/* Todo refer liked */}
								<Button type="link" icon={<LikeOutlined />} /> 0
							</Space>,
							<Space
								key="act3"
								onClick={(e) => {
									e.stopPropagation();
								}}
							>
								{/* Todo refer commented */}
								<MessageOutlined /> 0
							</Space>,
						]}
						extra={
							<>
								<Popconfirm
									title="Xác nhận xoá bài test?"
									icon={<QuestionCircleOutlined />}
									onConfirm={(e) => {
                                        e?.stopPropagation();
										handleDeleteTest(item.id);
									}}
								>
									<Button
										type="link"
										danger
										icon={<DeleteOutlined />}
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										Xoá bài test
									</Button>
								</Popconfirm>
								<Image
									width={100}
									height={100}
									alt="logo"
									src={
										item.content_files.length > 0
											? item.content_files[0].url
											: "error"
									}
									fallback={defaul_image_base64}
									onClick={(e) => {
										e.stopPropagation();
									}}
								/>
							</>
						}
					>
						<List.Item.Meta title={item.title} description={<>{item.date}</>} />
					</List.Item>
				)}
			/>
		</>
	);
}
