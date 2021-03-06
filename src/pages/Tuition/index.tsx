import { CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined, MinusCircleOutlined, PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, DatePicker, Layout, Modal, Select, Space, Spin, Table, Tag, Tooltip } from "antd";
import useDebouncedCallback from "hooks/useDebounceCallback";
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
	deleteAble: boolean;
};

export default function Tuition(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();

	const [periodTableData, setPeriodTableData] = useState<TableDataType[]>([]);
	const [classInfoList, setClassInfoList] = useState<ClassType[]>([]);
	const [searchParam, setSearchParam] = useState<GetPeriodTuionsPrams>({});
	const [search, setSearch] = useState("");

	const periodTuitionList = useSelector((state: RootState) => state.periodTuitionReducer.periodTuitions);
	const getTuitionListState = useSelector((state: RootState) => state.periodTuitionReducer.getPeriodTuitionsStatus);
	const searchClassState = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const classesList = useSelector((state: RootState) => state.classReducer.classes);

	const searchClass = useDebouncedCallback((searchText) => {
		setSearch(searchText)
		dispatch(actionGetClasses({ search }))
	}, 500)

	useEffect(() => {
		dispatch(actionGetPeriodTuions(searchParam));
		dispatch(actionGetClasses({}));
	}, [dispatch, searchParam]);

	//update period tuition fee info
	useEffect(() => {
		const classData = get(classesList, "data", []);
		const periodList = get(periodTuitionList, "data", []).map((period) => {
			let deleteAble = true;
			if (get(period, "act_session_num", 0) > 0) deleteAble = false;
			const tuitionsCount = get(period, "tuition_fees", []).length;
			let amount = 0;
			let paidCount = 0;
			//cal total of fees and total of paid
			get(period, "tuition_fees", []).forEach((tuition) => {
				const est_fee = period.est_session_num * get(period, "fee_per_session", 0);
				const deduce_amount =
					+get(tuition, "residual", 0) +
					+get(tuition, "fixed_deduction", 0) +
					+get(tuition, "flexible_deduction", 0) -
					+get(tuition, "prev_debt", 0);
				const cal_fee = est_fee - deduce_amount;
				amount += cal_fee;
				if (tuition.status === 1) paidCount++;
			})
			if (paidCount > 0) deleteAble = false
			return {
				key: period.id,
				class_name: get(period,"class.name",""),
				fromDate: period.from_date,
				toDate: period.to_date,
				active: period.active,
				estact_session_num: `${get(period, "lessons", []).length}/${period.est_session_num}`,
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
	function handleActive(period: TableDataType) {
		confirm({
			title: period.active === 1 ? "B??? k??ch ho???t chu k??? h???c ph??" : "K??ch ho???t chu k??? h???c ph??",
			icon: <ExclamationCircleOutlined />,
			content: period.active === 1 ?
				<span>L??u ?? l???p h???c lu??n ph???i c?? m???t chu k??? h???c ph?? ???????c k??ch ho???t.</span> :
				<span>L??u ?? t???i m???t th???i ??i???m m???t l???p ch??? c?? duy nh???t m???t chu k??? h???c ph?? ???????c k??ch ho???t. N???u mu???n k??ch ho???t chu k??? m???i th?? ph???i b??? k??ch ho???t chu k??? c?? tr?????c!</span>,
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
			title: "B???n mu???n xo?? chu k??? h???c ph?? n??y?",
			icon: <ExclamationCircleOutlined />,
			content: "L??u ?? b???n ch??? xo?? ???????c chu k??? h???c ph?? khi ch??a h???c ???????c bu???i n??o v?? ch??a c?? h???c sinh n??o ????ng h???c ph??!",
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
				<DatePicker style={{ width: 200 }} placeholder="L???c theo qu??" onChange={onChangeDateFilter} picker="quarter" />
				<Select defaultValue={0} style={{ width: 480 }} onChange={handleChangeClass}
					showSearch
					onSearch={(e) => searchClass(e)}
					filterOption={false}
					notFoundContent={searchClassState === "loading" ? <Spin size="small" /> : null}
					>
					<Option value={0}>T???t c???</Option>
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
					L???p b???ng h???c ph??
				</Button>
			</Space>
			<Table dataSource={periodTableData} bordered loading={getTuitionListState === 'loading'}>
				<Column title="L???p" dataIndex="class_name" key="class_name" render={(v) => <strong>{v}</strong>} />
				<ColumnGroup title="Chu k???">
					<Column title="T??? ng??y" dataIndex="fromDate" key="fromDate" render={(v) => moment(v).format(dateFormat)} />
					<Column title="?????n ng??y" dataIndex="toDate" key="toDate" render={(v) => moment(v).format(dateFormat)} />
				</ColumnGroup>
				<Column title="S??? bu???i h???c (act/est)" dataIndex="estact_session_num" key="estact_session_num" />
				<Column title="T???ng h???c ph??" dataIndex="amout" key="amout" render={(v) => <strong style={{ color: "#2980b9" }}>{numeral(v).format("0,0")}</strong>} />
				<Column title="???? n???p" dataIndex="status" key="status" />
				<Column title="Tr???ng th??i" dataIndex="active" key="active" render={(v) => v === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Deactive</Tag>} />
				<Column
					title="Action"
					key="action"
					render={(_: number, rowData: TableDataType) => (
						<Space size="middle">
							<Tooltip title="Chi ti???t">
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
							<Tooltip title="Xo?? chu k??? h???c ph??">
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
		</Layout.Content>
	);
}
