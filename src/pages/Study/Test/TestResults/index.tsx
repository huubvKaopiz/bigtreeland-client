import React, { useEffect, useState } from 'react';
import { FileType, StudentType, TestResultsType, TestType } from 'interface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/store';
import ReactPlayer from 'react-player'
import { actionGetStudents } from 'store/students/slice';
import { Button, Space, Table, Tag, Tooltip, Image, Popconfirm } from 'antd';
import { NotificationOutlined, IssuesCloseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import get from 'lodash/get';
import { defaul_image_base64 } from 'utils/const';
import UpdateModal from './updateModal';
import { actionCreateMultiTestResult, resetAddTestResultsStatus, resetUpdateTestResultsStatus } from 'store/test-results/slice';
import { actionGetTest } from 'store/testes/slice';
import SendNotificationModal from 'components/SendNotificationModal';

export interface TestResultDataType {
    student: StudentType;
    test_result: TestResultsType | undefined;
    tranferred: boolean;
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
    const [selectedRows, setSelectedRows] = useState<TestResultDataType[]>([]);
	const [selectedRowKeys, setsSlectedRowKeys] = useState< React.Key[]>([])
    const students = useSelector(
        (state: RootState) => state.studentReducer.students
    );
    const updateTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.updateTestResultStatus
    );
    const addTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.addTestResultStatus
    );

    const createMultiState = useSelector(
        (state: RootState) => state.testResultsReducer.createMultipleStatus
    );

    // get the testinfo following the test_id
    useEffect(() => {
        if (testInfo) {
            dispatch(actionGetStudents({ class_id: testInfo.class_id, per_page:50 }))
        }
    }, [testInfo, dispatch]);

    useEffect(() => {
        if (testInfo && students) {
            const testRsData: TestResultDataType[] = [];
            const mapped: number[] = []
            // check if the student has submited or not
            students.data?.forEach((st) => {
                const rs = testInfo.test_results.find((rs_el) => rs_el.student_id === st.id)
                if (rs) mapped.push(rs.id);
                testRsData.push({
                    student: st,
                    test_result: rs,
                    tranferred: false
                })
            });
            // in case of student is tranfered to a different class
            if (mapped.length < testInfo.test_results.length) {
                testInfo.test_results.forEach((ts_el) => {
                    const ts = mapped.find((mapped_el) => mapped_el === ts_el.id)
                    if (ts === undefined) testRsData.push({
                        student: ts_el.student,
                        test_result: ts_el,
                        tranferred: true
                    })
                })
            }
            setTestResultData(testRsData);
        }
    }, [students])

    // When the updatting is complete, reload the data.
    useEffect(() => {
        if (updateTestResultState === "success" || addTestResultState === 'success' || createMultiState === "success") {
            setShowAddTestCommentModal(false);
            dispatch(resetUpdateTestResultsStatus());
            dispatch(resetAddTestResultsStatus());
            setSelectedRows([]);
			setsSlectedRowKeys([]);
            if (testInfo) {
                dispatch(actionGetTest(testInfo.id))
            }
        }
    }, [dispatch, updateTestResultState, addTestResultState, testInfo,createMultiState]);

    const handleMultipleConfirmed = () => {
        if(!testInfo) return;
        const student_ids = selectedRows?.map((row) => row?.student?.id)
        if(student_ids?.length === 0)return;
        dispatch(actionCreateMultiTestResult({test_id:testInfo.id, student_ids}))
    }

    const testResultCols: any[] = [
        Table.SELECTION_COLUMN,
        Table.EXPAND_COLUMN,
        {
            title: 'Name',
            dataIndex: '',
            key: 'name',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <>
                    <strong>{record.student.name}</strong>
                    {record.tranferred && <span style={{ fontStyle: 'italic', color: "#95a5a6" }}> (đã chuyển lớp)</span>}
                </>
            }
        },
        {
            title: 'Nộp bài',
            dataIndex: '',
            key: 'date',
            render: function nameCol(_: string, record: TestResultDataType): JSX.Element {
                return <span>{record.test_result ? <Tag color="green">Đã nộp</Tag> : <Tag color="red">Chưa nộp</Tag>}</span>
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
        	{selectedRows.length > 0 &&
						<Space style={{ marginBottom: 20 }}>
                            <Popconfirm placement="topLeft" title={"Xác nhận đã nộp cho học sinh?"} onConfirm={handleMultipleConfirmed} okText="Yes" cancelText="No">
							<Button type="primary" icon={<CheckCircleOutlined />} loading={createMultiState === "loading"}>
								Xác nhận đã nộp
							</Button>
                            </Popconfirm>
							<span style={{ marginLeft: 8 }}>
								{selectedRows.length > 0 ? `${selectedRows.length} đã chọn` : ''}
							</span>
						</Space>
					}
            <Table
                bordered
                rowKey={(record) => record.student.id}
                dataSource={testResultData}
                columns={testResultCols}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (selectedRowKeys: React.Key[], selectedRows: TestResultDataType[]) => {
                        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        setSelectedRows(selectedRows);
                        setsSlectedRowKeys(selectedRowKeys);
                    },
                    getCheckboxProps: (record: TestResultDataType) => ({
                        disabled: record.test_result !== undefined, // Column configuration not to be checked
                    }),
                }}
                expandable={{
                    expandedRowRender: record => <TestResultExpand record={record}/>
                       
                }}
                pagination={{ pageSize: 40 }}
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
                students={testResultSelected ? new Array(testResultSelected.student) : []}
                show={showSendNotiModal}
                setShow={setShowSendNotiModal}
            />
        </>
    )

}

const TestResultExpand = (props:{record:TestResultDataType}) => {
    const {record} = props;
    return (
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
                        <h1 style={{ marginBottom: 10 }}>Files bài làm:</h1>
                        <Space 
                            size={[10, 10]}
                            wrap
                        >
                            {get(record, "test_result.result_files", []).map(
                                (file: FileType, index: number) =>
                                    <div key={index}>
                                        {
                                            file.type === "mp4" || file.type === "mov"
                                                ?
                                                <ReactPlayer 
                                                        loop={true}
                                                        style={{width:200, height:'auto'}} 
                                                        url={file.url}
                                                        controls={true} 
                                                    />
                                                :
                                                <Image
                                                    width={150}
                                                    height={150}
                                                    style={{ objectFit: "cover" }}
                                                    alt="logo"
                                                    src={file.url}
                                                    fallback={defaul_image_base64}
                                                />
                                        }
                                    </div>

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
    )
}