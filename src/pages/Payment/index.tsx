/* eslint-disable @typescript-eslint/prefer-as-const */
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import { Button, Col, DatePicker, Input, Layout, Row, Space, Spin, Statistic, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { DatePattern, formatDate } from "utils/dateUltils";
import { formatCurrency } from "utils/ultil";
import AddNewPayment from "./AddNewPayment";
const { RangePicker } = DatePicker;

function Payment(): JSX.Element {
	const [searchRange, setSearchRange] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [rawTableData, setRawTableData] = useState<any>([]);
	const [filteredTableData, setFilteredTableData] = useState<any>(null);
	const [incomeValue, setIncomeValue] = useState(0);
	const [spenValue, setSpenValue] = useState(0);

	console.log("re-render");
	const tableSource = useMemo(
		() => [
			{
				id: 1,
				name: "Tran Thi Nham",
				type: 0,
				amount: 15000000,
				reason: "Mua iphone để dùng",
				note: "lên đời",
				date: new Date(),
			},
			{
				id: 1,
				name: "Bui Van Huu",
				type: 0,
				amount: 300000,
				reason: "Mua Mac M1 để code",
				note: "Mac cũ bé quá",
				date: new Date(),
			},
			{
				id: 1,
				name: "Quỳnh",
				type: 1,
				amount: 1000000,
				reason: "Bán quần xì để có tiền",
				note: "dạo này ăn chơi hơi lố",
				date: new Date(),
			},
		],
		[]
	);

	useEffect(() => {
		setRawTableData(tableSource);
		const payment = { income: 0, spend: 0 };
		if (filteredTableData) {
			payment.income = filteredTableData.reduce((amount: number, object: any) => {
				return object.type === 1 ? (amount += object.amount) : amount;
			}, 0);
			payment.spend = filteredTableData.reduce((amount: number, object: any) => {
				return object.type === 0 ? (amount += object.amount) : amount;
			}, 0);
		} else {
			payment.income = tableSource.reduce((amount: number, object: any) => {
				return object.type === 1 ? (amount += object.amount) : amount;
			}, 0);
			payment.spend = tableSource.reduce((amount: number, object: any) => {
				return object.type === 0 ? (amount += object.amount) : amount;
			}, 0);
		}
		setIncomeValue(payment.income);
		setSpenValue(payment.spend);
	}, [filteredTableData, tableSource]);

	function handleTableFilter(textFilter: string) {
		const filterData = rawTableData.filter((o: any) =>
			Object.keys(o).some((k) => String(o[k]).toLowerCase().includes(textFilter.toLowerCase()))
		);
		setFilteredTableData(filterData);
	}

	function searchRangeChange(_: any, dateString: string[]) {
		setSearchRange(dateString);
	}

	function handleSearchRange() {
		const start = searchRange[0];
		const end = searchRange[1];
		console.log(start, end);

		setLoading(true);
		setTimeout(() => setLoading(false), 2000);
		// Todo call action to search range
	}

	const tableColumn = [
		{
			width: "15%",
			title: "Họ tên",
			dataIndex: "name",
			key: "name",
			render: function NameCol(name: string): JSX.Element {
				return (
					<a>
						<Space>
							<UserOutlined />
							{name}
						</Space>
					</a>
				);
			},
		},
		{
			width: "5%",
			title: "Thu/Chi",
			dataIndex: "type",
			key: "type",
			align: "center" as "center",
			render: function TypeCol(type: number): JSX.Element {
				return <span style={{ color: type === 0 ? "#cf1322" : "#3f8600" }}>{type === 0 ? "Chi" : "Thu"}</span>;
			},
		},
		{
			width: "10%",
			title: "Số tiền",
			dataIndex: "amount",
			key: "amount",
			render: function amountCol(amount: number, row: any): JSX.Element {
				return <span style={{ color: row.type === 0 ? "#cf1322" : "#3f8600" }}>{formatCurrency(amount)}</span>;
			},
		},
		{
			width: "40%",
			title: "Lý do",
			dataIndex: "reason",
			key: "reason",
		},
		{
			width: "18%",
			title: "Ghi chú",
			dataIndex: "note",
			key: "note",
		},
		{
			width: "12%",
			title: "Ngày tạo",
			dataIndex: "date",
			key: "date",
			render: function dateCol(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
		},
	];

	return (
		<Layout.Content style={{ height: 1000 }}>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear onChange={({ target: input }) => handleTableFilter(input.value)} />
				</Col>
				<Col style={{ marginLeft: 20 }}>
					<AddNewPayment />
				</Col>
				<Col style={{ marginLeft: 20 }}>
					<Row justify="start">
						<RangePicker allowEmpty={[true, true]} onChange={searchRangeChange} />
						<Button type="primary" onClick={handleSearchRange}>
							Tìm kiếm
						</Button>
					</Row>
				</Col>
			</Row>
			<Row style={{ justifyContent: "space-between" }}>
				<Space align="baseline" size="large">
					<Statistic title="Tổng thu" value={incomeValue} suffix="VND" valueStyle={{ color: "#3f8600" }} />
					<Statistic title="Tổng chi" value={spenValue} suffix="VND" valueStyle={{ color: "#cf1322" }} />
				</Space>
				<Statistic
					title="Tổng thu - tổng chi"
					value={incomeValue - spenValue}
					suffix="VND"
					valueStyle={{ color: incomeValue - spenValue < 0 ? "#cf1322" : "#3f8600" }}
				/>
			</Row>
			<Spin spinning={loading}>
				<Table
					size="small"
					pagination={{ pageSize: 20 }}
					dataSource={filteredTableData === null ? rawTableData : filteredTableData}
					columns={tableColumn}
					bordered
				/>
			</Spin>
		</Layout.Content>
	);
}

export default Payment;
