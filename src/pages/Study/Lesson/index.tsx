import { PlusOutlined, UnorderedListOutlined, IssuesCloseOutlined } from "@ant-design/icons";
import { Button, Comment, DatePicker, List, Space, Table, Tag, Tooltip } from "antd";
import useIsAdmin from "hooks/useIsAdmin";
import usePermissionList from "hooks/usePermissionList";
import { ClassType, LessonType, StudentType } from "interface";
import { get } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetLessons, actionUpdatePeriodTuition } from "store/lesson/slice";
import { RootState, useAppDispatch } from "store/store";
import { STUDY_TABS } from "utils/const";
import { isHavePermission } from "utils/ultil";
import CreateLesson from "./createLesson";

const { RangePicker } = DatePicker;

export function Lesson(props: { classInfo: ClassType | null, students:StudentType[] | [] }): JSX.Element {
    const { classInfo, students } = props;
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [createMode, setCreateMode] = useState(false);
    // application states
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsState = useSelector((state: RootState) => state.lessonReducer.getLessonsState);
    const updateLessonsState = useSelector((state: RootState) => state.lessonReducer.updateLessonState);
    const activeTab = useSelector((state: RootState) => state.classReducer.classDetailTabKey);
    const addAttendanceStatus = useSelector(
        (state: RootState) => state.attendanceReducer.addAttendanceStatus
    );
    
    
	const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();

    useEffect(() => {
        if (classInfo && activeTab === STUDY_TABS.LESSON) {
            dispatch(actionGetLessons({ class_id: classInfo.id }))
        }
    }, [classInfo, activeTab, dispatch])

    useEffect(() => {
        if (addAttendanceStatus === 'success' || updateLessonsState ==='success') {
            setCreateMode(false);
            if (classInfo) dispatch(actionGetLessons({ class_id: classInfo.id }))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addAttendanceStatus, updateLessonsState])


    function handleChangeLessonRange(_: any, dateString: string[]) {
        const from_date = dateString[0] || void 0;
        const to_date = dateString[1] || void 0;
        if (classInfo) {
            dispatch(
                actionGetLessons({ class_id: classInfo.id, from_date, to_date })
            );
        }
    }

    function handleUpdatePeriodTuionFeeForLesson(id:number){
        dispatch(actionUpdatePeriodTuition(id))
    }

    const cols: any[] = [
        {
            title: 'Tên buổi học', dataIndex: 'title', key: 'title',
            render: function col(text: string): JSX.Element {
                return (<a>{text}</a>)
            }
        },
        {
            title: 'Ngày học', dataIndex: 'date', key: 'name',
            render: function col(text: string, record:LessonType): JSX.Element {
                return (
                    <div>
                        <strong>{moment(text).format("DD-MM-YYYY")} </strong>
                        {record.tuition_period_id === 0 && <Tag color="red">Không tính học phí</Tag>}
                    </div>
                )
            }
        },
        {
            title: 'Tham gia',
            dataIndex: '',
            key: 'attendanceNum',
            render: function atNum(text: string, record: LessonType): JSX.Element {
                return (
                    <><span style={{ color: "#d35400" }}>{record.attendances.length}</span><span>/ {get(classInfo, "students_num", 0)}</span></>
                )
            }
        },
        Table.EXPAND_COLUMN,
        {
            title: 'Phản hồi',
            dataIndex: '',
            key: 'lesson_feedbacks',
            render: function col(text: string, record: LessonType): JSX.Element {
                return (
                    <>
                        <strong style={{ color: "#e67e22" }}>{get(record, "lesson_feedback", []).length}</strong> phản hồi
                    </>
                )
            }
        },
        {
            title: 'Actions',
            dataIndex: '',
            key: 'action',
            render: function col(text: string, record: LessonType): JSX.Element {
                return (
                    <Space>
                        <Tooltip title="Chi tiết">
                            <Button type="link" icon={<UnorderedListOutlined onClick={() => history.push(`/study/${get(classInfo, 'id', 0)}/lesson-detail/${record.id}`)} />} />
                        </Tooltip>
                        {
                            record.tuition_period_id === 0 && (isAdmin || isHavePermission(permissionList,"period-tuitions.store")) && 
                            <Tooltip title={"Cập nhật chu kỳ học phí"}>
                                <Button icon={<IssuesCloseOutlined />} type="link" onClick={() => handleUpdatePeriodTuionFeeForLesson(record.id)}/>
                            </Tooltip>
                        }
                    </Space>
                )
            }
        },
    ]

    return (
        <div>
            {
                createMode
                    ?
                    <CreateLesson classInfo={classInfo} setCreateMode={setCreateMode} students={students || []} />
                    :
                    <>
                        <Space>
                            <RangePicker
                                style={{ marginTop: 20, marginBottom: 20 }}
                                onChange={handleChangeLessonRange}
                            />
                            {
                                (isAdmin || isHavePermission(permissionList, "lessons.store")) &&
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateMode(true)}>Buổi học mới</Button>
                                }
                        </Space>
                        <Table
                            rowKey="id"
                            loading={getLessonsState === 'loading' || updateLessonsState === 'loading' }
                            columns={cols}
                            expandable={{
                                expandedRowRender: record =>
                                    <List
                                        className="comment-list"
                                        // header={`${data.length} replies`}
                                        itemLayout="horizontal"
                                        dataSource={record.lesson_feedback}
                                        renderItem={item => (
                                            <li>
                                                <Comment
                                                    author={get(item, "parent.phone", 'No name')}
                                                    avatar={'https://joeschmoe.io/api/v1/random'}
                                                    content={item.feedback}
                                                // datetime={new Date()}
                                                />
                                            </li>
                                        )}
                                    />,
                            }}
                            dataSource={get(lessons, "data", [])}
                            pagination={{
                                defaultPageSize: 10
                            }}
                        />
                    </>
            }

        </div>
    );
}
