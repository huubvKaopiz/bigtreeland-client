import { EditOutlined, PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, DatePicker, Layout, Select, Space, Table, Tooltip } from "antd";
import { ClassType, TuitionFeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClasses } from "store/classes/slice";
import { RootState } from "store/store";
import { actionGetPeriodTuions, GetPeriodTuionsPrams } from "store/tuition/periodslice";
import { dateFormat } from "utils/const";
import { formatCurrency } from "utils/ultil";

const { Option } = Select;
const { Column, ColumnGroup } = Table;
type TableDataType = {
	key: string | number;
	class_name: string;
	fromDate: string;
	toDate: string;
	estact_session_num: string | number;
	amout: number;
	status: string;
};

export default function Tuition(): JSX.Element {
	const dispatch = useDispatch();
	const history = useHistory();
	const periodTuitionList = useSelector((state: RootState) => state.periodTuitionReducer.periodTuitions);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const [periodTableData, setPeriodTableData] = useState<TableDataType[]>([]);
	const [classInfoList, setClassInfoList] = useState<ClassType[]>([]);
	const [searchParam, setSearchParam] = useState<GetPeriodTuionsPrams>({});

	useEffect(() => {
		dispatch(actionGetPeriodTuions());
		dispatch(actionGetClasses({}));
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetPeriodTuions(searchParam));
	}, [dispatch, searchParam]);

	useEffect(() => {
		const classData = get(classesList, "data", []);
		const periodList = get(periodTuitionList, "data", []).map((period) => {
			const classOfPeriod = classData.find((cl) => cl.id === period.class_id);
			return {
				key: period.id,
				class_name: classOfPeriod?.name ?? "",
				fromDate: period.from_date,
				toDate: period.to_date,
				estact_session_num: `${classOfPeriod?.act_session_num}/${period.est_session_num}`,
				amout: (get(period, "tuition_fees", []) as TuitionFeeType[]).reduce((amount, student) => {
					const est_fee = period.est_session_num * get(classOfPeriod, "fee_per_session", 0);
					const deduce_amount =
						+get(student, "residual", 0) +
						+get(student, "fixed_deduction", 0) +
						+get(student, "flexible_deduction", 0) -
						+get(student, "debt", 0);
					const cal_fee = est_fee - deduce_amount;
					return cal_fee > 0 ? amount + cal_fee : amount;
				}, 0),
				/*Todo Status nà cái gì thế? */
				status: "20/20",
			};
		});
		setClassInfoList([...classData]);
		setPeriodTableData([...periodList]);
	}, [classesList, periodTuitionList]);

	function onChangeDateFilter(date: moment.Moment | null) {
		const param = {
			class_id: searchParam.class_id,
			page: 1,
		};
		const from_date = date?.format("YYYY-MM-DD");
		const to_date =
			(date &&
				moment(date ?? "")
					.add(1, "Q")
					.subtract(1, "d")
					.format("YYYY-MM-DD")) ??
			void 0;
		setSearchParam({ ...param, from_date, to_date });
	}

	function handleChangeClass(classID: number) {
		setSearchParam({ ...searchParam, page: 1, class_id: classID || void 0 });
	}

	return (
		<Layout.Content>
			<Space style={{ marginBottom: 20, marginTop: 20 }}>
				<DatePicker style={{ width: 200 }} placeholder="Lọc theo quý" onChange={onChangeDateFilter} picker="quarter" />
				<Select defaultValue={0} style={{ width: 280 }} onChange={handleChangeClass}>
					<Option value={0}>Tất cả</Option>
					{classInfoList.map((cl) => (
						<Option value={cl.id} key={cl.id}>
							{" "}
							{cl.name}
						</Option>
					))}
				</Select>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => history.push({ pathname: `/payments/tuition-create` })}
				>
					Tạo bảng học phí
				</Button>
			</Space>
			<Table dataSource={periodTableData} bordered>
				<Column title="Lớp" dataIndex="class_name" key="class_name" />
				<ColumnGroup title="Chu kỳ">
					<Column title="Từ ngày" dataIndex="fromDate" key="fromDate" render={(v) => moment(v).format(dateFormat)} />
					<Column title="Đến ngày" dataIndex="toDate" key="toDate" render={(v) => moment(v).format(dateFormat)} />
				</ColumnGroup>
				<Column title="Số buổi học (act/est)" dataIndex="estact_session_num" key="estact_session_num" />
				<Column title="Tổng thu" dataIndex="amout" key="amout" render={(v) => formatCurrency(v)} />
				<Column title="Trạng thái" dataIndex="status" key="status" />
				<Column
					title="Action"
					key="action"
					render={() => (
						<Space size="middle">
							<Tooltip title="Chi tiết">
								<Button
									type="link"
									onClick={() => history.push({ pathname: `/payments/tuition-detail/${1}` })}
									icon={<UnorderedListOutlined />}
								/>
							</Tooltip>
							<Tooltip title="Chỉnh sửa">
								<Button
									type="link"
									onClick={() => history.push({ pathname: `/payments/tuition-edit/${1}` })}
									icon={<EditOutlined />}
								/>
							</Tooltip>
						</Space>
					)}
				/>
			</Table>
			,
		</Layout.Content>
	);
}
