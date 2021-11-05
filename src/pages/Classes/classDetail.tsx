import { Layout, PageHeader, Tabs, Button, DatePicker, Descriptions, Table, Space } from 'antd';
import React from 'react';
import moment from 'moment';
import { Attendance } from '../../interface';

const dateFormat = 'DD/MM/YY';
export default function ClassDetail(): JSX.Element {
    const { TabPane } = Tabs;
    const today = moment(new Date()).format(dateFormat);
    const attendance_columns = [
        {
            title: 'Họ tên',
            width: 180,
            dataIndex: 'student',
            key: 'student',
            fixed: true
        },
        {
            title: 'Ngày sinh',
            width: 160,
            dataIndex: 'birthday',
            key: 'birthday',
            fixed: true
        },
        { 
            title: '03/11/21', 
            dataIndex: 'is_attended', 
            key: '1', 
            width: 100 
        },
        { title: '05/11/21', dataIndex: 'is_attended', key: '2', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '3', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '4', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '5', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '6', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '7', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '8', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '9', width: 100 },
        { title: '05/11/21', dataIndex: 'is_attended', key: '10', width: 100 },
        { title: `${today}`, dataIndex: 'is_attended', key: '11', width: 100 },

        {
            title: 'Action',
            key: 'operation',
            width: 100,
            fixed: true,
            render: function ActionRow(): JSX.Element {
                return (
                    <Button type="link">Lưu lại </Button>
                );
            },
        },
    ];

    const schedule_data: Attendance[] = [
        {
            student: 'John Brown',
            birthday: "26/03/2012",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },
        {
            student: 'John Baby',
            birthday: "26/09/2014",
            is_attended: true
        },

    ];

    return (
        <Layout.Content>
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title="Lớp tiếng Anh 2"
                subTitle="Chi tiết lớp học"
                extra={[
                    <Button key="3" type="primary">Thêm học sinh</Button>,
                    <Button key="2">In danh sách</Button>,
                ]}
                footer={
                    <Tabs defaultActiveKey="1">

                        <TabPane tab="Điểm danh" key="1">
                            <Space style={{ paddingTop: 20, marginBottom: 20 }}>
                                Ngày:
                                <DatePicker defaultValue={moment(new Date(), dateFormat)} format={dateFormat} />
                            </Space>
                            <Table dataSource={schedule_data} columns={attendance_columns} scroll={{ x: 1200 }} bordered />
                        </TabPane>
                        <TabPane tab="Học tập" key="2">

                        </TabPane>
                        <TabPane tab="Bài test" key="3">

                        </TabPane>
                    </Tabs>
                }
            >

                <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Giáo viên">Mss Nhâm</Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">2017-01-10</Descriptions.Item>
                    <Descriptions.Item label="Số buổi">24</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">2017-10-10</Descriptions.Item>
                    <Descriptions.Item label="Số học sinh">20</Descriptions.Item>
                    <Descriptions.Item label="Lịch học">
                        Thứ 2 19h40 - 21h10 & Thứ 5 19h40-21h10
                    </Descriptions.Item>
                </Descriptions>
            </PageHeader>
        </Layout.Content>
    )
}