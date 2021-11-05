
import React from 'react';
import { Button, Col, Input, Layout, Row, Space, Table } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import AddStudentModal from './addStudentModal';
import EditStudentModal from './editStudentModal';
import { Student } from '../../interface';

export default function Students():JSX.Element {

    const ColActions = (text:string, record: Student) => {
		return (
			<Space size="middle">
				{/* <Button type="link" icon={<UnorderedListOutlined />}  onClick={() => history.push("/classes-detail")}/> */}
				<EditStudentModal />
			</Space>
		);
	}
	ColActions.displayName = "ColActions";

	const dataSource: Student[] = [
		{
            name:"Nguyen Van A",
            parent: {
                user_id:1,
                name:"Tran Thi Nham"
            },
            birthday:"",
            gender:1,
            school: "",
            class:{
                id:1,
                name:'Lớp Tiếng Anh 3'
            },
            admission_date:"",
            address:"",
            interests:"",
            dislikes:"",
            personality:"",
            hope:"",
            knowledge_status:6,
            is_special:0
		},
		{
            name:"Nguyen Van A",
            parent: {
                user_id:1,
                name:"Tran Thi Nham"
            },
            birthday:"",
            gender:1,
            school: "",
            class:{
                id:1,
                name:'Lớp Tiếng Anh 3'
            },
            admission_date:"",
            address:"",
            interests:"",
            dislikes:"",
            personality:"",
            hope:"",
            knowledge_status:6,
            is_special:0
		},
		{
            name:"Nguyen Van A",
            parent: {
                user_id:1,
                name:"Tran Thi Nham"
            },
            birthday:"",
            gender:1,
            school: "",
            class:{
                id:1,
                name:'Lớp Tiếng Anh 3'
            },
            admission_date:"",
            address:"",
            interests:"",
            dislikes:"",
            personality:"",
            hope:"",
            knowledge_status:6,
            is_special:0
		},
	];

	const columns = [

		{
			width: '15%',
			title: "Họ tên",
			dataIndex: "name",
			key: "name"
        },
        {
			width: '10%',
			title: "Ngày sinh",
			dataIndex: "birthday",
			key: "birthday"
		},
		
		{
			width: '15%',
			title: "Phụ huynh",
			dataIndex: "parent",
			key: "parent"
        },
        {
			width: '15%',
			title: "Lớp",
			dataIndex: "class.name",
			key: "class"
		},
		{
			width: '10%',
			title: "Trường học",
			dataIndex: "school",
			key: "school"
		},
		
		{
			width: '10%',
			title: "Gới tính",
			dataIndex: "gender",
			key: "gender"
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
					< AddStudentModal/>
					
				</Col>
			</Row>
			<Table dataSource={dataSource} columns={columns} bordered />
		</Layout.Content>
	);
}