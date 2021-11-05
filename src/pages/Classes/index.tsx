import React from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../store/store";
import { ClassI } from "../../interface";
import { Button, Col, Input, Layout, Row, Space, Table } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import EditClassModal from "./editClassModal";
import AddClassModal from "./addClassModal";
import { useHistory } from "react-router-dom";

function Classes(): JSX.Element {
	const history = useHistory();
	const ColActions = () => {
		return (
			<Space size="middle">
				<Button type="link" icon={<UnorderedListOutlined />}  onClick={() => history.push("/classes-detail")}/>
				<EditClassModal />
			</Space>
		);
	}
	ColActions.displayName = "ColActions";

	const dataSource: ClassI[] = [
		{
			name: "Tiếng Anh 2",
			teacher:{
				id:1,
				name:"Mss Nham",
			},
			sessions_num: 24,
			students_num: 20,
			fee_per_session: '300.000',
			schedule: '2,4,6'
		},
		{
			name: "Tiếng Anh 3",
			teacher:{
				id:1,
				name:"Mss Nham",
			},
			sessions_num: 24,
			students_num: 20,
			fee_per_session: '300.000',
			schedule: '2,4,6'
		},
		{
			name: "Tiếng Anh 4",
			teacher:{
				id:1,
				name:"Mss Nham",
			},
			sessions_num: 24,
			students_num: 20,
			fee_per_session: '300.000',
			schedule: '2,4,6'
		},
	];

	const columns = [

		{
			width: '15%',
			title: "Tên lớp",
			dataIndex: "name",
			key: "name"
		},
		{
			width: '15%',
			title: "Giáo viên",
			dataIndex: "teacher",
			key: "teacher"
		},
		{
			width: '5%',
			title: "Số buổi",
			dataIndex: "sessions_num",
			key: "sessions_num"
		},
		{
			width: '10%',
			title: "Số học sinh",
			dataIndex: "students_num",
			key: "students_num"
		},
		{
			width: '10%',
			title: "Học phí / buổi",
			dataIndex: "fee_per_session",
			key: "fee_per_session"
		},
		{
			width: '10%',
			title: "Lịch học",
			dataIndex: "schedule",
			key: "schedule"
		},
		{
			width: '15%',
			title: "Action",
			key: "action",
			render: ColActions
		},
	]

	return (
		<Layout.Content style={{ height: 1000 }}>
			<Row style={{ marginBottom: 20, marginTop: 20 }} justify="start">
				<Col span={10}>
					<Input.Search allowClear />
				</Col>
				<Col span={6} style={{ marginLeft: 20 }}>
					<AddClassModal />
					
				</Col>
			</Row>
			<Table dataSource={dataSource} columns={columns} bordered />
		</Layout.Content>
	);
}

export default Classes;
