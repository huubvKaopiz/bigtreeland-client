import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Col, Input, Layout, Popover, Row, Space, Table, Tag } from "antd";
import usePermissionList from "hooks/usePermissionList";
import { get } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetClasses, actionGetMyClasses, actionGetOnlineClasses } from "store/classes/slice";
import { actionGetEmployees } from "store/employees/slice";
import { dayOptions, DEFAULT_ROLE_IDS, ROLE_NAMES } from "utils/const";
import useDebouncedCallback from "../../hooks/useDebounceCallback";
import { ClassType } from "../../interface";
import { RootState } from "../../store/store";
import AddClassModal from "./addClassModal";
import EditClassModal from "./editClassModal";
import { isHavePermission } from "utils/ultil";
import useIsAdmin from "hooks/useIsAdmin";
import useRoleList from "hooks/useRoleList";
import useIsRole from "hooks/useIsRole";

function Classes(): JSX.Element {
	const dispatch = useDispatch();
	const history = useHistory();
	const permissionList = usePermissionList();
	const roleList = useRoleList();
	const isAdmin = useIsAdmin();
	const isOnlineManagent = useIsRole(ROLE_NAMES.ON_MANAGER);
	const isTeacher = useIsRole(ROLE_NAMES.TEACHER);
	const isTeacher2 = useIsRole(ROLE_NAMES.TEACHER2);
	const isAssistant = useIsRole(ROLE_NAMES.CLASS_ASSISTANT);

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [showEdit, setShowEdit] = useState(false);
	const [editIndex, setEditIndex] = useState(-1);

	const getStatus = useSelector(
		(state: RootState) => state.classReducer.getClassesStatus
	);
	const classes = useSelector((state: RootState) => state.classReducer.classes);
	const seachStatus = useSelector(
		(state: RootState) => state.employeeReducer.getEmployeesStatus
	);

	const searchClass = useDebouncedCallback((searchParam) => {
		setSearch(searchParam);
		onloadClasses(searchParam)
	}, 500);

	useEffect(() => {
		onloadClasses(search);
	}, [page, isAdmin, isTeacher, isOnlineManagent, isTeacher2, isAssistant]);

	const searchTeacher = (search: string) => {
		if (search.length >= 3 || search.length === 0)
			dispatch(
				actionGetEmployees({
					role_ids: `${DEFAULT_ROLE_IDS.TEACHER},${DEFAULT_ROLE_IDS.TEACHER2}`,
					search,
				})
			);
	};

	function onloadClasses(searchParam: string) {
		if (!isAdmin) {
			if (isOnlineManagent) {
				dispatch(actionGetOnlineClasses({ page, search: searchParam }));
			} else if (isTeacher2 || isTeacher || isAssistant) {
				dispatch(actionGetMyClasses({ page, search: searchParam }));
			} else if (isHavePermission(permissionList, "classes.index")) {
				dispatch(actionGetClasses({ page, search: searchParam }));
			}
		} else dispatch(actionGetClasses({ page, search: searchParam }));
	}

	function handleEdit(index: number) {
		setShowEdit(true);
		setEditIndex(index);
	}
	console.log(isAdmin, isTeacher, isOnlineManagent)

	const columns = [
		{
			width: 350,
			title: "T??n l???p",
			dataIndex: "name",
			key: "name",
			render: function nameCol(
				name: string,
				record: { id: number; type: number }
			): JSX.Element {
				return (
					<>
						<strong>{name}</strong>{" "}
						<Tag
							style={{ fontSize: 10 }}
							color={record.type === 0 ? "red" : "green"}
						>
							{record.type === 0 ? "Offline" : "Online"}
						</Tag>
					</>
				);
			},
		},
		{
			// width: "25%",
			title: "Gi??o vi??n",
			dataIndex: "user",
			key: "user",
			render: function TeacherCol(value: {
				id: number;
				profile: { name: string };
			}): JSX.Element {
				return (
					<Popover content={
						<div>
							S??? ??i???n tho???i: <span style={{ color: "#2980b9" }}>{get(value, "phone", "")}</span>
						</div>
					}
						title="">
						<Button type="link">{get(value, "profile.name", "")}</Button>
					</Popover>
				)
			},
		},
		{
			// width: "25%",
			title: "Tr??? gi???ng",
			dataIndex: "assistant",
			key: "assistant",
			render: function TeacherCol(value: {
				id: number;
				profile: { name: string };
			}): JSX.Element {
				return (
					<Popover content={
						<div>
							S??? ??i???n tho???i: <span style={{ color: "#2980b9" }}>{get(value, "phone", "")}</span>
						</div>
					}
						title="">
						<Button type="link">{get(value, "profile.name", "")}</Button>
					</Popover>
				)

			},
		},
		{
			width: 80,
			title: "S??? hs",
			dataIndex: "students_num",
			key: "students_num",
		},
		{
			// width: "10%",
			title: "H???c ph?? / bu???i",
			dataIndex: "fee_per_session",
			key: "fee_per_session",
			hidden: isHavePermission(permissionList, "period-tuitions.store") === false,
			render: function feeCol(amount: number): JSX.Element {
				return (
					<span style={{ color: "#3498db" }}>
						{numeral(amount).format("0,0")}
					</span>
				);
			},
		},
		{
			// width: "20%",
			title: "L???ch h???c",
			dataIndex: "schedule",
			key: "schedule",
			render: function scheduleCol(schedule: number[]): JSX.Element {
				const sortedSchedule = [...schedule];
				return (
					<>
						{sortedSchedule
							.sort()
							.map((day) => dayOptions[day])
							.join(", ")}
					</>
				);
			},
		},
		{
			width: "10%",
			title: "Action",
			key: "action",
			render: function ActionCol(
				text: string,
				record: ClassType,
				index: number
			): JSX.Element {
				return (
					<Space
						size="middle"
						style={{ display: "flex", justifyContent: "center" }}
					>
						<Button
							type="link"
							icon={<UnorderedListOutlined />}
							onClick={() =>
								history.push({
									pathname: `/study/${record.id}`,
									state: { classInfo: record },
								})
							}
						/>
						{(isAdmin ||
							isHavePermission(permissionList, "classes.update")) && (
								<Button
									type="link"
									icon={<EditOutlined />}
									onClick={() => handleEdit(index)}
								/>
							)}
					</Space>
				);
			},
		},
	];

	return (
		<Layout.Content>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search
						allowClear
						onChange={({ target: { value } }) => searchClass(value)}
						placeholder="T??m theo t??n l???p..."
					/>
				</Col>
				{(isAdmin || isHavePermission(permissionList, "classes.store")) && (
					<Col span={6} style={{ marginLeft: 20 }}>
						<AddClassModal />
					</Col>
				)}
			</Row>
			<Table
				dataSource={get(classes, "data", [])}
				columns={columns.filter((item) => !item.hidden)}
				loading={getStatus === "loading" ? true : false}
				rowKey="id"
				bordered
				size="small"
				pagination={{
					pageSize: 20,
					total: get(classes, "total", 0),
					onChange: (page) => {
						setPage(page);
					},
				}}
			/>
			{(isAdmin || isHavePermission(permissionList, "classes.update")) && (
				<EditClassModal
					classInfo={get(classes, "data", [])[editIndex]}
					searchTeacher={searchTeacher}
					searchStatus={seachStatus}
					show={showEdit}
					setShow={setShowEdit}
					searchClass={search}
				/>
			)}
		</Layout.Content>
	);
}

export default Classes;

