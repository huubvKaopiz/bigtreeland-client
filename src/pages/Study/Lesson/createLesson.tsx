import {
    CloseOutlined, NotificationOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Input, notification, Row, Space, Table, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import TextArea from 'antd/lib/input/TextArea';
import SendNotificationModal from 'components/SendNotificationModal';
import { ClassType, StudentType } from 'interface';
import { get } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { actionAddAttendance, AttendanceStudentComment } from 'store/attendances/slice';
import { RootState, useAppDispatch } from 'store/store';

const dateFormat = "DD-MM-YYYY";

export default function CreateLesson(props: {
    classInfo: ClassType | null,
    students: StudentType[],
    setCreateMode: (param: boolean) => void;
}): JSX.Element {
    const { classInfo, students, setCreateMode } = props;
    const dispatch = useAppDispatch();
    const [listComments, setListComments] = useState<AttendanceStudentComment[]>([]);
    const [today, setToday] = useState(moment(new Date()).format(dateFormat));
    const [lessonName, setLessonName] = useState("");
    const [attendantList, setAttendantList] = useState<number[]>([]);
    const [checkAll, setCheckAll] = useState(false);
    const [showNotiForm, setShowNotiForm] = useState(false);
    const [notiIndex, setNotiIndex] = useState(-1);
    const [hasAssistant, setHasAssistant] = useState(false);

    const userInfo = useSelector(
        (state: RootState) => state.auth.user
    );

    const addAttendanceStatus = useSelector(
        (state: RootState) => state.attendanceReducer.addAttendanceStatus
    );

    function handleCheckAll(e: CheckboxChangeEvent) {
        setAttendantList([0]);
        const newList: number[] = [];
        if (e.target.checked) {
            students.map((el) => {
                newList.push(el.id);
            });
        }
        setCheckAll(e.target.checked);
        setAttendantList(newList);
    }

    function isAttendantToday(sID: number) {
        const found = attendantList.find((element: number) => element === sID);
        if (found !== undefined) return true;
        else return false;
    }

    function handleCheckbox(sID: number) {
        const found = attendantList.indexOf(sID);
        if (found === -1) {
            attendantList.push(sID);
        } else {
            attendantList.splice(found, 1);
        }
        setCheckAll((students.length) === attendantList.length);
        setAttendantList([...attendantList]);
    }

    function handleChangeComment(comment: string, id: number) {
        const f = listComments.findIndex((element) => element.id === `${id}`);
        if (f >= 0) {
            listComments[f].comment = comment;
        } else {
            listComments.push({
                id: `${id}`,
                comment: comment,
                conduct_point: "",
                reminder: "",
            });
        }
    }

    function handleChangeCoductPoint(
        e: React.ChangeEvent<HTMLInputElement>,
        id: number
    ) {
        const finder = listComments.find((p) => p.id === `${id}`);
        if (finder) finder.conduct_point = e.target.value;
        else
            listComments.push({
                id: `${id}`,
                comment: "",
                conduct_point: parseFloat(e.target.value).toString(),
                reminder: "",
            });
    }

    function handleChangeReminder(reminder: string, id: number) {
        const finder = listComments.find((p) => p.id === `${id}`);
        if (finder) finder.reminder = reminder;
        else
            listComments.push({
                id: `${id}`,
                comment: "",
                conduct_point: "",
                reminder,
            });
    }

    function handleNotityToParent(index: number) {
        //Todo
        setNotiIndex(index);
        setShowNotiForm(true);
    }

    function handleSubmit() {
        if (!classInfo) return;
        const teacher_id = get(classInfo, "employee_id", null);
        if (!teacher_id) {
            notification.warn({ message: "Chưa có thông tin giáo viên!" });
        } else if (attendantList.length > 0) {
            const studentAttendanceList: AttendanceStudentComment[] = [];
            attendantList.forEach((at) => {
                const student = listComments.find((p) => +p.id === at);
                if (student) studentAttendanceList.push(student);
                else
                    studentAttendanceList.push({
                        id: `${at}`,
                        comment: "",
                        conduct_point: "",
                        reminder: "",
                    });
            });
            const payload = {
                class_id: classInfo.id,
                lesson_title: lessonName,
                teacher_id: teacher_id,
                assistant_id: hasAssistant ? classInfo.assistant_id : null,
                students: studentAttendanceList,
                date: moment(today, "DD-MM-YYYY").format("YYYY-MM-DD"),
            };
            dispatch(actionAddAttendance(payload));
        } else {
            notification.warn({ message: "Danh sách điểm danh trống" });
        }
    }
    const attendance_columns: any[] = [
        {
            title: "Họ tên",
            dataIndex: "name",
            key: "name",
            with: 100,
            fixed: 'left',
            render: function col(value: string, record: StudentType): JSX.Element {
                return <Tooltip title={`Ngày sinh: ${moment(record.birthday).format("DD-MM-YYYY")}`}><strong>{value}</strong></Tooltip>;
            },
        },
        {
            title: (
                <div style={{ textAlign: "center" }}>
                    <Tooltip title="Điểm danh"> <Checkbox onChange={handleCheckAll} checked={checkAll} /></Tooltip>
                </div>
            ),
            key: "operation",
            dataIndex: "",
            width: 10,
            render: function col(st: { id: number }): JSX.Element {
                return (
                    <div style={{ textAlign: "center" }}>
                        <Checkbox
                            onChange={() => handleCheckbox(st.id)}
                            checked={isAttendantToday(st.id)}
                        />
                    </div>
                );
            },
        },
        {
            title: "Hạnh kiểm",
            key: "point",
            dataIndex: "",
            width: 100,
            render: function col(st: { id: number }): JSX.Element {
                return (
                    <Input
                        className="_input_"
                        style={{ width: "100%" }}
                        type="number"
                        step={0.1}
                        placeholder="0.0"
                        onChange={(e) => handleChangeCoductPoint(e, st.id)}
                    />
                );
            },
        },
        {
            title: "Nhận xét",
            key: "comment",
            dataIndex: "",
            render: function col(st: { id: number }): JSX.Element {
                return (
                    <TextArea
                        className="_input_"
                        style={{ width: "100%" }}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        placeholder="Nhận xét"
                        onChange={({ target: { value } }) =>
                            handleChangeComment(value, st.id)
                        }
                    />
                );
            },
        },
        {
            title: "Nhắc nhở",
            key: "reminder",
            dataIndex: "",
            render: function col(st: { id: number }): JSX.Element {
                return (
                    <TextArea
                        className="_input_"
                        style={{ width: "100%" }}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        placeholder="Lời nhắc nhở"
                        onChange={({ target: { value } }) =>
                            handleChangeReminder(value, st.id)
                        }
                    />
                );
            },
        },
        {
            title: "",
            key: "action",
            dataIndex: "",
            width: 80,
            render: function col(_: string, record: { id: number }, index: number): JSX.Element {
                return (
                    <Space>

                        <Tooltip title="Nhắc nhở vào học">
                            <Button
                                icon={<NotificationOutlined />}
                                type="link"
                                onClick={() => handleNotityToParent(index)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];
    return (
        <div key={1}>
            <Space style={{ paddingTop: 20, marginBottom: 20 }}>
                <span>Ngày học:</span>
                <DatePicker
                    disabledDate={(current) =>
                        current && current > moment().endOf("day")
                    }
                    defaultValue={moment(new Date(), dateFormat)}
                    format={dateFormat}
                    onChange={(e) => setToday(moment(e).format("DD/MM/YYYY"))}
                />
                <span>Tên buổi học:</span>
                <Input
                    style={{ width: 460 }}
                    placeholder="Nhập tên buổi học"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                />
                <Tooltip title={classInfo?.assistant_id === null ? "Lớp này chưa có trợ giảng" : "Điểm danh cho trợ giảng"}>
                    <Checkbox
                        checked={hasAssistant}
                        disabled={classInfo?.assistant_id === null}
                        onChange={(e) => setHasAssistant(e.target.checked)}
                    >
                        <span style={{ color: "#2980b9" }}>Có trợ giảng</span>
                    </Checkbox>
                </Tooltip>
                <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSubmit()} loading={addAttendanceStatus === "loading"}>
                    Lưu lại
                </Button>
                <Button type="primary" danger icon={<CloseOutlined />} onClick={() => setCreateMode(false)}>Huỷ bỏ</Button>
            </Space>

            <Row>
                <Col span={24}>
                    <Table
                        dataSource={students}
                        columns={attendance_columns}
                        bordered
                        rowKey="id"
                        size="small"
                        pagination={{
                            pageSize:50
                        }}
                        
                        
                    />
                </Col>
            </Row>
            <SendNotificationModal
                title="Nhắc nhở vào học"
                show={showNotiForm}
                setShow={setShowNotiForm}
                students={notiIndex !== -1 ? new Array(students[notiIndex]) : []}
            />
        </div>
    )
}