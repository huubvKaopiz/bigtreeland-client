import { PlusOutlined, UnorderedListOutlined, MinusCircleOutlined, CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, DatePicker, Layout, Select, Space, Table, Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { ClassType, TuitionFeeType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClasses } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionDeletePeriodTuion, actionGetPeriodTuions, actionUpdatePeriodTuion, GetPeriodTuionsPrams } from "store/tuition/periodslice";
import { dateFormat } from "utils/const";
import { formatCurrency } from "utils/ultil";

const { Option } = Select;
const { Column, ColumnGroup } = Table;
type TableDataType = {
	key: string | number;
	class_name: string;
	fromDate: string;
	toDate: string;
	active: number;
	estact_session_num: string | number;
	amout: number;
	status: string;
	id: number;
};

export default function Tuition(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const periodTuitionList = useSelector((state: RootState) => state.periodTuitionReducer.periodTuitions);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const [periodTableData, setPeriodTableData] = useState<TableDataType[]>([]);
	const [classInfoList, setClassInfoList] = useState<ClassType[]>([]);
	const [searchParam, setSearchParam] = useState<GetPeriodTuionsPrams>({});
	const [periodDeleteAble, setPeriodDeleteAble] = useState(true);

	useEffect(() => {
		dispatch(actionGetPeriodTuions(searchParam));
		dispatch(actionGetClasses({}));
	}, [dispatch, searchParam]);

	useEffect(() => {
		const classData = get(classesList, "data", []);
		const periodList = get(periodTuitionList, "data", []).map((period) => {
			const classOfPeriod = classData.find((cl) => cl.id === period.class_id);
			if (get(classOfPeriod, "act_session_num", 0) > 0) setPeriodDeleteAble(false);
			const tuitionsCount = get(period, "tuition_fees", []).length;
			return {
				key: period.id,
				class_name: classOfPeriod?.name ?? "",
				fromDate: period.from_date,
				toDate: period.to_date,
				active: period.active,
				estact_session_num: `${classOfPeriod?.act_session_num}/${period.est_session_num}`,
				amout: (get(period, "tuition_fees", []) as TuitionFeeType[]).reduce((amount, tuition) => {
					const est_fee = period.est_session_num * get(classOfPeriod, "fee_per_session", 0);
					const deduce_amount =
						+get(tuition, "residual", 0) +
						+get(tuition, "fixed_deduction", 0) +
						+get(tuition, "flexible_deduction", 0) -
						+get(tuition, "debt", 0);
					const cal_fee = est_fee - deduce_amount;
					return cal_fee > 0 ? amount + cal_fee : amount;
				}, 0),
				/*Todo Status nà cái gì thế? */
				status: `${(get(period, "tuition_fees", []) as TuitionFeeType[]).reduce((done, tuition) => {
					return tuition.status === 1 ? done + 1 : done;
				}, 0)}` + '/' + `${tuitionsCount}`,
				id: period.id
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
					Lập bảng học phí
				</Button>
			</Space>
			<Table dataSource={periodTableData} bordered>
				<Column title="Lớp" dataIndex="class_name" key="class_name" render={(v) => <strong>{v}</strong>} />
				<ColumnGroup title="Chu kỳ">
					<Column title="Từ ngày" dataIndex="fromDate" key="fromDate" render={(v) => moment(v).format(dateFormat)} />
					<Column title="Đến ngày" dataIndex="toDate" key="toDate" render={(v) => moment(v).format(dateFormat)} />
				</ColumnGroup>
				<Column title="Số buổi học (act/est)" dataIndex="estact_session_num" key="estact_session_num" />
				<Column title="Tổng thu" dataIndex="amout" key="amout" render={(v) => <span style={{ color: "#2980b9" }}>{formatCurrency(v)}</span>} />
				<Column title="Đã nộp" dataIndex="status" key="status" />
				<Column title="Trạng thái" dataIndex="active" key="active" render={(v) => v === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Deactive</Tag>} />
				<Column
					title="Action"
					key="action"
					render={(_: number, rowData: TableDataType) => (
						<Space size="middle">
							<Tooltip title="Chi tiết">
								<Button
									type="link"
									onClick={() => history.push({ pathname: `/payments/tuition-detail/${rowData.id}` })}
									icon={<UnorderedListOutlined />}
								/>
							</Tooltip>
							<ActivePeriodModal data={rowData} />
							{
								periodDeleteAble == true ? <DeletePeriodModal periodID={rowData.id} /> : ""
							}
						</Space>
					)}
				/>
			</Table>
			,
		</Layout.Content>
	);
}


function ActivePeriodModal(prop: { data: TableDataType }): JSX.Element {
	const { data } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const updateStatus = useSelector((state: RootState) => state.periodTuitionReducer.updatePeriodTuitionStatus);

	useEffect(() => {
		if (updateStatus === 'success') {
			setShow(false);
			dispatch(actionGetPeriodTuions())
		}
	}, [updateStatus, dispatch])

	function handActiveStateChange() {
		dispatch(actionUpdatePeriodTuion({ data: { active: data.active === 1 ? 0 : 1 }, pID: data.id }));
	}

	return (
		<>
			<Tooltip title={data.active === 1 ? "Deactive" : "Active"}>
				<Button
					type="link"
					onClick={() => setShow(true)}
					icon={data.active === 1 ? <MinusCircleOutlined style={{ color: "#e74c3c" }} /> : <CheckCircleOutlined style={{ color: "#27ae60" }} />}
				/>
				<Modal title={data.active === 1 ? "Bỏ kích hoạt chu kỳ học phí" : "Kích hoạt chu kỳ học phí"}
					visible={show}
					onCancel={() => setShow(false)}
					onOk={handActiveStateChange}
				>
					{
						data.active === 1 ?
							<span>Lưu ý lớp học luôn phải có một chu kỳ học phí được kích hoạt.</span> :
							<span>Lưu ý tại một thời điểm một lớp chỉ có duy nhất một chu kỳ học phí được kích hoạt. Nếu muốn kích hoạt chu kỳ mới thì phải bỏ kích hoạt chu kỳ cũ trước!</span>
					}
				</Modal>
			</Tooltip>
		</>
	)
}

function DeletePeriodModal(prop: { periodID: number }): JSX.Element {

	const { periodID } = prop;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const deleteStatus = useSelector((state: RootState) => state.periodTuitionReducer.deletePeriodTuitionStatus);

	useEffect(() => {
		if (deleteStatus === 'success') {
			setShow(false);
			dispatch(actionGetPeriodTuions())
		}
	}, [deleteStatus, dispatch])

	function handDeletePeriod() {
		dispatch(actionDeletePeriodTuion(periodID));
	}

	return (
		<>
			<Tooltip title="Xoá chu kỳ học phí">
				<Button
					type="link"
					onClick={() => setShow(true)}
					icon={<DeleteOutlined style={{ color: "#e74c3c" }} />}
				/>
				<Modal title="Bạn muốn xoá chu kỳ học phí này!"
					visible={show}
					onCancel={() => setShow(false)}
					onOk={handDeletePeriod}
				>
					Lưu ý bạn chỉ xoá được chu kỳ học phí khi chưa học được buổi nào và chưa có học sinh nào đóng học phí!

				</Modal>
			</Tooltip>
		</>
	)
}