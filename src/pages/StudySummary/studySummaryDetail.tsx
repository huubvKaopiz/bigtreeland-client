import React, { useEffect, useState } from 'react';
import { Descriptions, Typography, Layout, Table } from 'antd';
import { StudentType, StudySummaryType } from 'interface';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetAttendances } from 'store/attendances/slice';
import { actionGetTestes } from 'store/testes/slice';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { actionGetLessons } from 'store/lesson/slice';

const { Title } = Typography;

export function StudySummaryDetail(): JSX.Element {

    const location = useLocation();
    const dispatch = useAppDispatch();
    const summaryInfo = get(location, "state.summaryInfo", null) as StudySummaryType;
    const [conductPoint, setConductPoint] = useState<number[]>([]);
    const [testPointAvg, setTestPointAvg] = useState<number[]>([]);

    //application state
    const attendances = useSelector((state: RootState) => state.attendanceReducer.attendances);
    const testes = useSelector((state: RootState) => state.testReducer.testes);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getAttendanceStatus = useSelector((state: RootState) => state.attendanceReducer.getAttendancesStatus);

    useEffect(() => {
        if (summaryInfo) {
            dispatch(actionGetAttendances({
                class_id: summaryInfo.class_id,
                from_date: summaryInfo.from_date,
                to_date: summaryInfo.to_date,
            }));
            dispatch(actionGetTestes({
                class_id: summaryInfo.class_id,
                from_date: summaryInfo.from_date,
                to_date: summaryInfo.to_date,
            }));
            dispatch(actionGetLessons({
                class_id: summaryInfo.class_id,
                from_date: summaryInfo.from_date,
                to_date: summaryInfo.to_date
            }));
        }
    }, [dispatch, summaryInfo])



    useEffect(() => {
        const conduct: number[] = [];
        get(attendances, "students", []).forEach((st) => {
            let total = 0;
            const attendanceMap = attendances?.attendances;
            for (const key in attendanceMap) {
                const found = attendanceMap[key].find((el) => el.student_id === st.id);
                console.log(found?.conduct_point)
                if (found) total += +found.conduct_point;
            }
            conduct.push(total + 10);
        })
        setConductPoint(conduct);
    }, [attendances]);

    useEffect(() => {
        const testPoint: number[] = [];
        get(attendances, "students", []).forEach((st) => {
            let count = 0;
            let total = 0;
            get(testes, "data", []).forEach((test) => {
                console.log(test.test_results, st.id)
                const found = get(test, "test_results", []).find((rs) => rs.student_id === st.id)
                console.log(found)
                if (found) {
                    total += +found.point;
                    count++;
                }
            })
            if (count > 0) testPoint.push(Math.floor(total / count * 100) / 100);
            else testPoint.push(0)
        });
        setTestPointAvg(testPoint);
    }, [testes, attendances]);


    function getConductPoint(stID: number, date: string): string {
        const found = attendances?.attendances && attendances.attendances[date];
        let res = 0;
        if (found) {
            res = found.find((at) => at.student_id === stID)?.conduct_point || 0;
        }
        return res != 0 ? `${res}` : '-'
    }

    function getTestPoint(stID: number, date: string): string {
        let res = '';
        let count = 0;
        get(testes, "data", []).forEach((test) => {
            if (moment(test.date).isSame(moment(date))) {
                const p = get(test, "test_results", []).find((rs) => rs.student_id == stID)?.point || 0;

                if (p > 0) {
                    res += count > 0 ? ` | ${p}` : `${p}`;
                    count++;
                }
            }
        })
        if (res === '') res = '-'
        return res;
    }


    const cols: any[] = [
        {
            title: "Học sinh",
            dataIndex: "name",
            key: "name",
            width: 60,
            fixed: 'left',
            render: function col(text: string): JSX.Element {
                return (<strong>{text}</strong>)
            }
        }
    ]
    get(lessons, "data", []).map((ls) => {
        cols.push({
            title: `${moment(ls.date).format("DD/MM")}`,
            dataIndex: "",
            key: `lesson-${ls.id}`,
            width: 40,
            render: function col(text: string, record: StudentType): JSX.Element {
                return (
                    <>
                        <div style={{ borderBottom: "solid 1px #ecf0f1", marginBottom: 5, textAlign: "center" }}>{getConductPoint(record.id, ls.date)}</div>
                        <div style={{ textAlign: "center" }}>{getTestPoint(record.id, ls.date)}</div>
                    </>
                )
            },
        })
    });
    cols.push({
        title: "Điểm HK",
        dataIndex: "",
        key: "conduct",
        // fixed: 'right',
        width: 40,
        render: function col(text: string, record: StudentType, index: number): JSX.Element {
            return <strong style={{ color: "#e74c3c" }}>{conductPoint[index]}</strong>;
        },
    })
    cols.push({
        title: "Điểm TB",
        dataIndex: "",
        key: "test",
        // fixed: 'right',
        width: 40,
        render: function col(text: string, record: StudentType, index: number): JSX.Element {
            return <strong style={{ color: "#d35400" }}>{testPointAvg[index]}</strong>;
        },
    })
    cols.push({
        title: "Điểm TK",
        dataIndex: "",
        key: "test",
        fixed: 'right',
        width: 40,
        render: function col(text: string, record: StudentType, index: number): JSX.Element {
            return <strong style={{ color: "#2980b9" }}>{testPointAvg[index] > 0 ? Math.floor((conductPoint[index] + testPointAvg[index] * 3) / 4 * 100) / 100 : conductPoint[index]}</strong>;
        },
    })

    return (
        <Layout.Content>
            <Descriptions title="Chi tiết bảng tổng kết" bordered>
                <Descriptions.Item label="Lớp"><a>{get(summaryInfo, "class.name", "")}</a></Descriptions.Item>
                <Descriptions.Item label="Giáo viên">Hangzhou, Zhejiang</Descriptions.Item>
                <Descriptions.Item label="Số học sinh">{get(summaryInfo, "class.students_num", 0)}</Descriptions.Item>
                <Descriptions.Item span={3} label="Khoảng thời gian">
                    <strong>{moment(get(summaryInfo, "from_date", "")).format("DD/MM/YYYY")} - {moment(get(summaryInfo, "to_date", "")).format("DD/MM/YYYY")}</strong>
                </Descriptions.Item>
                <Descriptions.Item span={3} label="Nội dung">
                    Điểm tổng kết = (điểm học tập * 3 + điểm hạnh kiểm) / 4
                </Descriptions.Item>
            </Descriptions>
            <Title level={4} style={{ marginTop: 20, marginBottom: 20 }}>Bảng tổng kết</Title>
            <Table
                rowKey="id"
                loading={getAttendanceStatus === 'loading' ? true : false}
                bordered
                columns={cols}
                dataSource={get(attendances, "students", [])}
                pagination={{ defaultPageSize: 100 }}
                scroll={{ x: 'calc(700px + 50%)' }}
            />
        </Layout.Content>
    )
}