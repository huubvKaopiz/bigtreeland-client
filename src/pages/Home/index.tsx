import { Calendar, Card, Col, Layout, Row, Timeline } from "antd";
import { Line } from "@ant-design/charts";
import { useEffect } from "react";
import io from "socket.io-client";
import { useTranslation } from "react-i18next";

if (process.env.REACT_APP_SOCKET) {
	window.socket = io(process.env.REACT_APP_SOCKET);
}

function Home(): JSX.Element {
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
		{ year: "Mon", value: 3 },
		{ year: "Tue", value: 4 },
		{ year: "Wed", value: 3.5 },
		{ year: "Thu", value: 5 },
		{ year: "Fri", value: 4.9 },
		{ year: "Sat", value: 6 },
		{ year: "Sun", value: 7 },
	];

	const config = {
		data,
		height: 250,
		xField: "year",
		yField: "value",
		point: {
			size: 5,
			shape: "diamond",
		},
	};

	function onPanelChange(value: { format: (arg0: string) => any }, mode: any) {
		console.log(value.format("YYYY-MM-DD"), mode);
	}

	return (
		<Layout.Content style={{ height: "100vh" }}>
			<div className="site-card-wrapper">
				<h3>Thống kê</h3>
				<Row gutter={16}>
					<Col span={8}>
						<Card title="Số lượng Sales" bordered={true} style={{ backgroundColor: "#3498db" }}>
							50
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Doanh thu" bordered={true} style={{ backgroundColor: "#9b59b6" }}>
							10.000.000.000
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Lợi nhuận" bordered={true} style={{ backgroundColor: "#27ae60" }}>
							300.000.000
						</Card>
					</Col>
				</Row>
			</div>
			<div className="site-card-wrapper" style={{ marginTop: 20 }}>
				<Row gutter={16}>
					<Col span={16}>
						<Card title="Thống kê lớp học" bordered={true}>
							<Line {...config} />
						</Card>
						<Card
							title="Lịch sử thanh toán"
							type="inner"
							bordered={true}
							style={{ marginTop: 20 }}
							extra={<a href="#">See All</a>}
						>
							<Timeline>
								<Timeline.Item>
									<a>Create a services site</a>
									<p>
										<small>2015-09-01</small>
									</p>
								</Timeline.Item>
								<Timeline.Item>
									<a>Create a services site</a>
									<p>
										<small>2015-09-01</small>
									</p>
								</Timeline.Item>
								<Timeline.Item>
									<a>Create a services site</a>
									<p>
										<small>2015-09-01</small>
									</p>
								</Timeline.Item>
							</Timeline>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Lịch thi/Schedule" bordered={true}>
							<Calendar fullscreen={false} onPanelChange={onPanelChange} />
						</Card>
						<Card title="Today" bordered={true} style={{ marginTop: 20 }}>
							<div className="daily-schedule">
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<strong>Tên lớp học</strong>
									<strong>5:00 PM - 7:00 PM</strong>
								</div>
								<p>Tên giáo viên/tên bài học</p>
							</div>
							<div className="daily-schedule">
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<strong>Tên lớp học</strong>
									<strong>5:00 PM - 7:00 PM</strong>
								</div>
								<p>Tên giáo viên/tên bài học</p>
							</div>
							<div className="daily-schedule">
								<div style={{ display: "flex", justifyContent: "space-between" }}>
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
