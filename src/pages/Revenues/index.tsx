import {
	CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined,
	FileTextOutlined
} from "@ant-design/icons/lib/icons";
import {
	Button,
	Col,
	DatePicker, Layout, Modal, Row, Space,
	Spin,
	Statistic,
	Table,
	Tag,
	Tooltip
} from "antd";
import { debounce, get } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	actionDeleteRevenue,
	actionGetRevenues, actionUpdateRevenueStatus,
	resetAddRevenuesStatus,
	resetGetRevenuesStatus,
	resetUpdateRevenuesStatus, RevenuesStatusList,
	RevenuesTypeList,
	RevenueType
} from "store/revenues/slice";
import { RootState } from "store/store";
import styled from "styled-components";
import { formatCurrency } from "utils/ultil";
import AddNewRevenues from "./AddNewRevenues";
import RevenueDetails from "./RevenueDetails";
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const Wrapper = styled.div`
	.ant-table-tbody > tr.ant-table-row:hover > td {
		background: #61dafb38;
	}
	.ant-table-tbody > tr.ant-table-row.editing-row > td {
		background: #61dafb38;
	}
`;

function Revenues(): JSX.Element {
	const dispatch = useDispatch();
	const [receivedValue, setReceivedValue] = useState(123);
	const [rowValueChange, setRowValueChange] = useState<RevenueType | null>(null);
	const [selectedRows, setSelectedRows] = useState<RevenueType[]>([]);
	const [selectedRowKeys, setsSlectedRowKeys] = useState< React.Key[]>([])
	const [currentDrawerData, setCurrentDrawerData] = useState<RevenueType | null>(null);
	const [showDrawer, setShowDrawer] = useState(false);
	const [searchObj, setSearchObj] = useState(() => {
		const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
		const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
		return { search: "", searchRange: [startOfMonth, endOfMonth] };
	});

	const [rawTableData, setRawTableData] = useState<RevenueType[]>([]);
	//application state
	const statusGetRevenues = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
	const statusAddRevenues = useSelector((state: RootState) => state.revenuesReducer.addRevenuesStatus);
	const statusUpdateRevenues = useSelector((state: RootState) => state.revenuesReducer.updateRevenuesStatus);
	const revenuesData = useSelector((state: RootState) => state.revenuesReducer.revenues);

	const debounceSearch = useRef(
		debounce((nextValue, fromDate, toDate) => setSearchObj({ searchRange: [fromDate, toDate], search: nextValue }), 500)
	).current;

	useEffect(() => {
		const [from_date, to_date] = searchObj.searchRange;
		const search = searchObj.search;
		dispatch(actionGetRevenues({ from_date, to_date, search }));
	}, [dispatch, searchObj]);

	useEffect(() => {
		const tableData = get(revenuesData, "data", []) as RevenueType[];
		const receivedAmount = tableData.reduce((pre, current) => pre + +current.amount, 0);
		setReceivedValue(receivedAmount);
		setRawTableData(tableData);
	}, [revenuesData]);

	// refresh data when the updating is complete
	useEffect(() => {
		if (statusGetRevenues === "success" || statusGetRevenues === "error") {
			dispatch(resetGetRevenuesStatus());
			setSelectedRows([]);
			setsSlectedRowKeys([]);
		} else if (statusAddRevenues === "success" || statusAddRevenues === "error") {
			if (statusAddRevenues === "success") {
				dispatch(actionGetRevenues({}));
			}
			dispatch(resetAddRevenuesStatus());
		} else if (statusUpdateRevenues === "success" || statusUpdateRevenues === "error") {
			if (statusUpdateRevenues === "success") {
				dispatch(actionGetRevenues({}));
			}
			dispatch(resetUpdateRevenuesStatus());
		}
	}, [dispatch, statusAddRevenues, statusGetRevenues, statusUpdateRevenues]);

	// actions handler
	function searchRangeChange(_: any, dateString: string[]) {
		const [fromDate, toDate] = dateString;
		setSearchObj({ ...searchObj, searchRange: [fromDate, toDate] });
	}

	function handleMultipleConfirmed() {
		const receipt_ids: number[] = [];
		selectedRows.forEach((r) => receipt_ids.push(r.id));
		const status = 1;
		dispatch(actionUpdateRevenueStatus({ receipt_ids, status }));
	}

	function handleShowDrawer(state: boolean) {
		setShowDrawer(state);
	}

	function handleDelete(id: number) {
		confirm({
			title: "Bạn muốn xoá phiếu thu này!",
			icon: <ExclamationCircleOutlined />,
			onOk() {
				dispatch(actionDeleteRevenue(id));
			}
		})
	}
	////

	// table cols rendering
	const tableColumn = [
		{
			title: "Ngày tạo",
			dataIndex: "created_at",
			key: "payemnt_date",
			render: function dateCol(date: string): JSX.Element {
				return <>{moment(date).format("DD-MM-YYYY HH:mm")}</>;
			},
		},
		{
			title: "Người lập",
			dataIndex: "__",
			key: "payemnt_creator",
			render: function NameCol(_: string, row: RevenueType): JSX.Element {
				return (
					<a>
						{get(row, "creator.profile.name", "")}
					</a>
				);
			},
		},
		{
			title: "Loại thu",
			dataIndex: "type",
			key: "payemnt_type",
			align: "center" as "center",
			render: function TypeCol(type: number): JSX.Element {
				return <Tag color={type === 1 ? "#3498db" : "#d35400"}>{RevenuesTypeList[type]}</Tag>;
			},
		},
		{
			title: "Số tiền",
			dataIndex: "amount",
			key: "payemnt_amount",
			render: function amountCol(amount: number): JSX.Element {
				return <strong style={{ color: "#3f8600" }}>{formatCurrency(amount)}</strong>;
			},
		},
		Table.SELECTION_COLUMN,
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "payemnt_status",
			editable: true,
			render: function statusCol(status: number): JSX.Element {
				return (<Tag color={status === 1 ? "green" : "red"}>{RevenuesStatusList[status]}</Tag>)
			},
		},

		{
			title: "Action",
			key: "payemnt_action",
			render: function actionCol(_: string, row: RevenueType): JSX.Element {

				return (
					<Space>
						<Tooltip title="Chi tiết">
							<Button type="link" icon={<FileTextOutlined />} onClick={() => {
								handleShowDrawer(true);
								setCurrentDrawerData(row);
							}} />
						</Tooltip>
						<Tooltip title="Xoá">
							<Button type="link" danger icon={<DeleteOutlined />} disabled={row.status === 1} onClick={() => handleDelete(row.id)} />
						</Tooltip>
					</Space>
				);
			},
		},
	];
	return (
		<Wrapper>
			<Layout.Content style={{ height: 1000 }}>
				<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
					<Col>
						<Row justify="start">
							<RangePicker
								allowEmpty={[true, true]}
								onChange={searchRangeChange}
								defaultValue={[moment().startOf("month"), moment().endOf("month")]}
							/>
						</Row>
					</Col>

					<Col style={{ marginLeft: 20 }}>
						<AddNewRevenues />
					</Col>
				</Row>
				<Row style={{ justifyContent: "flex-end" }}>
					<Statistic title="Tổng thu" value={receivedValue} suffix="VND" valueStyle={{ color: "#3f8600" }} />
				</Row>
				<Spin spinning={statusGetRevenues === "loading" || statusUpdateRevenues === "loading"}>
					{selectedRows.length > 0 &&
						<Space style={{ marginBottom: 20 }}>
							<Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleMultipleConfirmed()} loading={false}>
								Xác nhận
							</Button>
							<span style={{ marginLeft: 8 }}>
								{selectedRows.length > 0 ? `${selectedRows.length} phiếu thu` : ''}
							</span>
						</Space>
					}
					<Table
						rowKey="id"
						dataSource={rawTableData}
						columns={tableColumn}
						rowSelection={{
							selectedRowKeys,
							onChange: (selectedRowKeys: React.Key[], selectedRows: RevenueType[]) => {
								console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
								setSelectedRows(selectedRows);
								setsSlectedRowKeys(selectedRowKeys);
							},
							getCheckboxProps: (record: RevenueType) => ({
								disabled: record.status === 1, // Column configuration not to be checked
							}),
						}}
						pagination={{
							pageSize: 20,
							total: get(revenuesData, "total", 0),
						}}
					/>
					<RevenueDetails handleShowDetail={handleShowDrawer} show={showDrawer} data={currentDrawerData} />
				</Spin>
			</Layout.Content>
		</Wrapper>
	);
}

export default Revenues;
