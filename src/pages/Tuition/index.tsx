import { PlusOutlined, UnorderedListOutlined, MinusCircleOutlined, CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Layout, Select, Space, Table, Tag, Tooltip, Modal } from "antd";
import { ClassType } from "interface";
import { get } from "lodash";
import moment from "moment";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClasses } from "store/classes/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionDeletePeriodTuion, actionGetPeriodTuions, actionUpdatePeriodTuion, GetPeriodTuionsPrams } from "store/tuition/periodslice";
import { dateFormat } from "utils/const";

const { Option } = Select;
const { Column, ColumnGroup } = Table;
const { confirm } = Modal;

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
	deleteAble:boolean;
};

export default function Tuition(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const periodTuitionList = useSelector((state: RootState) => state.periodTuitionReducer.periodTuitions);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);
	const [periodTableData, setPeriodTableData] = useState<TableDataType[]>([]);
	const [classInfoList, setClassInfoList] = useState<ClassType[]>([]);
	const [searchParam, setSearchParam] = useState<GetPeriodTuionsPrams>({});

	useEffect(() => {
		dispatch(actionGetPeriodTuions(searchParam));
		dispatch(actionGetClasses({}));
	}, [dispatch, searchParam]);

	//update period tuition fee info
	useEffect(() => {
		const classData = get(classesList, "data", []);
		const periodList = get(periodTuitionList, "data", []).map((period) => {
			const classOfPeriod = classData.find((cl) => cl.id === period.class_id);
			let deleteAble = true;
			if (get(classOfPeriod, "act_session_num", 0) > 0) deleteAble = false;
			const tuitionsCount = get(period, "tuition_fees", []).length;
			let amount = 0;
			let paidCount = 0;
			//cal total of fees and total of paid
			get(period, "tuition_fees", []).forEach((tuition) => {
				const est_fee = period.est_session_num * get(classOfPeriod, "fee_per_session", 0);
				const deduce_amount =
					+get(tuition, "residual", 0) +
					+get(tuition, "fixed_deduction", 0) +
					+get(tuition, "flexible_deduction", 0) -
					+get(tuition, "debt", 0);
				const cal_fee = est_fee - deduce_amount;
				amount += cal_fee;
				if (tuition.status === 1) paidCount++;
			})
			if (paidCount > 0) deleteAble = false
			return {
				key: period.id,
				class_name: classOfPeriod?.name ?? "",
				fromDate: period.from_date,
				toDate: period.to_date,
				active: period.active,
				estact_session_num: `${get(period,"lessons",[]).length}/${period.est_session_num}`,
				amout: amount,
				status: `${paidCount}` + '/' + `${tuitionsCount}`,
				id: period.id,
				deleteAble,
			};
		});
		setClassInfoList([...classData]);
		setPeriodTableData([...periodList]);
	}, [classesList, periodTuitionList]);

	//handle change list filter
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

	//handle change class filter
	function handleChangeClass(classID: number) {
		setSearchParam({ ...searchParam, page: 1, class_id: classID || void 0 });
	}

	//handle active/deactive period tuition
	function handleActive(period:TableDataType) {
		confirm({
			title: period.active === 1 ? "Bỏ kích hoạt chu kỳ học phí" : "Kích hoạt chu kỳ học phí",
			icon: <ExclamationCircleOutlined />,
			content: period.active === 1 ?
				<span>Lưu ý lớp học luôn phải có một chu kỳ học phí được kích hoạt.</span> :
				<span>Lưu ý tại một thời điểm một lớp chỉ có duy nhất một chu kỳ học phí được kích hoạt. Nếu muốn kích hoạt chu kỳ mới thì phải bỏ kích hoạt chu kỳ cũ trước!</span>,
			onOk() {
				dispatch(actionUpdatePeriodTuion({ data: { active: period.active === 1 ? 0 : 1 }, pID: period.id })).finally(() => {
					dispatch(actionGetPeriodTuions({}))
				})
			}
		})
	}
	//handle delete period tuition. 
	//The delete action is possible in the case of the period tuition fee, which has no lessons or paid.
	function handleDeletePeriodTuition(periodID: number) {
		confirm({
			title: "Bạn muốn xoá chu kỳ học phí này?",
			icon: <ExclamationCircleOutlined />,
			content: "Lưu ý bạn chỉ xoá được chu kỳ học phí khi chưa học được buổi nào và chưa có học sinh nào đóng học phí!",
			onOk() {
				dispatch(actionDeletePeriodTuion(periodID)).finally(() => {
					dispatch(actionGetPeriodTuions({}))
				})
			}
		})
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
				<Column title="Tổng học phí" dataIndex="amout" key="amout" render={(v) => <strong style={{ color: "#2980b9" }}>{numeral(v).format("0,0")}</strong>} />
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
							{/* <ActivePeriodModal data={rowData} /> */}
							<Tooltip title={rowData.active === 1 ? "Deactive" : "Active"}>
								<Button
									type="link"
									onClick={() => handleActive(rowData)}
									icon={rowData.active === 1 ? <MinusCircleOutlined style={{ color: "#e74c3c" }} /> : <CheckCircleOutlined style={{ color: "#27ae60" }} />}
								/>
							</Tooltip>
							<Tooltip title="Xoá chu kỳ học phí">
								<Button
									type="link"
									disabled={!rowData.deleteAble}
									onClick={() => handleDeletePeriodTuition(rowData.id)}
									icon={<DeleteOutlined style={{ color: rowData.deleteAble === true ? "#e74c3c" : "#bdc3c7" }} />}
								/>
							</Tooltip>
							{/* <DeletePeriodModal periodID={rowData.id} /> */}
						</Space>
					)}
				/>
			</Table>
			,
		</Layout.Content>
	);
}
