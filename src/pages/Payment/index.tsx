import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	DeleteOutlined,
	CheckCircleOutlined,
	CloseOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	FileTextOutlined,
	ExclamationCircleOutlined
} from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Modal,
	Layout,
	Popconfirm,
	Row,
	Select,
	Space,
	Spin,
	Statistic,
	Table,
	Tag,
	Tooltip,
} from "antd";
import { debounce, get } from "lodash";
import moment from "moment";
import { useSelector } from "react-redux";
import {
	actionDeletePayment,
	actionGetPayments,
	actionUpdatePaymentStatus,
	PaymentSearchParam,
	PaymentStatusList,
	PaymentType,
	PaymentTypeEnum,
	resetAddPaymentStatus,
	resetGetPaymentStatus,
	resetUpdatePaymentStatus,
} from "store/payments/slice";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";
import { DatePattern, formatDate } from "utils/dateUltils";
import { formatCurrency } from "utils/ultil";
import AddNewPayment from "./AddNewPayment";
import PaymentDetails from "./PaymentDetails";
const { RangePicker } = DatePicker;

const Wrapper = styled.div`
	.ant-table-tbody > tr.ant-table-row:hover > td {
		background: #61dafb38;
	}
	.ant-table-tbody > tr.ant-table-row.editing-row > td {
		background: #61dafb38;
	}
`;

const { confirm } = Modal;

