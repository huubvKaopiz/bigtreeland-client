import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ClassType } from "../../interface";
import { Button, Col, Input, Layout, Row, Space, Table } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import EditClassModal from "./editClassModal";
import AddClassModal from "./addClassModal";
import { useHistory } from "react-router-dom";
import { useAppDispatch } from "store/store";
import { actionGetClasses } from "store/classes/slice";
import { get } from "lodash";
import { actionGetEmployees } from "store/employees/slice";
import numeral from "numeral";

function Classes(): JSX.Element {
	const dispatch = useAppDispatch();
	const history = useHistory();
	const getStatus = useSelector((state: RootState) => state.classReducer.getClassesStatus);
	const classes = useSelector((state: RootState) => state.classReducer.classes);
	const teachers = useSelector((state: RootState) => state.employeeReducer.employees);
	const seachStatus = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);

	useEffect(() => {
		dispatch(actionGetClasses({ page: 1 }));
	}, [dispatch]);

	useEffect(() => {
		dispatch(actionGetEmployees({ class_id: 0 }));
	}, [dispatch]);

	const searchTeacher = (search: string) => {
		if (search.length >= 3 || search.length === 0) dispatch(actionGetEmployees({ class_id: 0, search }));
	};

	const columns = [
		{
			width: "15%",
			title: "Tên lớp",
			dataIndex: "name",
			key: "name",
		},
		{
			width: "15%",
			title: "Giáo viên",
			dataIndex: "employee",
			key: "employee",
			render: function TeacherCol(value?: { name: string; id: number }): JSX.Element {
				return <Button type="link">{value && value.name}</Button>;
			},
		},
		{
			width: "10%",
			title: "Số buổi",
			dataIndex: "sessions_num",
			key: "sessions_num",
		},
		{
			width: "10%",
			title: "Số học sinh",
			dataIndex: "students_num",
			key: "students_num",
		},
		{
			width: "10%",
			title: "Học phí / buổi",
			dataIndex: "fee_per_session",
			key: "fee_per_session",
			render: function amountCol(amount: number): JSX.Element {
				return <span>{numeral(amount).format("0,0")}</span>;
			},
		},
		{
			width: "20%",
			title: "Lịch học",
			dataIndex: "schedule",
			key: "schedule",
		},
		{
			width: "15%",
			title: "Action",
			key: "action",
			render: function ActionCol(record: ClassType): JSX.Element {
				return (
					<Space size="middle">
						<Button
							type="link"
							icon={<UnorderedListOutlined />}
							onClick={() => history.push({ pathname: `/classes-detail/${record.id}`, state: { classInfo: record } })}
						/>
						<EditClassModal
							classInfo={record}
							teachers={teachers}
							searchTeacher={searchTeacher}
							searchStatus={seachStatus}
						/>
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddClassModal teachers={teachers} searchTeacher={searchTeacher} searchStatus={seachStatus} />
				</Col>
			</Row>
			<Table
				dataSource={get(classes, "data", [])}
				columns={columns}
				loading={getStatus === "loading" ? true : false}
				rowKey="id"
				bordered
				size="small"
			/>
		</Layout.Content>
	);
}

export default Classes;
