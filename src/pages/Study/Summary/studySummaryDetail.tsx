import { GiftOutlined } from '@ant-design/icons';
import { Button, Descriptions, Divider, Image, Layout, PageHeader, Space, Table, Tag, Typography } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { StudentGiftType, StudentType, StudySummaryType } from 'interface';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { actionGetLessons } from 'store/lesson/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudents } from 'store/students/slice';
import { actionGetStudyGifts } from 'store/study-summary/slice';
import { actionGetTestes } from 'store/testes/slice';

const { Title } = Typography;

interface SummaryType {
    date: string;
    conduct_point: number,
    test_points: number[];
}
interface SummaryStudentType {
    student: string;
    summaries: SummaryType[];
    total_conduct_point: number;
    test_point_avg: number;
}

export function StudySummaryDetail(): JSX.Element {

    const location = useLocation();
    const dispatch = useAppDispatch();
    const history = useHistory();
    const summaryInfo = get(location, "state.summaryInfo", null) as StudySummaryType;
    const [summaryDataList, setSummaryDataList] = useState<SummaryStudentType[]>([]);

    //application state
    const testes = useSelector((state: RootState) => state.testReducer.testes);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const students = useSelector((state: RootState) => state.studentReducer.students);
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
                lesson_id: null,
            }));
            dispatch(actionGetLessons({
                class_id: summaryInfo.class_id,
                from_date: summaryInfo.from_date,
                to_date: summaryInfo.to_date
            }));
        }
    }, [dispatch, summaryInfo])

    // update summary_data_list
    useEffect(() => {
        if (students && lessons && testes) {
            const conduct: number[] = [];
            const summaryStudentData: SummaryStudentType[] = [];
            get(students, "data", []).forEach((st) => {
                // if (st.class_histories.length > 1) {
                //     if (moment(st.class_histories[1].date).isAfter(moment(summaryInfo.from_date))) {
                //         console.log(st.name, 'có điểm tổng kết ở 2 lớp', st.class_histories[1].class_id)
                //     }
                // }
                let total_conduct_point = 10;
                let total_test_point = 0;
                let test_point_count = 0;
                const summaries: SummaryType[] = [];
                lessons.data?.forEach((ls) => {
                    const test_points: number[] = [];
                    ls.tests.forEach((test) => {
                        const test_result = test.test_results.find((tr) => tr.student_id === st.id);
                        if (test_result && +test_result.point > 0) {
                            test_points.push(+test_result.point)
                            total_test_point += +test_result.point;
                            test_point_count++;
                        }
                    })
                    const attendance = ls.attendances.find((at) => at.student_id === st.id);
                    if (attendance) total_conduct_point += +attendance.conduct_point;
                    summaries.push({
                        date: ls.date,
                        conduct_point: +get(attendance, "conduct_point", '0'),
                        test_points,
                    })

                })
                testes.data?.forEach((test) => {
                    if (test.lesson_id === null) {
                        const test_result = test.test_results.find((tr) => tr.student_id === st.id);
                        if (test_result && +test_result.point > 0) {
                            total_test_point += +test_result.point;
                            test_point_count++;
                        }
                        summaries.push({
                            date: test.date,
                            conduct_point: 0,
                            test_points: [+get(test_result, "point", '0')]
                        })
                    }
                })
                // console.log(total_test_point)

                summaries.sort((first, seconds) =>
                    moment(first.date).diff(moment(seconds.date))
                );
                summaryStudentData.push({
                    student: st.name,
                    summaries,
                    total_conduct_point,
                    test_point_avg: total_test_point > 0 ? Math.floor(total_test_point / test_point_count * 100) / 100 : 0
                })
            })
            setSummaryDataList(summaryStudentData)
        }
    }, [students, lessons, testes]);

    let columns: any[] = [{
        title: "Học sinh",
        dataIndex: "student",
        key: "student",
        width: 200,
        fixed: 'left',
        render: function col(text: string): JSX.Element {
            return (<strong>{text}</strong>)
        }
    }];
    summaryDataList.length > 0 && summaryDataList[0].summaries.forEach((sm, index) => {
        columns.push({
            title: `${moment(sm.date).format("DD/MM/YY")}`,
            dataIndex: '',
            key: `${index}`,
            with: 80,
            render: function col(_: string, record: SummaryStudentType): JSX.Element {
                return (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: "#e67e22", height: 28 }}>
                            {record.summaries[index].conduct_point > 0 ? record.summaries[index].conduct_point : '-'}
                        </span>
                        {' '} | {' '}
                        <span style={{ color: "#3498db" }}>
                            {
                                record.summaries[index].test_points.length > 0
                                    ?
                                    record.summaries[index].test_points.map((tp, index) =>
                                        <span >{`${tp} ${index < sm.test_points.length - 1 ? ', ' : ''}`}</span>)
                                    :
                                    '-'
                            }
                        </span>
                    </div>
                )
            }
        })
    });
    columns = columns.concat([
        {
            title: "Tổng HK",
            dataIndex: "total_conduct_point",
            key: "total_conduct_point",
            width: 80,
            fixed: 'right',
            render: function col(text: number): JSX.Element {
                return (<strong style={{ color: "#e67e22" }}>{text}</strong>)
            }
        },
        {
            title: "Điểm BT",
            dataIndex: "test_point_avg",
            key: "test_point_avg",
            width: 80,
            fixed: 'right',
            render: function col(text: number): JSX.Element {
                return (<strong style={{ color: "#3498db" }}>{text}</strong>)
            }
        },
        {
            title: "Điểm TK",
            dataIndex: "tk",
            key: "tl",
            width: 80,
            fixed: 'right',
            // defaultSortOrder: 'descend',
            // sorted: (a, b) => ((a.total_conduct_point + a.test_point_avg * 3) / 4 - (b.total_conduct_point + b.test_point_avg * 3) / 4),
            render: function col(_: string, record: SummaryStudentType): JSX.Element {
                return (
                    <strong style={{ color: "#27ae60" }}>
                        {record.test_point_avg > 0 ? Math.floor((record.total_conduct_point + record.test_point_avg * 3) / 4 * 100) / 100 : record.total_conduct_point}
                    </strong>
                )
            }
        },

    ])

    return (
        <Layout.Content>
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => history.goBack()}
                title="Chi tiết bảng tổng kết"
                extra={<StudentGiftsModal summaryInfo={summaryInfo} />}
            />
            <div style={{ paddingLeft: 20 }}>
                <Descriptions bordered>
                    <Descriptions.Item label="Lớp"><a>{get(summaryInfo, "class.name", "")}</a></Descriptions.Item>
                    {/* <Descriptions.Item label="Giáo viên">Hangzhou, Zhejiang</Descriptions.Item> */}
                    <Descriptions.Item label="Số học sinh">{get(summaryInfo, "class.students_num", 0)}</Descriptions.Item>
                    <Descriptions.Item span={3} label="Khoảng thời gian">
                        <strong>{moment(get(summaryInfo, "from_date", "")).format("DD/MM/YYYY")} - {moment(get(summaryInfo, "to_date", "")).format("DD/MM/YYYY")}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item span={3} label="Ghi chú">
                        Điểm tổng kết = (điểm trung bình bài tập * 3 + điểm hạnh kiểm) / 4
                    </Descriptions.Item>
                </Descriptions>
                <Title level={4} style={{ marginTop: 20, marginBottom: 20 }}>Bảng tổng kết</Title>
                <Table
                    rowKey="id"
                    loading={getTestsStat === 'loading' || getLessonsStat === 'loading' || getStudentsStat === 'loading'}
                    bordered
                    columns={columns}
                    dataSource={summaryDataList}
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
            render: function StudentCol(_: string, record: StudentGiftType): JSX.Element {
                return (<strong>{get(record, "student.name", "")}</strong>)
            }

        },
        {
            title: "Quà chọn",
            key: "gift",
            dataIndex: "",
            render: function GiftCol(_: string, record: StudentGiftType): JSX.Element {
                return (
                    <Space>
                        <Image width={60} src={get(record, "gift.photo.url", "error")} style={{ marginRight: 10 }} />
                        <span>{get(record, "gift.name", "")}</span>
                    </Space>
                )
            }
        },
        {
            title: "Điểm điều kiện",
            key: "condition_point",
            dataIndex: "",
            render: function StatusCol(_: string, record: StudentGiftType): JSX.Element {
                return (
                    <strong style={{ color: "#109444" }}>{get(record, "gift.condition_point", "")}</strong>
                )
            }

        },
        {
            title: "Trạng thái",
            key: "status",
            dataIndex: "status",
            render: function statusCol(status: number): JSX.Element {
                return (
                    <Tag color={status === 1 ? "green" : "red"}>{status === 1 ? "Đã nhận" : "Chưa nhận"}</Tag>
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