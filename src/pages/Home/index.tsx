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
	Popover,
} from "antd";
import { GiftOutlined } from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { RootState, useAppDispatch } from "store/store";
import { actionGetDayoffs } from "store/settings/dayoff";
import { useSelector } from "react-redux";
import { get } from "lodash";
import moment, { Moment } from "moment";
import numeral from "numeral";
import { actionGetBirthdayList, actionGetClassesToday, actionGetRevenueStat, actionGetStudentStat } from "store/statistical/slice";
import { ClassType, StudentType, UserType } from "interface";
import { actionGetRevenues, RevenuesTypeList } from "store/revenues/slice";
import { useHistory } from "react-router-dom";
const { RangePicker } = DatePicker;

interface ChartDataType {
	month: string;
	type: string;
	total: number;
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
	const birthdayList = useSelector(
		(state: RootState) => state.statisticalReducer.birthdayList
	);


	const revenuesData = useSelector((state: RootState) => state.revenuesReducer.revenues);


	useEffect(() => {
		const from_date = moment(moment().startOf('month')).startOf("week");
		const to_date = moment(from_date).day(+41)
		dispatch(actionGetDayoffs({
			from_date: moment(from_date).format('YYYY-MM-DD'),
			to_date: moment(to_date).format('YYYY-MM-DD')
		}));
		dispatch(actionGetRevenueStat({}));
		dispatch(actionGetClassesToday({}));
		dispatch(actionGetStudentStat({
			from_date: moment().startOf('year').format("YYYY-MM"),
			to_date: moment().format("YYYY-MM")
		}));
		dispatch(actionGetBirthdayList({
			from_date: moment(from_date).format('YYYY-MM-DD'),
			to_date: moment(to_date).format('YYYY-MM-DD')
		}));
	}, [dispatch]);

	useEffect(() => {
		if (studentsStat) {
			const data: ChartDataType[] = [];
			Object.keys(studentsStat.total_student).map((key: string) =>
				data.push({
					month: key,
					total: studentsStat.total_student[key],
					type: "in"
				}));
			Object.keys(studentsStat.total_student_off).map((key: string) =>
				data.push({
					month: key,
					total: studentsStat.total_student_off[key],
					type: "out"
				}));
			setStChartData(data)
		}
	}, [studentsStat])

	const config = {
		data: stChartData,
		height: 250,
		xField: "month",
		yField: "total",
		seriesField: 'type',
		color: ['#1979C9', '#e74c3c'],
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

	function onPanelChange(value:Moment, mode: any) {
		console.log(value.format("YYYY-MM-DD"), mode);
		const from_date = moment(value.startOf('month')).startOf("week");
		const to_date = moment(from_date).day(+41)
		dispatch(actionGetBirthdayList({
			from_date: moment(from_date).format('YYYY-MM-DD'),
			to_date: moment(to_date).format('YYYY-MM-DD')
		}));
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
		let employees_birthday: UserType[] = [];
		let students_birthday: StudentType[] = [];
		if (birthdayList) {
			birthdayList.students.forEach((st) => {
				if (moment(dateValue).format('M') === moment(st.birthday).format('M')
					&& moment(dateValue).format('D') === moment(st.birthday).format('D'))
					students_birthday.push(st);
			})
			birthdayList.users.forEach((user) => {
				if (moment(dateValue).format('M') === moment(user.profile?.birthday).format('M')
					&& moment(dateValue).format('D') === moment(user.profile?.birthday).format('D'))
					employees_birthday.push(user);
			})
		}
		return (
			<>
				{isDayoff && <Tag style={{fontSize:10}} color="#ff7979">Ngày nghỉ</Tag>}
				{
					employees_birthday.map((emp) =>
						<div key={emp.id} style={{ fontSize: 10, backgroundColor: "#f6e58d", paddingLeft: 4, paddingRight: 4, marginBottom: 4 }}>
							<Popover
								title={<><GiftOutlined style={{ color: "#e84393" }} /> Sinh nhật nhân viên</>}
								content={
									<div>
										<a>{emp.profile?.name}</a>
										<p>Phone: {emp.phone}</p>
									</div>
								}
							>
								<GiftOutlined style={{ color: "#e84393" }} />
								<span> {emp.profile?.name}</span>
							</Popover>
						</div>)
				}
				{
					students_birthday.map((st) =>
						<div
							key={st.id}
							style={{ fontSize: 10, backgroundColor: "#dff9fb", paddingLeft: 4, paddingRight: 4, marginBottom: 4 }}
						>
							<Popover
								title={<><GiftOutlined style={{ color: "#e84393" }} /> Sinh nhật học sinh</>}
								content={
									<div>
										<a>{st.name}</a>
										<p>Lớp: {get(st, "class.name", "")}</p>
									</div>
								}
							>
								<GiftOutlined style={{ color: "#e84393" }} />
								<span> {st.name}</span>
							</Popover>

						</div>)
				}
			</>
		);
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
				<Row gutter={16}>
					<Card type="inner" title="Lịch trung tâm" bordered={true} style={{ marginTop: 20 }}>
						<Calendar
							fullscreen={true}
							onPanelChange={onPanelChange}
							dateCellRender={scheduleCellRender}
						/>
					</Card>
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
							extra={<Button type="link" onClick={() => history.push("/payments/revenue")}>Xem thêm</Button>}
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
