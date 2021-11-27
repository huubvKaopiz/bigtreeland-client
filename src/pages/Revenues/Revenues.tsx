import {
	CheckCircleOutlined,
	CloseOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	UserOutlined,
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
	Tooltip,
} from "antd";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { RevenuesStatusList, RevenuesTypeList, RevenueType } from "store/revenues/slice";
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

const mockData = {
	current_page: 1,
	data: [
		{
			id: 1,
			creator_employee_id: 1,
			pay_employee_id: 11,
			type: 1,
			amount: "1000000",
			reason: "Thu phụ phí",
			date: "2021-11-25",
			note: null,
			status: 0,
			created_at: "2021-11-25 01:20:04",
			updated_at: "2021-11-27 01:16:02",
			creator: {
				id: 1,
				user_id: 1,
				name: "Bùi Văn Hữu",
				email: "buivanhuu2017@gmail.com",
				address: null,
				birthday: null,
				gender: 1,
				interests: null,
				dislikes: null,
				created_at: "2021-11-24 17:41:42",
				updated_at: "2021-11-24 17:41:42",
			},
			payer: {
				id: 11,
				user_id: 11,
				name: "Kali Haag",
				email: "qkilback@example.net",
				address: "2193 Emery Valley Suite 734\nWest Celestinechester, CO 20459",
				birthday: "1989-06-01",
				gender: 1,
				interests: null,
				dislikes: null,
				created_at: "2021-11-24 17:41:42",
				updated_at: "2021-11-24 17:41:42",
			},
		},
	],
	first_page_url: "http://45.32.101.219:8000/api/payment-slips?page=1",
	from: 1,
	last_page: 1,
	last_page_url: "http://45.32.101.219:8000/api/payment-slips?page=1",
	links: [
		{
			url: null,
			label: "&laquo; Previous",
			active: false,
		},
		{
			url: "http://45.32.101.219:8000/api/payment-slips?page=1",
			label: "1",
			active: true,
		},
		{
			url: null,
			label: "Next &raquo;",
			active: false,
		},
	],
	next_page_url: null,
	path: "http://45.32.101.219:8000/api/payment-slips",
	per_page: 20,
	prev_page_url: null,
	to: 1,
	total: 1,
};

function Revenues(): JSX.Element {
	const [loading, setLoading] = useState(false);
	const [receivedValue, setReceivedValue] = useState(123);
	const [editingKey, setEditingKey] = useState(-1);
	const [statusValueChange, setStatusValueChange] = useState("");
	const [currentDrawerData, setCurrentDrawerData] = useState<RevenueType | null>(null);
	const [showDrawer, setShowDrawer] = useState(false);

	const [rawTableData, setRawTableData] = useState<RevenueType[]>([]);

	const revenuesData = mockData;

	console.log("revenues re-render");

	useEffect(() => {
		const tableData = get(revenuesData, "data", []) as RevenueType[];
		const receivedAmount = tableData.reduce((pre, current) => pre + +current.amount, 0);
		setReceivedValue(receivedAmount);
		setRawTableData(tableData);
	}, [revenuesData]);

	const isEditting = (record: any) => record.id === editingKey;

	function handleCancelUpdateRowData() {
		setStatusValueChange("");
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
							{row.creator.name}
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
							{row.creator.name}
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
		},
		{
			width: "12%",
			title: "Ghi chú",
			dataIndex: "note",
			key: "payemnt_note",
		},
		{
			width: "8%",
			title: "Trạng thái",
			dataIndex: "status",
			key: "payemnt_status",
			editable: true,
			render: function statusCold(status: number, row: RevenueType): JSX.Element {
				const editable = isEditting(row);
				return editable ? (
					<>
						<Select
							defaultValue={row.status}
							onChange={(value) => {
								// setStatusValueChange(value);
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
								// handleUpdateRowData();
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
						<Input
							prefix={<SearchOutlined />}
							// onChange={({ target: input }) => onTableFiler(input.value)}
						/>
					</Col>
					
					<Col style={{ marginLeft: 20 }}>
						<Row justify="start">
							<RangePicker
								allowEmpty={[true, true]}
								// onChange={searchRangeChange}
								// defaultValue={[moment().startOf("month"), moment().endOf("month")]}
							/>
						</Row>
					</Col>

					<Col style={{ marginLeft: 20 }}><AddNewRevenues /></Col>
				</Row>
				<Row style={{ justifyContent: "flex-end" }}>
					<Statistic title="Tổng thu" value={receivedValue} suffix="VND" valueStyle={{ color: "#3f8600" }} />
				</Row>
				<Spin spinning={loading}>
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
								onClick: (e) => {
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
