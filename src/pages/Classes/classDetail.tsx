import { Layout, PageHeader, Tabs, Button, DatePicker, Descriptions, Table, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useParams } from "react-router-dom";
import { RootState, useAppDispatch } from 'store/store';
import { actionAddAttendance, actionGetAttendances } from 'store/attendances/slice';
import { useSelector } from 'react-redux';
import { actionGetClass } from 'store/classes/slice';
import { get } from 'lodash';
import AddStudentsModal from './addStudentsModal';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import AddTest from './addTestModal';
// import numeral from 'numeral';

const dateFormat = 'YYYY-MM-DD';
export default function ClassDetail(): JSX.Element {
    const params = useParams() as { class_id: string }
    const dispatch = useAppDispatch();
    const { TabPane } = Tabs;
    const [today, setToday] = useState(moment(new Date()).format(dateFormat));
    // const classInfo = location.state.classInfo as ClassType;
    const attendances = useSelector((state: RootState) => state.attendanceReducer.attendances)
    const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
    const attendantList: number[] = [];

    useEffect(() => {
        if (params.class_id) {
            dispatch(actionGetAttendances({ class_id: parseInt(params.class_id) }));
            dispatch(actionGetClass(parseInt(params.class_id)))
        }
    }, [dispatch, params])

    function isAttendant(sID: number, atKey: string) {
        const atList = attendances?.attendances[atKey];
        // console.log(sID, atList)
        const found = atList && atList.find((element: number) => element === sID);
        if (found !== undefined && found > 0) return true;
        else return false;
    }

    function handleCheckbox(e: any, sID: number) {
        // console.log(e.target.checked, "-", sID)
        if (e.target.checked === true) {
            attendantList.push(sID);
        } else {
            const found = attendantList.indexOf(sID);
            attendantList.splice(found, 1)
        }
        // console.log(attendantList)
    }

    function handleSubmit() {
        if (attendantList.length > 0 && classInfo) {
            const params = {
                class_id: classInfo.id,
                teacher_id: get(classInfo, "employee.id", 0),
                student_ids: attendantList,
                date: today
            }
            dispatch(actionAddAttendance(params))
        }
    }

    const attendance_columns: any[] = [
        {
            title: 'Họ tên',
            width: 80,
            dataIndex: 'name',
            key: 'name',
            fixed: true,
            render: function col(value: string): JSX.Element {
                return (
                    <strong>{value}</strong>
                );
            },
        },
        {
            title: 'Ngày sinh',
            width: 30,
            dataIndex: 'birthday',
            key: 'birthday',
            fixed: true
        },
    ];

    for (const key in get(attendances, "attendances", [])) {
        attendance_columns.push({
            title: `${moment(key).format("DD/MM/YYYY")}`,
            width: 80,
            dataIndex: "",
            key: `${key}`,
            fixed: false,
            render: function col(st: { id: number, name: string }): JSX.Element {
                return (
                    <Checkbox checked={isAttendant(st.id, key)} disabled />
                );
            },
        })
    }

    const todayCol = {
        title: `${today}`,
        key: 'operation',
        dataIndex: "",
        width: 80,
        fixed: false,
        render: function col(st: { id: number, name: string }): JSX.Element {
            return (
                <Checkbox onChange={(e) => handleCheckbox(e, st.id)} />
            );
        },
    }
    attendance_columns.push(todayCol);

    return (
        <Layout.Content>
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title={classInfo?.name}
                subTitle="Chi tiết lớp học"
                extra={[
                    <AddStudentsModal key="addStudents" class_id={params.class_id} />,
                    <Button key="2">In danh sách</Button>,
                ]}
                footer={
                    <Tabs defaultActiveKey="1">

                        <TabPane tab="Điểm danh" key="1">
                            <Space style={{ paddingTop: 20, marginBottom: 20 }}>
                                Ngày:
                                <DatePicker
                                    defaultValue={moment(new Date(), dateFormat)}
                                    format={dateFormat}
                                    onChange={(e) => setToday(moment(e).format("DD/MM/YYYY"))} />
                                <Button type="primary" onClick={handleSubmit}>Lưu lại</Button>
                            </Space >
                            <Table dataSource={get(attendances, "students", [])} columns={attendance_columns} scroll={{ x: 1200 }} bordered rowKey="id" />
                        </TabPane>
                        <TabPane tab="Học tập" key="2">
                        <Space style={{ paddingTop: 20, marginBottom: 20 }}>
                           <AddTest classInfo={classInfo}/>
                        </Space>
                        </TabPane>
                        <TabPane tab="Bài test" key="3">

                        </TabPane>
                    </Tabs>
                }
            >
                <Descriptions size="small" column={2} style={{backgroundColor:"white", padding:20}}>
                    <Descriptions.Item label="Giáo viên"><a>{get(classInfo, "employee.name", "")}</a></Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">{moment(get(classInfo, "start_date", "")).format("DD-MM-YYYY")}</Descriptions.Item>
                    <Descriptions.Item label="Số buổi">{classInfo?.sessions_num}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{moment(get(classInfo, "end_date", "")).format("DD-MM-YYYY")}</Descriptions.Item>
                    <Descriptions.Item label="Số học sinh">{classInfo?.students_num}</Descriptions.Item>
                    <Descriptions.Item label="Lịch học">
                        {classInfo?.schedule}
                    </Descriptions.Item>
                </Descriptions>
            </PageHeader>
        </Layout.Content>
    )
}