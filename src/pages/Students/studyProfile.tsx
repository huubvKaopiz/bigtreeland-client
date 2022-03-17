import { Button, DatePicker, Descriptions, Layout, PageHeader, Spin, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudentProfile, actionUpdateStudentClassHistory } from 'store/students/slice';

export function StudyProfile(): JSX.Element {
    const params = useParams() as { student_id: string };
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [editClassHistoryDateIndex, setEditClassHistoryDateIndex] = useState<number>(-1);
    const [editClassHistoryDate, setEditClassHistoryDate] = useState(moment(new Date).format("YYYY-MM-DD"));

    const studentProfile = useSelector((state: RootState) => state.studentReducer.studentProfile);
    const getStudentProfileState = useSelector((state: RootState) => state.studentReducer.getStudentStatus);

    const updateClassHistoryState = useSelector((state: RootState) => state.studentReducer.updateStudentClasHistoryStatus);


    useEffect(() => {
        dispatch(actionGetStudentProfile(+params.student_id));
    }, [params])

    useEffect(() => {
        if (updateClassHistoryState === 'success') {
            setEditClassHistoryDateIndex(-1)
            dispatch(actionGetStudentProfile(+params.student_id));
        }
    }, [updateClassHistoryState])


    function handleUpdateClassHistory() {
        if (editClassHistoryDate && editClassHistoryDateIndex > -1) {
            const chId = get(studentProfile, "class_histories", [])[editClassHistoryDateIndex].id;
            if (chId) {
                dispatch(actionUpdateStudentClassHistory({ chId, date:editClassHistoryDate }));

            }
        }
    }

    return (
        <Layout.Content>
            <Spin spinning={getStudentProfileState === "loading"}>
                <PageHeader
                    className="site-page-header"
                    onBack={() => history.goBack()}
                    title="Hồ sơ học sinh"
                // subTitle="This is a subtitle"
                >
                    <Descriptions bordered>
                        <Descriptions.Item label="Họ và tên"><strong>{get(studentProfile, "name", "")}</strong></Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{moment(get(studentProfile, "birthday", "")).format("DD/MM/YYYY")}</Descriptions.Item>
                        <Descriptions.Item label="Giới tính">{get(studentProfile, "gender", 0) === 0 ? "Nữ" : "Nam"}</Descriptions.Item>
                        <Descriptions.Item label="Lớp học"><a onClick={() => history.push(`/classes-detail/${get(studentProfile, "class.id", 0)}`)}>{get(studentProfile, "class.name", "")}</a></Descriptions.Item>
                        <Descriptions.Item label="Điểm đầu vào">{get(studentProfile, "knowledge_status", "")}</Descriptions.Item>
                        <Descriptions.Item label="Trường đang học" span={3}>{get(studentProfile, "school", "")}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={3}>{get(studentProfile, "address", "")}</Descriptions.Item>
                        <Descriptions.Item label="Sở thích" span={3}>{get(studentProfile, "interests", "")}</Descriptions.Item>
                        <Descriptions.Item label="Sở ghét" span={3}>{get(studentProfile, "dislikes", "")}</Descriptions.Item>
                        <Descriptions.Item label="Ước mơ" span={3}>{get(studentProfile, "personality", "")}</Descriptions.Item>
                        <Descriptions.Item label="Phụ huynh" span={3}><a>{get(studentProfile, "parent.profile.name", "")}</a> - {get(studentProfile, "parent.phone", "")} </Descriptions.Item>
                        <Descriptions.Item label="Lịch sử nhập học" span={3}>
                            <div>
                                {
                                    get(studentProfile, "class_histories", []).map((history, index) => (
                                        <>
                                            {
                                                history.class_id > 0 ?
                                                    <div style={{ marginBottom: 10 }} key={index}>
                                                        Nhập lớp <strong>{get(history, "class.name", "")} </strong>
                                                        ngày {' '}
                                                        {
                                                            editClassHistoryDateIndex !== index
                                                                ?
                                                                <>
                                                                    <span style={{ color: "#2980b9" }}>{moment(history.date).format("DD-MM-YYYY")}</span>
                                                                    <Button icon={<EditOutlined />} type="link" onClick={() => {
                                                                        setEditClassHistoryDateIndex(index);
                                                                        setEditClassHistoryDate(history.date);
                                                                    }} />
                                                                </>
                                                                :
                                                                <>
                                                                    <DatePicker
                                                                        clearIcon={false}
                                                                        format="YYYY-MM-DD"
                                                                        style={{ marginLeft: 10 }}
                                                                        defaultValue={moment(editClassHistoryDate)}
                                                                        onChange={(date, dateString) => setEditClassHistoryDate(moment(dateString).format("YYYY-MM-DD"))} />
                                                                    <Button
                                                                        style={{ marginLeft: 10 }} type="primary"
                                                                        onClick={() => handleUpdateClassHistory()}
                                                                        loading={editClassHistoryDateIndex === index && updateClassHistoryState === 'loading'}>
                                                                        Lưu lại
                                                                    </Button>
                                                                    <Button
                                                                        style={{ marginLeft: 10 }} type="primary" danger
                                                                        onClick={() => {
                                                                            setEditClassHistoryDateIndex(-1);
                                                                        }}
                                                                    >
                                                                        Huỷ bỏ
                                                                    </Button>
                                                                </>

                                                        }
                                                    </div>
                                                    : <div key={index}></div>
                                            }
                                        </>
                                    ))
                                }
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </PageHeader>
            </Spin>
        </Layout.Content>
    )
}