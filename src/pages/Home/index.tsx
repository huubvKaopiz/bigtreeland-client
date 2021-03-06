import { Line } from "@ant-design/charts";
import { GiftOutlined, CloseOutlined } from "@ant-design/icons";
import {
	Button,
	Calendar,
	Card,
	Col,
	DatePicker,
	Layout,
	Popover,
	Row,
	Space,
	Tag,
	Timeline,
} from "antd";
import { ClassType, StudentType, UserType } from "interface";
import { get } from "lodash";
import moment, { Moment } from "moment";
import numeral from "numeral";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetRevenues, RevenuesTypeList } from "store/revenues/slice";
import { actionAddDayoff, actionDeleteDayoff, actionGetDayoffs, actionSetAddDayoffStateIdle, actionSetDeleteDayoffStateIdle } from "store/settings/dayoff";
import {
	actionGetBirthdayList,
	actionGetClassesToday,
	actionGetRevenueStat,
	actionGetStudentStat,
} from "store/statistical/slice";
// import { useTranslation } from "react-i18next";
import { RootState, useAppDispatch } from "store/store";
import { submitDateFormat } from "utils/const";
import React from "react";
const { RangePicker } = DatePicker;

interface ChartDataType {
	month: string;
	type: string;
	total: number;
}

function Home(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const [stChartData, setStChartData] = useState<ChartDataType[]>([]);
	const [daySelected, setDaySelected] = useState(moment(new Date(), submitDateFormat));

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

	const revenuesData = useSelector(
		(state: RootState) => state.revenuesReducer.revenues
	);

	const addDayoffState = useSelector((state: RootState) => state.dayoffReducer.addDayoffState);
	const deleteDayoffState = useSelector((state: RootState) => state.dayoffReducer.deleteDayoffState);

	useEffect(() => {
		const from_date = moment().startOf("month").format("YYYY-MM-DD");
		const to_date = moment().endOf("month").format("YYYY-MM-DD");
		dispatch(actionGetRevenues({ from_date, to_date }));
	}, [])

	useEffect(() => {
		const from_date = moment(moment().startOf("month")).startOf("week");
		const to_date = moment(from_date).day(+41);
		dispatch(
			actionGetDayoffs({
				from_date: moment(from_date).format("YYYY-MM-DD"),
				to_date: moment(to_date).format("YYYY-MM-DD"),
			})
		);
		dispatch(actionGetRevenueStat({}));
		dispatch(actionGetClassesToday({}));
		dispatch(
			actionGetStudentStat({
				from_date: moment().startOf("year").format("YYYY-MM"),
				to_date: moment().format("YYYY-MM"),
			})
		);
		dispatch(
			actionGetBirthdayList({
				from_date: moment(from_date).format("YYYY-MM-DD"),
				to_date: moment(to_date).format("YYYY-MM-DD"),
			})
		);
	}, [dispatch]);

	useEffect(() => {
		if (addDayoffState === "success" || deleteDayoffState === "success") {
			dispatch(actionGetDayoffs({}));
			dispatch(actionSetAddDayoffStateIdle());
			dispatch(actionSetDeleteDayoffStateIdle());
		}
	}, [dispatch, addDayoffState, deleteDayoffState])

	useEffect(() => {
		if (studentsStat) {
			const data: ChartDataType[] = [];
			Object.keys(studentsStat.total_student).map((key: string) =>
				data.push({
					month: key,
					total: studentsStat.total_student[key],
					type: "Nh???p h???c",
				})
			);
			Object.keys(studentsStat.total_student_off).map((key: string) =>
				data.push({
					month: key,
					total: studentsStat.total_student_off[key],
					type: "Ngh??? h???c"
				}));
			setStChartData(data)
		}
	}, [studentsStat]);

	const config = {
		data: stChartData,
		height: 250,
		xField: "month",
		yField: "total",
		seriesField: "type",
		color: ["#1979C9", "#e74c3c"],
		point: {
			size: 5,
			shape: "diamond",
		},
	};

	function onChangeStatisticalDateRange(
		dates: any,
		dateStrings: [string, string]
	) {
		if (dates === null) {
			dispatch(actionGetRevenueStat({}));
		} else {
			dispatch(
				actionGetRevenueStat({
					from_date: dateStrings[0],
					to_date: dateStrings[1],
				})
			);
		}
	}

	function onChangeStudentStatDateRang(
		dates: any,
		dateStrings: [string, string]
	) {
		if (dates === null) return;
		else {
			dispatch(
				actionGetStudentStat({
					from_date: dateStrings[0],
					to_date: dateStrings[1],
				})
			);
		}
	}

	function onPanelChange(value: Moment, mode: any) {
		console.log(value.format("YYYY-MM-DD"), mode);
		const from_date = moment(value.startOf("month")).startOf("week");
		const to_date = moment(from_date).day(+41);
		dispatch(
			actionGetBirthdayList({
				from_date: moment(from_date).format("YYYY-MM-DD"),
				to_date: moment(to_date).format("YYYY-MM-DD"),
			})
		);
	}

	function handleSubmitDayOff() {
		if (daySelected) {
			dispatch(actionAddDayoff(
				{ from_date: moment(daySelected).format("YYYY-MM-DD"), to_date: moment(daySelected).format("YYYY-MM-DD") }))
		}
	}

	function scheduleCellRender(value: Moment) {
		let isDayoff = false;
		// console.log(value,dayoffs);
		let dayoff_id = 0;
		const dateValue = moment(value).format("YYYY-MM-DD");
		for (let index = 0; index < get(dayoffs, "data", []).length; index++) {
			const element = get(dayoffs, "data", [])[index];
			if (moment(dateValue).isSame(moment(element.from_date))) {
				isDayoff = true;
				dayoff_id = element.id;
				break;
			}
		}

		let employees_birthday: UserType[] = [];
		let students_birthday: StudentType[] = [];
		if (birthdayList) {
			birthdayList.students.forEach((st) => {
				if (
					moment(dateValue).format("M") === moment(st.birthday).format("M") &&
					moment(dateValue).format("D") === moment(st.birthday).format("D")
				)
					students_birthday.push(st);
			});
			birthdayList.users.forEach((user) => {
				if (
					moment(dateValue).format("M") ===
					moment(user.profile?.birthday).format("M") &&
					moment(dateValue).format("D") ===
					moment(user.profile?.birthday).format("D")
				)
					employees_birthday.push(user);
			});
		}
		return (
			<>
				{isDayoff ? (
					<Tag style={{ fontSize: "1.4rem", marginBottom: 5 }} color="red">
						Ng??y ngh???
						<Button
							danger
							size="small"
							type="link"
							icon={<CloseOutlined />}
							onClick={() => {
								dispatch(actionDeleteDayoff(dayoff_id));
							}}
						/>
					</Tag>
				)
					: value.isSame(daySelected, "day") && <Button loading={addDayoffState === "loading"} type="primary" onClick={() => handleSubmitDayOff()}>?????t ng??y ngh???</Button>

				}
				{employees_birthday.map((emp) => (
					<div
						key={emp.id}
						style={{
							fontSize: "1.4rem",
							backgroundColor: "#f6e58d",
							paddingLeft: 4,
							paddingRight: 4,
							marginBottom: 4,
						}}
					>
						<Popover
							title={
								<>
									<GiftOutlined style={{ color: "#e84393" }} /> Sinh nh???t nh??n
									vi??n
								</>
							}
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
					</div>
				))}
				{students_birthday.map((st) => (
					<div
						key={st.id}
						style={{
							fontSize: "1.4rem",
							backgroundColor: "#dff9fb",
							paddingLeft: 4,
							paddingRight: 4,
							marginBottom: 4,
						}}
					>
						<Popover
							title={
								<>
									<GiftOutlined style={{ color: "#e84393" }} /> Sinh nh???t h???c
									sinh
								</>
							}
							content={
								<div>
									<a>{st.name}</a>
									<p>L???p: {get(st, "class.name", "")}</p>
								</div>
							}
						>
							<GiftOutlined style={{ color: "#e84393" }} />
							<span> {st.name}</span>
						</Popover>
					</div>
				))}
			</>
		);
	}

	return (
		<Layout.Content>
			<div className="site-card-wrapper">
				<h2>Th???ng k??</h2>
				<Space
					style={{
						justifyContent: "flex-end",
						width: "100%",
						marginBottom: 20,
					}}
				>
					<RangePicker
						onChange={onChangeStatisticalDateRange}
						allowEmpty={[true, true]}
					/>
				</Space>
				<Row gutter={16}>
					<Col span={8}>
						<Card
							title={<h3 style={{ color: "#fff" }}>S??? l?????ng h???c sinh</h3>}
							bordered={true}
							style={{
								backgroundColor: "#3498db",
								color: "#fff",
								fontSize: "2rem",
							}}
						>
							{studentsStat?.total}
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={
								<Space>
									<h3 style={{ color: "#fff" }}>Danh thu</h3>
								</Space>
							}
							bordered={true}
							style={{
								backgroundColor: "#27ae60",
								color: "#fff",
								fontSize: "2rem",
							}}
						>
							{numeral(revenueAmount?.receipts).format("0,0 $")}
						</Card>
					</Col>
					<Col span={8}>
						<Card
							title={<h3 style={{ color: "#fff" }}>Chi ti??u</h3>}
							bordered={true}
							style={{
								backgroundColor: "#e67e22",
								color: "#fff",
								fontSize: "2rem",
							}}
						>
							{numeral(revenueAmount?.payment_slips).format("0,0 $")}
						</Card>
					</Col>
				</Row>
				<Row gutter={16} style={{ padding: 10 }}>
					<Card
						type="inner"
						title="L???ch trung t??m"
						bordered={true}
						style={{ marginTop: 20 }}
					>
						<Calendar
							fullscreen={true}
							onPanelChange={onPanelChange}
							dateCellRender={scheduleCellRender}
							onSelect={(value: Moment) => setDaySelected(value)}
						/>
					</Card>
				</Row>
			</div>
			<div className="site-card-wrapper" style={{ marginTop: 20 }}>
				<Row gutter={16}>
					<Col span={16}>
						<Card
							title="Th???ng k?? h???c sinh"
							type="inner"
							bordered={true}
							extra={
								<RangePicker
									picker="month"
									defaultValue={[moment().startOf("year"), moment()]}
									onChange={onChangeStudentStatDateRang}
								/>
							}
						>
							<Line {...config} />
						</Card>
					</Col>
					<Col span={8}>
						<Card title="L???ch h???c h??m nay" type="inner" bordered={true}>
							{classesToday.map((cl: ClassType) => (
								<div className="daily-schedule" key={cl.id} style={{ marginBottom: 10 }}>
									<div
										style={{ display: "flex", justifyContent: "space-between" }}
									>
										<strong>{cl.name}</strong>
										<strong>{cl.schedule_time}</strong>
									</div>
									<a>{get(cl, "user.profile.name")}</a>
								</div>
							))}
						</Card>
						<Card
							title="Doanh thu g???n ????y"
							type="inner"
							bordered={true}
							style={{ marginTop: 20 }}
							extra={
								<Button
									type="link"
									onClick={() => history.push("/payments/revenue")}
								>
									Xem th??m
								</Button>
							}
						>
							<Timeline>
								{revenuesData?.data?.map(
									(item, index) =>
										index < 5 && (
											<Timeline.Item key={index}>
												<a>
													{`${RevenuesTypeList[item.type]}`} -{" "}
													{numeral(item.amount).format("0,0")}
												</a>
												<p>
													<small>
														{moment(item.date).format("DD-MM-YYYY HH:mm")}
													</small>
												</p>
											</Timeline.Item>
										)
								)}
							</Timeline>
						</Card>
					</Col>
				</Row>
			</div>
		</Layout.Content>
	);
}

export default Home;
