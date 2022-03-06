import React, { useEffect, useState } from 'react';
import { Descriptions, Typography, Layout, Table, Button, Tag, Space, Image, PageHeader } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { LessonType, StudentType, StudySummaryType } from 'interface';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetAttendances } from 'store/attendances/slice';
import { actionGetTestes } from 'store/testes/slice';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import { actionGetLessons } from 'store/lesson/slice';
import Modal from 'antd/lib/modal/Modal';
import { actionGetStudyGifts } from 'store/study-summary/slice';
import { StudentGiftType } from 'interface';
import { actionGetStudents } from 'store/students/slice';

const { Title } = Typography;

export function StudySummaryDetail(): JSX.Element {

    const location = useLocation();
    const dispatch = useAppDispatch();
    const history = useHistory();
    const summaryInfo = get(location, "state.summaryInfo", null) as StudySummaryType;
    const [conductPoint, setConductPoint] = useState<number[]>([]);
    const [testPointAvg, setTestPointAvg] = useState<number[]>([]);

    //application state
    const testes = useSelector((state: RootState) => state.testReducer.testes);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const students =  useSelector((state: RootState) => state.studentReducer.students);
    const getLessonsStat = useSelector((state: RootState) => state.lessonReducer.getLessonsState);
    const getTestsStat = useSelector((state: RootState) => state.testReducer.getTestesStatus);
    const getStudentsStat = useSelector((state: RootState) => state.studentReducer.getStudentsStatus);




    // get list students, lessons, tests
    useEffect(() => {
        if (summaryInfo) {
            dispatch(actionGetStudents({
                class_id: summaryInfo.class_id
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

    // cal conduct point agv for each student.
    useEffect(() => {
        if(students && lessons){
            const conduct: number[] = [];
            get(students, "data", []).forEach((st) => {
                if(st.class_histories.length > 1){
                    if(moment(st.class_histories[1].date).isAfter(moment(summaryInfo.from_date))){
                        console.log(st.name, 'có điểm tổng kết ở 2 lớp', st.class_histories[1].class_id)
                    }
                }
                let total = 0;
                lessons.data?.forEach((ls) => {
                    const at_found = ls.attendances.find((at)=>at.student_id === st.id);
                    if(at_found) total += +at_found.conduct_point;
                })
                conduct.push(total + 10);
            })
        
            setConductPoint(conduct);
        }
    }, [students,lessons]);

    // cal test point avg for each student
    useEffect(() => {
        const testPoint: number[] = [];
        get(students, "data", []).forEach((st) => {
            let count = 0;
            let total = 0;
            get(testes, "data", []).forEach((test) => {
                const found = get(test, "test_results", []).find((rs) => rs.student_id === st.id)
                if (found && found.point !== null) {
                    total += +found.point;
                    count++;
                }
            })
            if (count > 0) testPoint.push(Math.floor(total / count * 100) / 100);
            else testPoint.push(0)
        });
        setTestPointAvg(testPoint);
    }, [testes, students]);


    // get conduct point for each student on each lesson
    function getConductPoint(lsIndex:number, stID:number): string {
        return get(lessons,"data",[])[lsIndex].attendances.find((at) => at.student_id === stID)?.conduct_point || '-';
    }

    function getTestPoint(stID: number, lsID: number): string {
        let res = '';
        let count = 0;
        get(testes, "data", []).forEach((test) => {
            if (test.lesson_id === lsID) {
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
    get(lessons, "data", []).map((ls, index) => {
        cols.push({
            title: `${moment(ls.date).format("DD/MM")}`,
            dataIndex: "",
            key: `lesson-${ls.id}`,
            width: 40,
            render: function col(text: string, record: StudentType): JSX.Element {
                return (
                    <>
                        <div style={{ borderBottom: "solid 1px #ecf0f1", marginBottom: 5, textAlign: "center" }}>{getConductPoint(index, record.id )}</div>
                        <div style={{ textAlign: "center" }}>{getTestPoint(record.id, ls.id)}</div>
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
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => history.goBack()}
                title="Chi tiết bảng tổng kết"
                extra={<StudentGiftsModal summaryInfo={summaryInfo} />}
            />
           <div style={{paddingLeft:20}}>
           <Descriptions bordered>
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
                loading={getTestsStat === 'loading' || getLessonsStat === 'loading' || getStudentsStat === 'loading'}
                bordered
                columns={cols}
                dataSource={get(students, "data", [])}
                pagination={{ defaultPageSize: 100 }}
                scroll={{ x: 'calc(700px + 50%)' }}
            />
           </div>
        </Layout.Content>
    )
}

function StudentGiftsModal(props: { summaryInfo: StudySummaryType }): JSX.Element {

    const { summaryInfo } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);

    //application state
    const studentGifts = useSelector((state: RootState) => state.studySummaryReducer.studentGifts)
    const getStudentGiftsStatus = useSelector((state: RootState) => state.studySummaryReducer.getStudyGiftsState)

    useEffect(() => {
        if (summaryInfo) {
            dispatch(actionGetStudyGifts({ study_summary_board_id: summaryInfo.id }));
        }
    }, [dispatch, summaryInfo])

    const cols: any[] = [
        {
            title: "Học sinh",
            key: "student",
            dataIndex: "",
            render: function StudentCol(text: string, record: StudentGiftType): JSX.Element {
                return (<strong>{get(record, "student.name", "")}</strong>)
            }

        },
        {
            title: "Quà chọn",
            key: "gift",
            dataIndex: "",
            render: function GiftCol(text: string, record: StudentGiftType): JSX.Element {
                return (
                    <Space>
                        <Image width={60} src={get(record, "gift.url", "error")} style={{ marginRight: 10 }} />
                        <span>{get(record, "gift.name", "")}</span>
                    </Space>
                )
            }
        },
        {
            title: "Loại",
            key: "type",
            dataIndex: "",
            render: function StatusCol(text: string, record: StudentGiftType): JSX.Element {
                return (
                    <>{get(record, "gift.type", "")}</>
                )
            }

        },
        {
            title: "Trạng thái",
            key: "status",
            dataIndex: "status",
            render: function statusCol(status: number): JSX.Element {
                return (
                    <Tag color={status === 1 ? "green" : "orange"}>{status === 1 ? "Đã trao" : "Chưa trao"}</Tag>
                )
            }

        }
    ]

    return (
        <>
            <Button icon={<GiftOutlined />} type="primary" onClick={() => setShow(true)}>DS chọn quà tặng</Button>
            <Modal
                visible={show}
                width={1000}
                title="Danh sách chọn quà tặng"
                onCancel={() => setShow(false)}
                onOk={() => setShow(false)}
            >
                <Table
                    columns={cols}
                    dataSource={get(studentGifts, "data", [])}
                    loading={getStudentGiftsStatus === "loading" ? true : false} />

            </Modal>
        </>
    )
}