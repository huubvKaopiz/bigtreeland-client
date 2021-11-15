/* eslint-disable @typescript-eslint/prefer-as-const */
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import { Button, Col, DatePicker, Input, Layout, Row, Space, Spin, Statistic, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetPayments, PaymentSearchParam, PaymentTypeEnum, resetGetPaymentStatus } from "store/payments/slice";
import { RootState, useAppDispatch } from "store/store";
import { DatePattern, formatDate } from "utils/dateUltils";
import { formatCurrency } from "utils/ultil";
import AddNewPayment from "./AddNewPayment";
import PaymentDetails from "./PaymentDetails";
const { RangePicker } = DatePicker;

function Payment(): JSX.Element {
	const dispatch = useAppDispatch();
	const [searchRange, setSearchRange] = useState<string[]>(["", ""]);
	const [loading, setLoading] = useState(false);
	const [rawTableData, setRawTableData] = useState<any>([]);
	const [spenValue, setSpenValue] = useState(0);
	const [searchText, setSearchText] = useState("");
	const [showDrawer, setShowDrawer] = useState(false);
	const [currentDrawerData, setCurrentDrawerData] = useState(null);

	const paymentTableData = useSelector((state: RootState) => state.paymentReducer.payments);
	const statusGetPayment = useSelector((state: RootState) => state.paymentReducer.getPaymentStatus);

	useEffect(() => {
		console.log("call when mounted");
		const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
		const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
		setSearchRange([startOfMonth, endOfMonth]);
		// dispatch(actionGetPayments({fromDate: startOfMonth, toDate: endOfMonth}));
		// Todo change to get defaut current month
		dispatch(actionGetPayments());
	}, [dispatch]);

	useEffect(() => {
		if (statusGetPayment === "loading") setLoading(true);
		else if (statusGetPayment === "success") {
			const spendAmount = paymentTableData?.reduce((pre, current) => pre + +current.amount, 0);
			(spendAmount || spendAmount === 0) && setSpenValue(spendAmount);
			setRawTableData(paymentTableData);
			dispatch(resetGetPaymentStatus());
			setLoading(false);
		} else if (statusGetPayment === "error") {
			setLoading(false);
		}
	}, [dispatch, paymentTableData, statusGetPayment]);

	useEffect(() => {
		const spendAmount = paymentTableData?.reduce((pre, current) => pre + +current.amount, 0);
		if (spendAmount) setSpenValue(spendAmount);
	}, [paymentTableData]);

	const refreshTable = useCallback(() => {
		dispatch(actionGetPayments());
	}, [dispatch]);

	function handleTableFilter() {
		dispatch(actionGetPayments({ search: searchText }));
	}

	function searchRangeChange(_: any, dateString: string[]) {
		setSearchRange([dateString[0], dateString[1]]);
		console.log(dateString[0], dateString[1]);
	}

	function handleSearchRange() {
		const searchObj: PaymentSearchParam = {};
		const fromDate = searchRange[0];
		const toDate = searchRange[1];
		if (fromDate) searchObj.fromDate = fromDate;
		if (toDate) searchObj.toDate = toDate;
		dispatch(actionGetPayments({ ...searchObj }));
	}

	function handleShowDrawer(state: boolean) {
		setShowDrawer(state);
	}

	const tableColumn = [
		{
			width: "10%",
			title: "Người lập",
			dataIndex: "__",
			key: "creator",
			render: function NameCol(_: string, row: any): JSX.Element {
				return (
					<div>
						<Space>
							<UserOutlined />
							{row.creator.name}
						</Space>
					</div>
				);
			},
		},
		{
			width: "10%",
			title: "Người chi",
			dataIndex: "_",
			key: "payer",
			render: function NameCol(_: string, row: any): JSX.Element {
				return (
					<div>
						<Space>
							<UserOutlined />
							{row.payer.name}
						</Space>
					</div>
				);
			},
		},
		{
			width: "8%",
			title: "Loại chi",
			dataIndex: "type",
			key: "type",
			align: "center" as "center",
			render: function TypeCol(type: number): JSX.Element {
				return <span style={{ color: type === 0 ? "#cf1322" : "#3f8600" }}>{PaymentTypeEnum[type]}</span>;
			},
		},
		{
			width: "10%",
			title: "Số tiền",
			dataIndex: "amount",
			key: "amount",
			render: function amountCol(amount: number, row: any): JSX.Element {
				return <span style={{ color: "#cf1322" }}>{formatCurrency(amount)}</span>;
			},
		},
		{
			width: "25%",
			title: "Lý do",
			dataIndex: "reason",
			key: "reason",
		},
		{
			width: "12%",
			title: "Ghi chú",
			dataIndex: "note",
			key: "note",
		},
		{
			width: "8%",
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
		},
		{
			width: "10%",
			title: "Ngày tạo",
			dataIndex: "date",
			key: "date",
			render: function dateCol(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
		},
		{
			width: "5%",
			title: "Action",
			key: "action",
			render: function actionCol(value: string, row: any): JSX.Element {
				return (
					<Tooltip placement="top" title="Sửa thông tin">
						<Button onClick={(e)=> {
							console.log("click button")
							e.stopPropagation()
						}} type="link" icon={<EditOutlined />}>
						</Button>
					</Tooltip>
				);
			},
		},
	];

	return (
		<Layout.Content style={{ height: 1000 }}>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search onSearch={handleTableFilter} onChange={({ target: input }) => setSearchText(input.value)} />
				</Col>
				<Col style={{ marginLeft: 20 }}>
					<AddNewPayment refreshTable={refreshTable} />
				</Col>
				<Col style={{ marginLeft: 20 }}>
					<Row justify="start">
						<RangePicker
							allowEmpty={[true, true]}
							onChange={searchRangeChange}
							defaultValue={[moment().startOf("month"), moment().endOf("month")]}
						/>
						<Button type="primary" onClick={handleSearchRange}>
							Tìm kiếm
						</Button>
					</Row>
				</Col>
			</Row>
			<Row style={{ justifyContent: "space-between" }}>
				<Button type="primary"> Đặt ngưỡng chi tiêu </Button>
				<Statistic title="Tổng chi" value={spenValue} suffix="VND" valueStyle={{ color: "#cf1322" }} />
			</Row>
			<Spin spinning={loading}>
				<Table
					size="small"
					pagination={{ pageSize: 20 }}
					dataSource={rawTableData}
					columns={tableColumn}
					bordered
					onRow={(record) => {
						return {
							onClick: (e) => {
								handleShowDrawer(true);
								setCurrentDrawerData(record);
							},
						};
					}}
				/>
				<PaymentDetails handleShowDetail={handleShowDrawer} show={showDrawer} data={currentDrawerData}></PaymentDetails>
			</Spin>
		</Layout.Content>
	);
}

export default Payment;
