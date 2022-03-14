import {
	Image,
	Descriptions,
	Layout,
	PageHeader,
	Space,
	Typography,
	Spin,
	Divider,
} from "antd";
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import ReactPlayer from 'react-player'
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "store/store";
import {
	actionGetTest,
} from "store/testes/slice";
import moment from "moment";
import { dayOptions, fileIconList } from "utils/const";
import { isImageType } from "utils/ultil";
import { get } from "lodash";
import UpdateTestModal from "./updateTestModal";
import TestResults from "./TestResults";

const { Title } = Typography;
const dateFormat = "DD-MM-YYYY";

export function TestDetail(): JSX.Element {
	const params = useParams() as { test_id: string; class_id: string };
	const dispatch = useDispatch();
	const [videoPlaying, setVideoPlaying] = useState(false);
	const testInfo = useSelector(
		(state: RootState) => state.testReducer.testInfo
	);
	const storeGetTestStatus = useSelector(
		(state: RootState) => state.testReducer.getTestStatus
	);


	useEffect(() => {
		if (params.test_id) {
			dispatch(actionGetTest(+params.test_id));
		}
	}, [dispatch, params]);

	return (
		<Layout.Content>
			<Spin
				spinning={storeGetTestStatus === "loading"}
			>
				<PageHeader
					title={get(testInfo, "title", "")}
					subTitle={moment(get(testInfo, "date", null)).format(dateFormat)}
					onBack={() => window.history.back()}
					style={{ backgroundColor: "white", marginTop: 20 }}
					extra={[
						<UpdateTestModal
							testInfo={testInfo}
						/>,
					]}
				>
					<Descriptions size="small" column={2} bordered>

						<Descriptions.Item label="Lớp">
							<p>{testInfo?.class.name ?? ""}</p>
						</Descriptions.Item>
						<Descriptions.Item label="Số bài nộp">
							<a>
								{get(testInfo, "test_results", []).length}/
								{get(testInfo, "class.students_num", 0)}
							</a>
						</Descriptions.Item>
						<Descriptions.Item label="Lịch học">
							{(() => {
								const sortedSchedule = testInfo?.class.schedule
									? [...testInfo?.class.schedule]
									: [];
								return sortedSchedule
									.sort()
									.map((day) => dayOptions[day])
									.join(", ");
							})()}
							<span>({testInfo?.class.schedule_time ?? ""})</span>
						</Descriptions.Item>
					</Descriptions>
				</PageHeader>
				<div style={{ padding: "0 24px" }}>
					<Title style={{ marginTop: 20 }} level={5}>
						Đề bài
					</Title>
					{
						testInfo?.content_link &&
						<Space
							style={{ backgroundColor: "white", marginBottom: 10 }}
							size={[10, 10]}
							wrap
						>
							Link đề bài:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href={testInfo?.content_link}
							>
								{testInfo?.content_link}
							</a>
						</Space>
					}
					{
						get(testInfo, "content_files", []).length > 0 &&
						<div style={{}}>
							{/* <p>Đề bài</p> */}
							<Space style={{ backgroundColor: "white" }} size={[10, 10]} wrap>
								{testInfo?.content_files.map((file, index) => (
									<div key={index}>
										{
											file.type === 'mp4' || file.type === 'mov'
												?
												<div>
													<ReactPlayer url={file.url} playing={videoPlaying} />
													<div style={{
														justifyContent: 'center',
														alignItems: 'center',
														display: 'flex',
														fontSize: 18,
														marginTop: 10,
														color: "#e67e22"
													}}>
														{
															videoPlaying
																?
																<PauseCircleFilled onClick={() => setVideoPlaying(!videoPlaying)} />
																:
																<PlayCircleFilled onClick={() => setVideoPlaying(!videoPlaying)} />
														}
													</div>
												</div>
												:
												<Image
													width={100}
													height={100}
													style={{ objectFit: "cover" }}
													alt="logo"
													src={
														isImageType(file.type || "")
															? file.url
															: fileIconList[
															Object.keys(fileIconList).find(
																(k) => k === file.type
															) as keyof typeof fileIconList
															]
													}
												/>
										}

									</div>

								))}
							</Space>
						</div>
					}

					<Title style={{ marginTop: 20 }} level={5}>
						Đáp án
					</Title>
					{
						testInfo?.result_link &&
						<Space
							style={{ backgroundColor: "white", marginBottom: 10 }}
							size={[10, 10]}
							wrap
						>
							Link đáp án:{" "}
							<a
								target="_blank"
								rel="noreferrer"
								href={testInfo?.result_link}
							>
								{testInfo?.result_link ?? ""}
							</a>
						</Space>
					}
					{
						get(testInfo, "result_files", []).length > 0 &&
						<div>
							<p>Ảnh đáp án</p>
							<Space
								style={{ backgroundColor: "white" }}
								size={[10, 10]}
								wrap
							>
								{testInfo?.result_files.map((file, index) => (
									<div key={index}>
										<Image
											width={100}
											height={100}
											style={{ objectFit: "cover" }}
											alt="logo"
											src={
												isImageType(file.type || "")
													? file.url
													: fileIconList[
													Object.keys(fileIconList).find(
														(k) => k === file.type
													) as keyof typeof fileIconList
													]
											}
										/>
									</div>
								))}
							</Space>
						</div>
					}

					<Divider />
					<Title style={{ marginTop: 20 }} level={5}>
						Danh sách học sinh nộp bài
					</Title>
					<TestResults testInfo={testInfo} />
				</div>
			</Spin>
		</Layout.Content>
	);
}



