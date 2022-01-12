import {
	Calendar,
	Card,
	Col,
	Layout,
	Row,
	Tag,
	Timeline,
	DatePicker,
} from "antd";
import { Line } from "@ant-design/charts";
import { useEffect } from "react";
import io from "socket.io-client";
import { useTranslation } from "react-i18next";
import { RootState, useAppDispatch } from "store/store";
import { actionGetDayoffs } from "store/settings/dayoff";
import { useSelector } from "react-redux";
import { get } from "lodash";
import moment, { Moment } from "moment";
const { RangePicker } = DatePicker;
if (process.env.REACT_APP_SOCKET) {
	window.socket = io(process.env.REACT_APP_SOCKET);
}

function Home(): JSX.Element {
	const dispatch = useAppDispatch();
	const dayoffs = useSelector(
		(state: RootState) => state.dayoffReducer.dayoffs
	);

	useEffect(() => {
		dispatch(actionGetDayoffs({}));
	}, [dispatch]);

	useEffect(() => {
		const socket = window.socket;
		if (!socket) return;
		socket.on("message", (res: string) => console.log(res));

		socket.on("connect", () => {
			console.log("socket connected");
		});

		socket.on("disconnect", () => {
			console.log("socket disconnect");
		});
	}, []);

	const data = [
		{ month: "06/2021", value: 210 },
		{ month: "07/2021", value: 234 },
		{ month: "08/2021", value: 233 },
		{ month: "09/2021", value: 289 },
		{ month: "10/2021", value: 302 },
		{ month: "11/2021", value: 268 },
		{ month: "12/2021", value: 350 },
	];

	const config = {
		data,
		height: 250,
		xField: "month",
		yField: "value",
		point: {
			size: 5,
			shape: "diamond",
		},
	};

	function onPanelChange(value: { format: (arg0: string) => any }, mode: any) {
		console.log(value.format("YYYY-MM-DD"), mode);
	}

	function scheduleCellRender(value: Moment) {
		let isDayoff = false;
		// console.log(value,dayoffs);
		get(dayoffs, "data", []).forEach(
			(element: { from_date: string; to_date: string }) => {
				// console.log(value,moment(element.from_date,'day'));
				if (
					value.isSame(moment(element.from_date, "day")) ||
					value.isSame(moment(element.to_date)) ||
					value.isBetween(moment(element.from_date), moment(element.to_date))
				) {
					isDayoff = true;
					return dayoffs;
				}
			}
		);
		console.log(isDayoff);
		if (isDayoff) {
			return (
				<>
					<Tag color="#f50">Ngày nghỉ</Tag>
				</>
			);
		}
	}

	return (
		<Layout.Content>
			<div className="site-card-wrapper">
				<h3>Thống kê</h3>
				<Row gutter={16}>
					<Col span={8}>
						<Card
							title={<span style={{ color: "#fff" }}>Số lượng học sinh</span>}
							bordered={true}
							style={{ backgroundColor: "#3498db", color: "#fff" }}
						>
							350
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={<span style={{ color: "#fff" }}>Doanh thu</span>}
							bordered={true}
							style={{ backgroundColor: "#27ae60", color: "#fff" }}
						>
							10.000.000.000
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={<span style={{ color: "#fff" }}>Chi tiêu</span>}
							bordered={true}
							style={{ backgroundColor: "#e67e22", color: "#fff" }}
						>
							300.000.000
						</Card>
					</Col>
				</Row>
			</div>
			<div className="site-card-wrapper" style={{ marginTop: 20 }}>
				<Row gutter={16}>
					<Col span={16}>
						<Card
							title="Thống kê học sinh"
							bordered={true}
							extra={<RangePicker picker="month" />}
						>
							<Line {...config} />
						</Card>
						<Card
							title="Doanh thu gần đây"
							type="inner"
							bordered={true}
							style={{ marginTop: 20 }}
							extra={<a href="#">See All</a>}
						>
							<Timeline>
								<Timeline.Item>
									<a>Daonh thu sale - 1,200,000</a>
									<p>
										<small>2022-01-01 10:21</small>
									</p>
								</Timeline.Item>
								<Timeline.Item>
									<a>Daonh thu sale - 2,400,000</a>
									<p>
										<small>2022-01-03 11:22</small>
									</p>
								</Timeline.Item>
								<Timeline.Item>
									<a>Daonh thu học phí - 5,700,000</a>
									<p>
										<small>2022-01-07 16:12</small>
									</p>
								</Timeline.Item>
							</Timeline>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Lịch trung tâm" bordered={true}>
							<Calendar
								fullscreen={false}
								onPanelChange={onPanelChange}
								dateCellRender={scheduleCellRender}
							/>
						</Card>
						<Card title="Today" bordered={true} style={{ marginTop: 20 }}>
							<div className="daily-schedule">
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<strong>Tên lớp học</strong>
									<strong>5:00 PM - 7:00 PM</strong>
								</div>
								<p>Tên giáo viên/tên bài học</p>
							</div>
							<div className="daily-schedule">
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<strong>Tên lớp học</strong>
									<strong>5:00 PM - 7:00 PM</strong>
								</div>
								<p>Tên giáo viên/tên bài học</p>
							</div>
							<div className="daily-schedule">
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<strong>Tên lớp học</strong>
									<strong>5:00 PM - 7:00 PM</strong>
								</div>
								<p>Tên giáo viên/tên bài học</p>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		</Layout.Content>
	);
}

export default Home;
