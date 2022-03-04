import {
	Calendar,
	Card,
	Col,
	Layout,
	Row,
	Tag,
	Timeline,
	DatePicker,
	Space,
	Button,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { RootState, useAppDispatch } from "store/store";
import { actionGetDayoffs } from "store/settings/dayoff";
import { useSelector } from "react-redux";
import { get } from "lodash";
import moment, { Moment } from "moment";
import numeral from "numeral";
import { actionGetClassesToday, actionGetRevenueStat, actionGetStudentStat } from "store/statistical/slice";
import { ClassType } from "interface";
import { actionGetRevenues, RevenuesTypeList } from "store/revenues/slice";
import { useHistory } from "react-router-dom";
const { RangePicker } = DatePicker;

interface ChartDataType{
	month:string;
	type:string;
	total:number;
}

function Home(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const [stChartData, setStChartData] = useState<ChartDataType[]>([])

	const dayoffs = useSelector(
		(state: RootState) => state.dayoffReducer.dayoffs
	);

	const revenueAmount = useSelector(
		(state: RootState) => state.statisticalReducer.revenueStat
	);

	const classesToday = useSelector(
		(state: RootState) => state.statisticalReducer.classesToday
	);

	const studentsStat = useSelector(
		(state: RootState) => state.statisticalReducer.studentStat
	);

	const revenuesData = useSelector((state: RootState) => state.revenuesReducer.revenues);


	useEffect(() => {
		dispatch(actionGetDayoffs({}));
		dispatch(actionGetRevenueStat({}))
		dispatch(actionGetStudentStat({
			from_date: moment().startOf('year').format("YYYY-MM"),
			to_date: moment().format("YYYY-MM")
		}))
		dispatch(actionGetClassesToday({}))
		dispatch(actionGetRevenues({}))
	}, [dispatch]);

	useEffect(() => {
		if (studentsStat) {
			const data: ChartDataType[] = [];
			Object.keys(studentsStat.total_student).map((key: string) => data.push({ month: key, total: studentsStat.total_student[key],type:"in" }));
			Object.keys(studentsStat.total_student_off).map((key: string) => data.push({ month: key, total: studentsStat.total_student[key],type:"out" }));
			setStChartData(data)
		}
	}, [studentsStat])


	const config = {
		data: stChartData,
		height: 250,
		xField: "month",
		yField: "total",
		seriesField:'type',
		point: {
			size: 5,
			shape: "diamond",
		},
	};

	function onChangeStatisticalDateRange(dates: any, dateStrings: [string, string]) {
		if (dates === null) {
			dispatch(actionGetRevenueStat({}))
		} else {
			dispatch(actionGetRevenueStat({ from_date: dateStrings[0], to_date: dateStrings[1] }))
		}
	}

	function onChangeStudentStatDateRang(dates: any, dateStrings: [string, string]) {
		if (dates === null) return
		else {
			dispatch(actionGetStudentStat({ from_date: dateStrings[0], to_date: dateStrings[1] }))
		}
	}

	function onPanelChange(value: { format: (arg0: string) => any }, mode: any) {
		console.log(value.format("YYYY-MM-DD"), mode);
	}

	function scheduleCellRender(value: Moment) {
		let isDayoff = false;
		// console.log(value,dayoffs);
		const dateValue = moment(value).format("YYYY-MM-DD");
		get(dayoffs, "data", []).forEach(
			(element: { from_date: string; to_date: string }) => {
				if (moment(dateValue).isSame(moment(element.from_date))) {
					isDayoff = true;
				}
			}
		);
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
				<Space style={{ justifyContent: "flex-end", width: "100%", marginBottom: 20 }}>
					<RangePicker onChange={onChangeStatisticalDateRange} allowEmpty={[true, true]} />
				</Space>
				<Row gutter={16}>

					<Col span={8}>
						<Card
							title={<span style={{ color: "#fff" }}>Số lượng học sinh</span>}
							bordered={true}
							style={{ backgroundColor: "#3498db", color: "#fff" }}
						>
							{
								studentsStat?.total
							}
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={
								<Space>
									<span style={{ color: "#fff" }}>Danh thu</span>

								</Space>
							}
							bordered={true}
							style={{ backgroundColor: "#27ae60", color: "#fff" }}
						>
							{
								numeral(revenueAmount?.receipts).format("0,0 $")
							}
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={<span style={{ color: "#fff" }}>Chi tiêu</span>}
							bordered={true}
							style={{ backgroundColor: "#e67e22", color: "#fff" }}
						>
							{
								numeral(revenueAmount?.payment_slips).format("0,0 $")
							}
						</Card>
					</Col>
				</Row>
			</div>
			<div className="site-card-wrapper" style={{ marginTop: 20 }}>
				<Row gutter={16}>
					<Col span={16}>
						<Card
							title="Thống kê học sinh"
							type="inner"
							bordered={true}
							extra={<RangePicker picker="month" defaultValue={[moment().startOf("year"), moment()]} onChange={onChangeStudentStatDateRang} />}
						>
							<Line {...config} />
						</Card>
						<Card type="inner" title="Lịch trung tâm" bordered={true} style={{ marginTop: 20 }}>
							<Calendar
								fullscreen={true}
								onPanelChange={onPanelChange}
								dateCellRender={scheduleCellRender}
							/>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Lịch học hôm nay" type="inner" bordered={true}>
							{
								classesToday.map((cl: ClassType) =>
									<div className="daily-schedule" key={cl.id}>
										<div
											style={{ display: "flex", justifyContent: "space-between" }}
										>
											<strong>{cl.name}</strong>
											<strong>{cl.schedule_time}</strong>
										</div>
										<a>{get(cl, "user.profile.name")}</a>
									</div>
								)
							}
						</Card>
						<Card
							title="Doanh thu gần đây"
							type="inner"
							bordered={true}
							style={{ marginTop: 20 }}
							extra={<Button type="link" onClick={()=>history.push("/payments/revenue")}>Xem thêm</Button>}
						>
							<Timeline>
								{
									revenuesData?.data?.map((item, index) => index < 5 && (
										<Timeline.Item>
											<a>{`${RevenuesTypeList[item.type]}`} - {numeral(item.amount).format("0,0")}</a>
											<p>
												<small>{moment(item.date).format("DD-MM-YYYY HH:mm")}</small>
											</p>
										</Timeline.Item>
									))
								}
							</Timeline>
						</Card>
					</Col>
				</Row>
			</div>
		</Layout.Content>
	);
}

export default Home;
