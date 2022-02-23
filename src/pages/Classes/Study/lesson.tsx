import { Button, DatePicker, List, Space, Table, Tooltip, Comment } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { get } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { actionGetAttendances } from "store/attendances/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetLessons } from "store/lesson/slice";
import { ClassType, LessonType } from "interface";
import { STUDY_TABS } from "utils/const";
const { RangePicker } = DatePicker;

export function Lesson(props: { classInfo: ClassType | null }): JSX.Element {
    const { classInfo } = props;
    const history = useHistory();
    const dispatch = useAppDispatch();
    // application states
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsState = useSelector((state: RootState) => state.lessonReducer.getLessonsState);
    const activeTab = useSelector((state: RootState) => state.classReducer.classDetailTabKey);

    useEffect(() => {
        if (classInfo && activeTab === STUDY_TABS.LESSON) {
            dispatch(actionGetLessons({ class_id: classInfo.id }))
        }
    }, [classInfo, activeTab])


    function handleChangeLessonRange(_: any, dateString: string[]) {
        const from_date = dateString[0] || void 0;
        const to_date = dateString[1] || void 0;
        if (classInfo) {
            dispatch(
                actionGetLessons({ class_id: classInfo.id, from_date, to_date })
            );
        }
    }

    const cols: any[] = [
        { title: 'Ngày học', dataIndex: 'date', key: 'name' },
        {
            title: 'Tham gia',
            dataIndex: '',
            key: 'attendanceNum',
            render: function atNum(text:string, record:LessonType):JSX.Element{
                return(
                <span>{get(classInfo,"students_num",0) - record.review_lessons.length}/ {get(classInfo,"students_num",0)}</span>
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
                            <Button type="link" icon={<UnorderedListOutlined onClick={() => history.push(`/study/${get(classInfo, 'id', 0)}/attendance/${record.date}`)} />} />
                        </Tooltip>
                    </Space>
                )
            }
        },
    ]

    return (
        <div>
            <Space>
                <RangePicker
                    style={{ marginTop: 20, marginBottom: 20 }}
                    onChange={handleChangeLessonRange}
                />
            </Space>
            <Table
                rowKey="id"
                loading={getLessonsState === 'loading'}
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
            />

        </div>
    );
}