function Payment(): JSX.Element {
	const dispatch = useAppDispatch();
	const [searchRange, setSearchRange] = useState<string[]>(["", ""]);
	const [loading, setLoading] = useState(false);
	const [rawTableData, setRawTableData] = useState<PaymentType[]>([]);
	const [spenValue, setSpenValue] = useState(0);
	const [showDetail, setShowDetail] = useState(false);
	const [currentDrawerData, setCurrentDrawerData] = useState<PaymentType | null>(null);
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [selectedPaymentRows, setSelectedPaymentRows] = useState<PaymentType[]>([]);
	const [selectedRowKeys, setsSlectedRowKeys] = useState< React.Key[]>([])

	// application state
	const paymentTableData = useSelector(
		(state: RootState) => state.paymentReducer.payments
	);
	const statusGetPayment = useSelector(
		(state: RootState) => state.paymentReducer.getPaymentStatus
	);
	const statusUpdatePayment = useSelector(
		(state: RootState) => state.paymentReducer.updatePaymentStatus
	);
	const statusAddNewPayment = useSelector(
		(state: RootState) => state.paymentReducer.addPaymentStatus
	);

	const statusDeletePayment = useSelector(
		(state: RootState) => state.paymentReducer.deletePaymentStatus
	);

	const debounceSearch = useRef(
		debounce(
			(nextValue) => dispatch(actionGetPayments({ search: nextValue })),
			500
		)
	).current;

	useEffect(() => {
		const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
		const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
		// setSearchRange([startOfMonth, endOfMonth]);
		dispatch(actionGetPayments({fromDate:startOfMonth, toDate:endOfMonth}));
	}, [dispatch]);

	useEffect(() => {
		const tableData = get(paymentTableData, "data", []) as PaymentType[];
		const spendAmount = tableData.reduce(
			(pre, current) => pre + +current.amount,
			0
		);
		if (spendAmount) setSpenValue(spendAmount);
	}, [paymentTableData]);

	const handleSearchRange = useCallback(
		(page?: number) => {
			const searchObj: PaymentSearchParam = {};
			const fromDate = searchRange[0];
			const toDate = searchRange[1];
			if (fromDate) searchObj.fromDate = fromDate;
			if (toDate) searchObj.toDate = toDate;
			if (searchInput) searchObj.search = searchInput;
			dispatch(actionGetPayments({ ...searchObj, page }));
		},
		[dispatch, searchRange, searchInput]
	);

	useEffect(() => {
		handleSearchRange(page);
	}, [dispatch, handleSearchRange, page]);

	// refresh data when the updating is complete
	useEffect(() => {
		if (statusGetPayment === "loading" || statusUpdatePayment === "loading" || statusDeletePayment === 'loading')
			setLoading(true);
		else if (statusGetPayment === "success") {
			const tableData = get(paymentTableData, "data", []) as PaymentType[];
			const spendAmount = tableData.reduce(
				(pre, current) => pre + +current.amount,
				0
			);
			(spendAmount || spendAmount === 0) && setSpenValue(spendAmount);
			setRawTableData(tableData);
			dispatch(resetGetPaymentStatus());
			setLoading(false);
			setsSlectedRowKeys([]);
			setSelectedPaymentRows([]);
		} else if (statusUpdatePayment === "success") {
			dispatch(resetUpdatePaymentStatus());
			dispatch(actionGetPayments({}));
		} else if (statusAddNewPayment === "success") {
			dispatch(resetAddPaymentStatus());
			dispatch(actionGetPayments({}));
		} else if (statusDeletePayment === 'success') {
			dispatch(actionGetPayments({}));
		}
		else if (
			statusGetPayment === "error" ||
			statusUpdatePayment === "error" ||
			statusDeletePayment === 'error'
		) {
			setLoading(false);
		}
	}, [
		dispatch,
		paymentTableData,
		statusAddNewPayment,
		statusGetPayment,
		statusUpdatePayment,
		statusDeletePayment
	]);

	
	// function onTableFiler(value: string) {
	// 	setSearchInput(value);
	// 	debounceSearch(value);
	// }

	function searchRangeChange(_: any, dateString: string[]) {
		setSearchRange([dateString[0], dateString[1]]);
		console.log(dateString[0], dateString[1]);
	}

	function handleMultipleConfirmed(){
		const payment_slip_ids: number[] = [];
		selectedPaymentRows.forEach((r) => payment_slip_ids.push(r.id));
		const status = 1;
		dispatch(actionUpdatePaymentStatus({ payment_slip_ids, status }));
		
	}

	function handleDelete(payment: PaymentType) {
		confirm({
			title: "Bạn muốn xoá phiếu chi này!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				dispatch(actionDeletePayment(payment.id));
			}
		})
	}

	console.log(selectedPaymentRows)

	const tableColumn = [
		{
			width: 200,
			title: "Ngày tạo",
			dataIndex: "date",
			key: "payemnt_date",
			render: function dateCol(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
		},
		{
			width: 200,
			title: "Người chi",
			dataIndex: "_",
			key: "payemnt_payer",
			render: function NameCol(_: string, row: any): JSX.Element {
				return (
					<a>
						{get(row, "payer.profile.name", "")}
					</a>
				);
			},
		},
		{
			width: 100,
			title: "Loại chi",
			dataIndex: "type",
			key: "payemnt_type",
			align: "center" as "center",
			render: function TypeCol(type: number): JSX.Element {
				return (
					<Tag color={type === 0 ? "#e67e22" : "#e74c3c"}>
						{PaymentTypeEnum[type]}
					</Tag>
				);
			},
		},
		{
			width: 200,
			title: "Số tiền",
			dataIndex: "amount",
			key: "payemnt_amount",
			render: function amountCol(amount: number): JSX.Element {
				return (
					<strong style={{ color: "#cf1322" }}>{formatCurrency(amount)}</strong>
				);
			},
		},
		// {
		// 	width: "25%",
		// 	title: "Lý do",
		// 	dataIndex: "reason",
		// 	key: "payemnt_reason",
		// },
		Table.SELECTION_COLUMN,
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "payemnt_status",
			editable: true,
			render: function statusCold(status: number): JSX.Element {
				return (<Tag color={status === 1 ? 'green' : 'red'}>{PaymentStatusList[status]}</Tag>)
			},
		},

		{
			width: "10%",
			title: "Action",
			key: "payemnt_action",
			render: function actionCol(_: string, row: PaymentType): JSX.Element {
				return (
					<Space>
						<Tooltip placement="top" title="Chi tiết">
							<Button
								onClick={(e) => {
									setShowDetail(true);
									setCurrentDrawerData(row)
								}}
								type="link"
								icon={<FileTextOutlined />}
							></Button>
						</Tooltip>

						<Tooltip placement="top" title="Xoá phiếu chi">
							<Button
								onClick={(e) => {
									handleDelete(row)
								}}
								type="link"
								danger
								disabled={row.status === 1}
								icon={<DeleteOutlined />}
							></Button>
						</Tooltip>
					</Space>
				)
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				{/* <Col span={10}>
						<Input
							prefix={<SearchOutlined />}
							onChange={({ target: input }) => onTableFiler(input.value)}
						/>
					</Col> */}

				<Col>
					<Row justify="start">
						<RangePicker
							allowEmpty={[true, true]}
							onChange={searchRangeChange}
							defaultValue={[
								moment().startOf("month"),
								moment().endOf("month"),
							]}
						/>
					</Row>
				</Col>

				<Col style={{ marginLeft: 20 }}>
					<AddNewPayment />
				</Col>
			</Row>
			<Row style={{ justifyContent: "flex-end" }}>
				{/* Todo */}
				{/* <Button type="primary"> Đặt ngưỡng chi tiêu </Button> */}
				<Statistic
					title="Tổng chi"
					value={spenValue}
					suffix="VND"
					valueStyle={{ color: "#cf1322" }}
				/>
			</Row>
			<Spin spinning={loading}>
				{selectedPaymentRows.length > 0 &&
					<Space style={{ marginBottom: 20 }}>
						<Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleMultipleConfirmed()} loading={false}>
							Xác nhận
						</Button>
						<span style={{ marginLeft: 8 }}>
							{selectedPaymentRows.length > 0 ? `${selectedPaymentRows.length} phiếu chi` : ''}
						</span>
					</Space>
				}
				<Table
					rowKey="id"
					size="small"
					dataSource={rawTableData}
					columns={tableColumn}
					rowSelection={{
						selectedRowKeys,
						onChange: (selectedRowKeys: React.Key[], selectedRows: PaymentType[]) => {
							// console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
							setSelectedPaymentRows(selectedRows);
							setsSlectedRowKeys(selectedRowKeys);
						},
						getCheckboxProps: (record: PaymentType) => ({
							disabled: record.status === 1, // Column configuration not to be checked
						}),
					
					}}
					pagination={{
						pageSize: 20,
						total: get(paymentTableData, "total", 0),
						onChange: (page) => {
							setPage(page);
						},
					}}
				/>
				<PaymentDetails
					handleShowDetail={setShowDetail}
					show={showDetail}
					data={currentDrawerData}
				/>
			</Spin>
		</Layout.Content>
	);
}

export default Payment;
