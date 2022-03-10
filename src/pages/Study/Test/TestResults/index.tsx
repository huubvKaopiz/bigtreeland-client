import React, { useEffect, useState } from 'react';
import { FileType, StudentType, TestResultsType, TestType } from 'interface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/store';
import { actionGetStudents } from 'store/students/slice';
import { Button, Space, Table, Tag, Tooltip, Image } from 'antd';
import { NotificationOutlined, IssuesCloseOutlined } from "@ant-design/icons";
import moment from 'moment';
import { get } from 'lodash';
import { defaul_image_base64, NOTIFI_URIS } from 'utils/const';
import UpdateModal from './updateModal';
import { resetUpdateTestResultsStatus } from 'store/test-results/slice';
import { actionGetTest } from 'store/testes/slice';
import SendNotificationModal from 'components/SendNotificationModal';

export interface TestResultDataType {
    student: StudentType;
    test_result: TestResultsType | undefined;
}

export default function (props: {
    testInfo: TestType | null;
}): JSX.Element {
    const { testInfo } = props;
    const dispatch = useDispatch();
    const [testResultData, setTestResultData] = useState<TestResultDataType[]>([]);
    const [showAddTestCommentModal, setShowAddTestCommentModal] = useState(false);
    const [showSendNotiModal, setShowSendNotiModal] = useState(false);
    const [testResultSelected, setTestResultSelected] = useState<TestResultDataType | null>(null);


    const students = useSelector(
        (state: RootState) => state.studentReducer.students
    );
    const updateTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.updateTestResultStatus
    );
    const addTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.addTestResultStatus
    );

    useEffect(() => {
        if (testInfo) {
            dispatch(actionGetStudents({ class_id: testInfo.class_id }))
        }
    }, [testInfo]);

    useEffect(() => {
        if (testInfo && students) {
            const testRsData: TestResultDataType[] = [];
            students.data?.forEach((st) => {
                const rs = testInfo.test_results.find((el) => el.student_id === st.id)
                testRsData.push({
                    student: st,
                    test_result: rs
                })
            });
            setTestResultData(testRsData);
        }
    }, [students])

    useEffect(() => {
        if (updateTestResultState === "success" || addTestResultState === 'success') {
            setShowAddTestCommentModal(false);
            dispatch(resetUpdateTestResultsStatus());
            if (testInfo) {
                dispatch(actionGetTest(testInfo.id))
            }
        }
    }, [dispatch, updateTestResultState, addTestResultState]);

    const testResultCols: any[] = [
        Table.EXPAND_COLUMN,
        {
            title: 'Name',
            dataIndex: '',
            key: 'name',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <strong>{record.student.name}</strong>
            }
        },
        {
            title: 'Ngày nộp',
            dataIndex: '',
            key: 'date',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <span>{record.test_result ? moment(record.test_result.updated_at).format("DD-MM-YYYY HH:mm") : <Tag color="red">Chưa nộp</Tag>}</span>
            }
        },
        {
            title: 'Điểm',
            dataIndex: '',
            key: 'point',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <strong style={{ color: "#e67e22" }}>{record.test_result ? record.test_result.point : ""}</strong>
            }
        },
        {
            title: 'Nhận xét',
            dataIndex: '',
            key: 'comment',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <span>{record.test_result ? record.test_result.teacher_comment : ""}</span>
            }
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'address',
            render: function actionCol(text: string, record: TestResultDataType): JSX.Element {
                return (
                    <>
                        <Tooltip title='Chấm và chữa bài'>
                            <Button
                                type="link"
                                icon={<IssuesCloseOutlined style={{ color: "#2ecc71" }} />}
                                onClick={() => {
                                    setShowAddTestCommentModal(true);
                                    setTestResultSelected(record);
                                }} />
                        </Tooltip>
                        <Tooltip title="Nhắc nhở nộp bài">
                            <Button
                                type="link"
                                icon={<NotificationOutlined />}
                                disabled={record.test_result !== undefined}
                                onClick={() => {
                                    setShowSendNotiModal(true);
                                    setTestResultSelected(record);
                                }}
                            />
                        </Tooltip>
                    </>
                )
            }
        },
    ];
    return (
        <>
            <Table
                bordered
                rowKey={(record) => record.student.id}
                dataSource={testResultData}
                columns={testResultCols}
                expandable={{
                    expandedRowRender: record =>
                        <div>
                            {
                                record.test_result &&
                                <>
                                    {
                                        record.test_result.correct_link &&
                                        <div style={{ marginBottom: 10 }}>
                                            <h1>Link chữa bài:</h1>
                                            <a href={record.test_result.correct_link}>{record.test_result.correct_link}</a>
                                        </div>
                                    }
                                    {
                                        record.test_result.result_files.length > 0 &&
                                        <>
                                            <h1 style={{ marginBottom: 10 }}>Ảnh bài làm:</h1>
                                            <Space
                                                style={{ backgroundColor: "white" }}
                                                size={[10, 10]}
                                                wrap
                                            >
                                                {get(record, "result_files", []).map(
                                                    (photo: FileType, index: number) => (
                                                        <Image
                                                            key={index}
                                                            width={100}
                                                            height={100}
                                                            style={{ objectFit: "cover" }}
                                                            alt="logo"
                                                            src={photo.url}
                                                            fallback={defaul_image_base64}
                                                        />
                                                    )
                                                )}
                                            </Space>
                                        </>
                                    }
                                    {
                                        record.test_result.correct_files.length > 0 &&
                                        <>
                                            <h1 style={{ marginBottom: 10 }}>Ảnh chữa bài:</h1>
                                            <Space
                                                style={{ backgroundColor: "white" }}
                                                size={[10, 10]}
                                                wrap
                                            >
                                                {get(record, "test_result.correct_files", []).map(
                                                    (photo: FileType, index: number) => (
                                                        <Image
                                                            key={index}
                                                            width={100}
                                                            height={100}
                                                            style={{ objectFit: "cover" }}
                                                            alt="logo"
                                                            src={photo.url}
                                                            fallback={defaul_image_base64}
                                                        />
                                                    )
                                                )}
                                            </Space>
                                        </>
                                    }
                                </>
                            }

                        </div>
                }}
                pagination={{ pageSize: 20 }}
            />
            <UpdateModal
                key="cmt"
                test_id={testInfo && testInfo.id}
                testResultInfo={testResultSelected}
                show={showAddTestCommentModal}
                setShow={setShowAddTestCommentModal}
            />
            <SendNotificationModal
                title="Nhắc nhở nộp bài tập"
                uri={NOTIFI_URIS.SUBMIT_TEST_RESULT_REMIND}
                students={testResultSelected ? new Array(testResultSelected.student) : []}
                show={showSendNotiModal}
                setShow={setShowSendNotiModal}
            />
        </>
    )

}