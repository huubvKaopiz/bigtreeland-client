import { Button, Space, Table, Modal, Tooltip, notification } from 'antd';
import { MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { StudentType } from 'interface';
import moment from 'moment';
import AddStudentsModal from 'pages/Classes/addStudentsModal';
import React, { useState } from 'react';
import { actionLeaveClass } from 'store/students/slice';
import { useAppDispatch } from 'store/store';
import { actionGetClass } from 'store/classes/slice';
import { get } from 'lodash';
import { useHistory } from 'react-router-dom';
const { confirm } = Modal;

export default function (props: {
    students: StudentType[];
    class_id: number | null;
}): JSX.Element {
    const { students, class_id } = props;
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    
    function handleRemoveStudent(id: number) {
        if (id > 0 && class_id) {
            confirm({
                title: "Bạn muốn xoá học sinh này ra khỏi lớp!",
                icon: <ExclamationCircleOutlined />,
                cancelText: "Huỷ bỏ",
                onOk() {
                    setLoading(true);
                    dispatch(
                        actionLeaveClass({
                            data: {
                                class_id: 0,
                            },
                            sID: id,
                        })
                    ).then((res) => {
                        if (res.meta.requestStatus === "fulfilled") {
                            notification.success({ message: "Thành công" });
                            dispatch(actionGetClass({ class_id, params: { students: true, active_periodinfo: false } }));
                            return;
                        }
                        notification.error({ message: "Thất bại" });
                    })
                    .finally(() => {
                        setLoading(false);
                    });
                }
            })
        }
    }

    const cols = [
        {
            title: "Họ tên",
            dataIndex: "name",
            key: "name",
            render: function col(val: string, record:StudentType): JSX.Element {
                return (<Button type="link" onClick={()=>history.push(`/students-study-profile/${record.id}`)} >{val}</Button>)
            }
        },
        {
            title: "Ngày sinh",
            dataIndex: "birthday",
            key: "birthday",
            render: function col(val: string): JSX.Element {
                return (<span>{moment(val).format("DD-MM-YYYY")}</span>)
            }
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            render: function col(val: number): JSX.Element {
                return (<span>{val === 0 ? 'Nữ' : 'Nam'}</span>)
            }
        },
        {
            title: "Ngày nhập học",
            dataIndex: "admission_date",
            key: "admission_date",
            render: function col(val: string): JSX.Element {
                return (<span>{moment(val).format("DD-MM-YYYY")}</span>)
            }
        },
        {
            title: "ĐT liên hệ",
            dataIndex: "parent",
            key: "phone",
            render: function col(_: string, record:StudentType): JSX.Element {
            return (<span style={{color:"#2980b9"}}>{get(record,"parent.phone","")}</span>)
            }
        },
        {
            title: "",
            dataIndex: "acrion",
            key: "action",
            render: function col(_: string, record: StudentType): JSX.Element {
                return (
                    <Space>
                        <Tooltip title="Xoá khỏi lớp">
                        <Button type="link" danger icon={<MinusCircleOutlined />} onClick={() => handleRemoveStudent(record.id)} />
                        </Tooltip>
                    </Space>
                )
            }
        },

    ]
    return (
        <div>
            <AddStudentsModal class_id={`${class_id}`} />
            <Table
            bordered
                style={{ marginTop: 20 }}
                columns={cols}
                dataSource={students}
                pagination={{
                    pageSize: 30
                }}
            />
        </div>
    )
}
