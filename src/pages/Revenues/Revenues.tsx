import {
	CheckCircleOutlined,
	CloseOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	UserOutlined
} from "@ant-design/icons/lib/icons";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import {
	Button,
	Col,
	DatePicker,
	Input,
	Layout,
	Popconfirm,
	Row,
	Select,
	Space,
	Spin,
	Statistic,
	Table,
	Tooltip
} from "antd";
import { debounce, get, pick } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	actionGetRevenues,
	actionUpdateRevenues,
	resetAddRevenuesStatus,
	resetGetRevenuesStatus,
	resetUpdateRevenuesStatus,
	RevenuesRequestUpdateType,
	RevenuesStatusList,
	RevenuesTypeList,
	RevenueType
} from "store/revenues/slice";
import { RootState } from "store/store";
import styled from "styled-components";
import { DatePattern, formatDate } from "utils/dateUltils";
import { formatCurrency } from "utils/ultil";
import AddNewRevenues from "./AddNewRevenues";
import RevenueDetails from "./RevenueDetails";
const { RangePicker } = DatePicker;

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
	const [editingKey, setEditingKey] = useState(-1);
	const [rowValueChange, setRowValueChange] = useState<RevenueType | null>(null);
	const [currentDrawerData, setCurrentDrawerData] = useState<RevenueType | null>(null);
	const [showDrawer, setShowDrawer] = useState(false);
	const [searchObj, setSearchObj] = useState(() => {
		console.log("init");
		const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
		const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
		return { search: "", searchRange: [startOfMonth, endOfMonth] };
	});

	const [rawTableData, setRawTableData] = useState<RevenueType[]>([]);

	const statusGetRevenues = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
	const statusAddRevenues = useSelector((state: RootState) => state.revenuesReducer.addRevenuesStatus);
	const statusUpdateRevenues = useSelector((state: RootState) => state.revenuesReducer.updateRevenuesStatus);
	const revenuesData = useSelector((state: RootState) => state.revenuesReducer.revenues);

	const debounceSearch = useRef(
		debounce((nextValue, fromDate, toDate) => setSearchObj({ searchRange: [fromDate, toDate], search: nextValue }), 500)
	).current;

	console.log("revenues re-render");

	useEffect(() => {
		const [fromDate, toDate] = searchObj.searchRange;
		const search = searchObj.search;
		dispatch(actionGetRevenues({ fromDate, toDate, search }));
	}, [dispatch, searchObj]);

	useEffect(() => {
		const tableData = get(revenuesData, "data", []) as RevenueType[];
		const receivedAmount = tableData.reduce((pre, current) => pre + +current.amount, 0);
		setReceivedValue(receivedAmount);
		setRawTableData(tableData);
	}, [revenuesData]);

	useEffect(() => {
		if (statusGetRevenues === "success" || statusGetRevenues === "error") {
			dispatch(resetGetRevenuesStatus());
		} else if (statusAddRevenues === "success" || statusAddRevenues === "error") {
			if (statusAddRevenues === "success") {
				dispatch(actionGetRevenues());
			}
			dispatch(resetAddRevenuesStatus());
		} else if (statusUpdateRevenues === "success" || statusUpdateRevenues === "error") {
			if (statusUpdateRevenues === "success") {
				dispatch(actionGetRevenues());
			}
			dispatch(resetUpdateRevenuesStatus());
		}
	}, [dispatch, statusAddRevenues, statusGetRevenues, statusUpdateRevenues]);

	const isEditting = (record: any) => record.id === editingKey;

	function onTableFiler(value: string) {
		const [fromDate, toDate] = searchObj.searchRange;
		debounceSearch(value, fromDate, toDate);
	}

	function searchRangeChange(_: any, dateString: string[]) {
		const [fromDate, toDate] = dateString;
		setSearchObj({ ...searchObj, searchRange: [fromDate, toDate] });
	}

	function handleUpdateRowData() {
		console.log(rowValueChange)
		dispatch(
			actionUpdateRevenues(
				pick(rowValueChange, [
					"id",
					"creator_id",
					"type",
					"amount",
					"note",
					"reason",
					"date",
					"status",
				]) as RevenuesRequestUpdateType
			)
		);
	}

	function handleCancelUpdateRowData() {
		setRowValueChange(null);
		setEditingKey(-1);
	}

	function handleShowDrawer(state: boolean) {
		setShowDrawer(state);
	}

	const tableColumn = [
		{
			width: "10%",
			title: "Người lập",
			dataIndex: "__",
			key: "payemnt_creator",
			render: function NameCol(_: string, row: RevenueType): JSX.Element {
				return (
					<div>
						<Space>
							<UserOutlined />
							{get(row, "creator.profile.name", "")}
						</Space>
					</div>
				);
			},
		},
		{
			width: "10%",
			title: "Người thu",
			dataIndex: "_",
			key: "payemnt_payer",
			render: function NameCol(_: string, row: RevenueType): JSX.Element {
				return (
					<div>
						<Space>
							<UserOutlined />
							{get(row, "saler.profile.name", "")}
						</Space>
					</div>
				);
			},
		},
		{
			width: "8%",
			title: "Loại thu",
			dataIndex: "type",
			key: "payemnt_type",
			// eslint-disable-next-line @typescript-eslint/prefer-as-const
			align: "center" as "center",
			render: function TypeCol(type: number): JSX.Element {
				return <span style={{ color: type === 1 ? "#cf1322" : "#3f8600" }}>{RevenuesTypeList[type]}</span>;
			},
		},
		{
			width: "10%",
			title: "Số tiền",
			dataIndex: "amount",
			key: "payemnt_amount",
			render: function amountCol(amount: number): JSX.Element {
				return <span style={{ color: "#3f8600" }}>{formatCurrency(amount)}</span>;
			},
		},
		{
			width: "25%",
			title: "Lý do",
			dataIndex: "reason",
			key: "payemnt_reason",
			render: function reasonCol(reason: string, row: RevenueType): JSX.Element {
				const editable = isEditting(row);
				return editable ? (
					<Input
						placeholder={reason}
						onClick={(e) => {
							e.stopPropagation();
						}}
						onChange={({ target }) => setRowValueChange({ ...row, reason: target.value })}
					/>
				) : (
					<>{reason}</>
				);
			},
		},
		{
			width: "12%",
			title: "Ghi chú",
			dataIndex: "note",
			key: "payemnt_note",
			render: function noteCol(note: string, row: RevenueType): JSX.Element {
				const editable = isEditting(row);
				return editable ? (
					<Input
						placeholder={note}
						onClick={(e) => {
							e.stopPropagation();
						}}
						onChange={({ target }) => setRowValueChange({ ...row, note: target.value })}
					/>
				) : (
					<>{note}</>
				);
			},
		},
		{
			width: "8%",
			title: "Trạng thái",
			dataIndex: "status",
			key: "payemnt_status",
			editable: true,
			render: function statusCol(status: number, row: RevenueType): JSX.Element {
				const editable = isEditting(row);
				return editable ? (
					<>
						<Select
							defaultValue={row.status}
							onChange={(value) => {
								setRowValueChange({ ...row, status: value });
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							{RevenuesStatusList.map((v, i) => (
								<Select.Option value={i} key={i}>
									{v}
								</Select.Option>
							))}
						</Select>
					</>
				) : (
					<>{RevenuesStatusList[status]}</>
				);
			},
		},
		{
			width: "10%",
			title: "Ngày tạo",
			dataIndex: "date",
			key: "payemnt_date",
			render: function dateCol(date: string): JSX.Element {
				return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
			},
		},
		{
			width: "5%",
			title: "Action",
			key: "payemnt_action",
			render: function actionCol(value: string, row: RevenueType): JSX.Element {
				const editable = isEditting(row);

				return editable ? (
					<>
						<Popconfirm
							title="Xác nhận sửa thông tin?"
							icon={<QuestionCircleOutlined />}
							onConfirm={(e) => {
								e?.stopPropagation();
								handleUpdateRowData();
								handleCancelUpdateRowData();
							}}
							onCancel={(e) => e?.stopPropagation()}
						>
							<Button
								onClick={(e) => {
									e.stopPropagation();
								}}
								type="link"
								icon={<CheckCircleOutlined />}
							></Button>
						</Popconfirm>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								handleCancelUpdateRowData();
							}}
							type="link"
							icon={<CloseOutlined />}
						></Button>
					</>
				) : (
					<Tooltip placement="top" title="Sửa thông tin">
						<Button
							onClick={(e) => {
								console.log("click edit");
								setEditingKey(row.id);
								e.stopPropagation();
							}}
							type="link"
							icon={<EditOutlined />}
						></Button>
					</Tooltip>
				);
			},
		},
	];
	return (
		<Wrapper>
			<Layout.Content style={{ height: 1000 }}>
				<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
					<Col span={10}>
						<Input prefix={<SearchOutlined />} onChange={({ target: input }) => onTableFiler(input.value)} />
					</Col>

					<Col style={{ marginLeft: 20 }}>
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
					<Table
						rowClassName={(record) => (record.id === editingKey ? "editing-row" : "")}
						rowKey="id"
						size="small"
						pagination={{
							pageSize: 20,
							total: get(revenuesData, "total", 0),
							// onChange: (page) => {
							// 	setPage(page);
							// },
						}}
						dataSource={rawTableData}
						columns={tableColumn}
						bordered
						onRow={(record) => {
							return {
								onClick: () => {
									handleShowDrawer(true);
									setCurrentDrawerData(record);
								},
							};
						}}
					/>
					<RevenueDetails handleShowDetail={handleShowDrawer} show={showDrawer} data={currentDrawerData} />
				</Spin>
			</Layout.Content>
		</Wrapper>
	);
}

export default Revenues;
