import { Button, DatePicker, Descriptions, Layout, PageHeader, Spin, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudentProfile, actionUpdateStudentClassHistory } from 'store/students/slice';
import usePermissionList from 'hooks/usePermissionList';
import useIsAdmin from 'hooks/useIsAdmin';
import { isHavePermission } from 'utils/ultil';

export function StudyProfile(): JSX.Element {
    const params = useParams() as { student_id: string };
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [editClassHistoryDateIndex, setEditClassHistoryDateIndex] = useState<number>(-1);
    const [editClassHistoryDate, setEditClassHistoryDate] = useState(moment(new Date).format("YYYY-MM-DD"));
    const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();

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
                    title="H??? s?? h???c sinh"
                // subTitle="This is a subtitle"
                >
                    <Descriptions bordered>
                        <Descriptions.Item label="H??? v?? t??n"><strong>{get(studentProfile, "name", "")}</strong></Descriptions.Item>
                        <Descriptions.Item label="Ng??y sinh">{moment(get(studentProfile, "birthday", "")).format("DD/MM/YYYY")}</Descriptions.Item>
                        <Descriptions.Item label="Gi???i t??nh">{get(studentProfile, "gender", 0) === 0 ? "N???" : "Nam"}</Descriptions.Item>
                        <Descriptions.Item label="L???p h???c"><a onClick={() => history.push(`/study/${get(studentProfile, "class.id", 0)}`)}>{get(studentProfile, "class.name", "")}</a></Descriptions.Item>
                        <Descriptions.Item label="??i???m ?????u v??o">{get(studentProfile, "knowledge_status", "")}</Descriptions.Item>
                        <Descriptions.Item label="Tr?????ng ??ang h???c" span={3}>{get(studentProfile, "school", "")}</Descriptions.Item>
                        <Descriptions.Item label="?????a ch???" span={3}>{get(studentProfile, "address", "")}</Descriptions.Item>
                        <Descriptions.Item label="S??? th??ch" span={3}>{get(studentProfile, "interests", "")}</Descriptions.Item>
                        <Descriptions.Item label="S??? gh??t" span={3}>{get(studentProfile, "dislikes", "")}</Descriptions.Item>
                        <Descriptions.Item label="?????c m??" span={3}>{get(studentProfile, "personality", "")}</Descriptions.Item>
                        <Descriptions.Item label="Ph??? huynh" span={3}><a>{get(studentProfile, "parent.profile.name", "")}</a> - {get(studentProfile, "parent.phone", "")} </Descriptions.Item>
                        <Descriptions.Item label="L???ch s??? nh???p h???c" span={3}>
                            <div>
                                {
                                    get(studentProfile, "class_histories", []).map((history, index) => (
                                        <>
                                            {
                                                history.class_id > 0 ?
                                                    <div style={{ marginBottom: 10 }} key={index}>
                                                        Nh???p l???p <strong>{get(history, "class.name", "")} </strong>
                                                        ng??y {' '}
                                                        {
                                                            editClassHistoryDateIndex !== index
                                                                ?
                                                                <>
                                                                    <span style={{ color: "#2980b9" }}>{moment(history.date).format("DD-MM-YYYY")}</span>
                                                                    {
                                                                        (isAdmin || isHavePermission(permissionList, "class-histories.update")) &&
                                                                        <Button icon={<EditOutlined />} type="link" onClick={() => {
                                                                            setEditClassHistoryDateIndex(index);
                                                                            setEditClassHistoryDate(history.date);
                                                                        }} />
                                                                    }
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
                                                                        L??u l???i
                                                                    </Button>
                                                                    <Button
                                                                        style={{ marginLeft: 10 }} type="primary" danger
                                                                        onClick={() => {
                                                                            setEditClassHistoryDateIndex(-1);
                                                                        }}
                                                                    >
                                                                        Hu??? b???
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