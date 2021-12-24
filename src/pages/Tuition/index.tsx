import React from 'react';
import { Button, DatePicker, Layout, Select, Space, Table, Tag, Tooltip } from 'antd';
import { UnorderedListOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import EditTuition from './editTuition';

const { Option } = Select;
const { Column, ColumnGroup } = Table;

export default function Tuition(): JSX.Element {
    const history = useHistory();
    function onChangeDateFilter(date: any, dateString: string) {
        console.log(date, dateString);
    }

    function handleChangeClass(classID: number) {
        console.log("change class: ", classID);
    }

    const data = [
        {
            key: '1',
            class_name: "Lớp tiếng Anh 4",
            fromDate: '01-10-2021',
            toDate: '30-11-2021',
            estact_session_num: "32/5",
            amout: '23,000,000',
            status: "20/20"

        },
        {
            key: '2',
            class_name: "Lớp tiếng Anh 5",
            fromDate: '01-10-2021',
            toDate: '30-11-2021',
            estact_session_num: "33/32",
            amout: '23,300,000',
            status: "11/18"

        },
        {
            key: '3',
            class_name: "Lớp tiếng Anh 3",
            fromDate: '01-10-2021',
            toDate: '30-11-2021',
            estact_session_num: "32/32",
            amout: '23,000,000',
            status: "23/23"
        },
    ];
    return (
        <Layout.Content>
            <Space style={{ marginBottom: 20, marginTop: 20 }}>
                <DatePicker style={{ width: 200 }} placeholder="Lọc theo quý" onChange={onChangeDateFilter} picker="quarter" />
                <Select defaultValue={0} style={{ width: 280 }} onChange={handleChangeClass}>
                    <Option value={1}>Lớp tiếng Anh 4</Option>
                    <Option value={2}>Lớp tiếng Anh 3</Option>
                    <Option value={3}>Lớp tiếng Anh 5</Option>
                </Select>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push({ pathname: `/payments/tuition-create`})}>Tạo bảng học phí</Button>
            </Space>
            <Table dataSource={data} bordered>
                <Column title="Lớp" dataIndex="class_name" key="class_name" />
                <ColumnGroup title="Chu kỳ">
                    <Column title="Từ ngày" dataIndex="fromDate" key="fromDate" />
                    <Column title="Đến ngày" dataIndex="toDate" key="toDate" />
                </ColumnGroup>
                <Column title="Số buổi học (est/act)" dataIndex="estact_session_num" key="estact_session_num" />
                <Column title="Tổng thu" dataIndex="amout" key="amout" />
                <Column title="Trạng thái" dataIndex="status" key="status" />
                <Column
                    title="Action"
                    key="action"
                    render={(text: string) => (
                        <Space size="middle">
                            <Tooltip title="Chi tiết">
                                <Button type="link" onClick={() => history.push({ pathname: `/payments/tuition-detail/${1}`})} icon={<UnorderedListOutlined />} />
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                                <Button type="link" onClick={() => history.push({ pathname: `/payments/tuition-edit/${1}`})} icon={<EditOutlined />} />
                            </Tooltip>
                        </Space>
                    )}
                />
            </Table>,
        </Layout.Content>
    )
}