import { Button, Descriptions, Input, Layout, List, Space, Table, Tag, Tooltip } from 'antd';
import { PlusOutlined, ProfileOutlined, EditOutlined, FileDoneOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionDeleteSalary, actionGetSalaries, actionSetDeleteSalaryStateIdle } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import { useHistory } from 'react-router-dom';
import numeral from 'numeral';
import { SalaryType } from 'interface';
import Modal from 'antd/lib/modal/Modal';
import moment from 'moment';
import { actionGetRevenues } from 'store/revenues/slice';
import { actionGetLessons } from 'store/lesson/slice';

export default function Salaries(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const salaries = useSelector((state: RootState) => state.salariesReducer.salaries);
    const getSalariesState = useSelector((state: RootState) => state.salariesReducer.getSalaries);

    useEffect(() => {
        dispatch(actionGetSalaries())
    }, [dispatch])

    const columns = [
        {
            title: "Họ tên",
            dataIndex: "user",
            key: "name",
            render: function nameCol(val: { id: number, name: string, phone: string }): JSX.Element {
                return (
                    <strong>{val.name}</strong>
                )
            }
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "date"
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: function fineCol(val: number): JSX.Element {
                return (
                    <span style={{ color: "#c0392b" }}>{val}</span>
                )
            }
        },
        {
            title: "Tổng",
            dataIndex: "amount",
            key: "amount",
            render: function fineCol(val: string, record: SalaryType): JSX.Element {
                return (
                    <strong style={{ color: "#2980b9" }}>{numeral(parseFloat(record.basic_salary) + parseFloat(record.bonus) + parseFloat(record.revenue_salary) - parseFloat(record.fines)).format("0,0")}</strong>
                )
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: function fineCol(val: number): JSX.Element {
                return (
                    <span style={{ color: "#c0392b" }}>{val}</span>
                )
            }
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: function actionsCol(val: string, record: SalaryType) {
                return (
                    <>
                        <DetailSalary salaryInfo={record} />
                        <Tooltip title="Sửa bảng lương"> <Button disabled={Number(record.status) === 1 ? true : false} type="link" icon={<EditOutlined />} onClick={() => history.push(`/salaries-edit/${record.id}`)} /></Tooltip>
                        <PaymentConfirmModal salaryInfo={record} />
                        {
                            record.status === 0 ? <DeleyteConfirmModal salaryInfo={record} /> : ""
                        }
                    </>
                )
            }
        }
    ]

    return (
        <Layout.Content>
            <Space style={{ marginBottom: 30 }}>
                <Input.Search />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push("/salaries-create")}>Lập bảng lương</Button>
            </Space>
            <Table dataSource={get(salaries, "data", [])} columns={columns} loading={getSalariesState == "loading" ? true : false} />
        </Layout.Content>
    )
}

function PaymentConfirmModal(props: { salaryInfo: SalaryType }): JSX.Element {
    const { salaryInfo } = props;
    const [show, setShow] = useState(false)

    function handlSubmit() {
        console.log('submit')
    }
    return (
        <>
            <Tooltip title="Đã thanh toán">
                <Button disabled={Number(salaryInfo.status) === 1 ? true : false} type="link" icon={<FileDoneOutlined />} onClick={() => setShow(true)} />
            </Tooltip>
            <Modal
                title={<p><InfoCircleOutlined style={{ color: "#d35400" }} /> Xác nhận đã thanh toán</p>}
                visible={show}
                onOk={handlSubmit}
                onCancel={() => setShow(false)}
                okText="OK"
                cancelText="Huỷ bỏ"
            >
                <p>Lưu ý khi đã xác nhận thanh toán thì không thể sửa được bảng lương.</p>
            </Modal>
        </>

    )
}

function DeleyteConfirmModal(props: { salaryInfo: SalaryType }): JSX.Element {
    const { salaryInfo } = props;
    const [show, setShow] = useState(false)
    const dispatch = useAppDispatch();
    const deleteSalaryStatus = useSelector((state: RootState) => state.salariesReducer.deleteSalaryStatus);

    useEffect(() => {
        if (deleteSalaryStatus === 'success') {
            setShow(false)
            dispatch(actionSetDeleteSalaryStateIdle());
            dispatch(actionGetSalaries());
        }
    }, [deleteSalaryStatus, dispatch])

    function handlSubmit() {
        console.log('submit')
        dispatch(actionDeleteSalary(salaryInfo.id));
    }
    return (
        <>
            <Tooltip title="Xoá bảng lương">
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setShow(true)} loading={deleteSalaryStatus === "loading" ? true : false} />
            </Tooltip>
            <Modal
                title={<p><InfoCircleOutlined style={{ color: "#d35400" }} /> Xác nhận xoá bảng lương</p>}
                visible={show}
                onOk={handlSubmit}
                onCancel={() => setShow(false)}
                okText="OK"
                cancelText="Huỷ bỏ"
            >
                <p>Thông tin bảng lương sẽ bị xoá khỏi hệ thống và không thể phục hồi!</p>
            </Modal>
        </>

    )
}

function DetailSalary(props: { salaryInfo: SalaryType }): JSX.Element {
    const { salaryInfo } = props;
    const [show, setShow] = useState(false)
    const [amount, setMount] = useState(0);
    const dispatch = useAppDispatch();

    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const getReceiptStatus = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsStatus = useSelector((state: RootState) => state.lessonReducer.getLessonsState);

    useEffect(() => {
        if (show == true) {
            if (salaryInfo.status === 0 || salaryInfo.type == null) {
                console.log(salaryInfo.user.name)
                dispatch(actionGetRevenues(
                    {
                        employee_id: salaryInfo.employee_id,
                        fromDate: moment(salaryInfo.from_date).format("YYYY-MM-DD"),
                        toDate: moment(salaryInfo.to_date).format("YYYY-MM-DD"),
                    }))
                setMount(parseFloat(salaryInfo.basic_salary) + parseFloat(salaryInfo.revenue_salary) + parseFloat(salaryInfo.bonus) - parseFloat(salaryInfo.fines))
            } else if (salaryInfo.type === 1) {
                dispatch(actionGetLessons(
                    {
                        employee_id: salaryInfo.employee_id,
                        from_date: moment(salaryInfo.from_date).format("YYYY-MM-DD"),
                        to_date: moment(salaryInfo.to_date).format("YYYY-MM-DD"),
                    }))
                setMount(parseFloat(salaryInfo.revenue_salary) + parseFloat(salaryInfo.bonus) - parseFloat(salaryInfo.fines))
            }
        }
    }, [salaryInfo, dispatch, show])

    return (
        <>
            <Tooltip title="Xem chi tiết"> <Button onClick={() => setShow(true)} type="link" icon={<ProfileOutlined />} /></Tooltip>
            <Modal
                visible={show}
                onCancel={() => setShow(false)}
                width={1000}
                okText="In bảng lương"
            >
                <Descriptions
                    title="Chi tiết bảng lương"
                    bordered
                    column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
                    style={{marginBottom:20}}
                >
                    <Descriptions.Item span={3} label="Nhân viên"><strong>{salaryInfo.user.name}</strong></Descriptions.Item>
                    <Descriptions.Item span={2} label="Ngày tạo">{moment(salaryInfo.created_at).format("YYYY-MM-DD")}</Descriptions.Item>
                    <Descriptions.Item span={2} label="Chu kỳ">{moment(salaryInfo.from_date).format("YYYY-MM-DD")} - {moment(salaryInfo.to_date).format("YYYY-MM-DD")} </Descriptions.Item>
                    <Descriptions.Item label="Cơ bản"><strong>{numeral(salaryInfo.basic_salary).format("0,0")}</strong></Descriptions.Item>
                    <Descriptions.Item label="Doanh thu"><strong>{numeral(salaryInfo.revenue_salary).format("0,0")}</strong></Descriptions.Item>
                    <Descriptions.Item label="Thưởng"><strong>{numeral(salaryInfo.bonus).format("0,0")}</strong></Descriptions.Item>
                    <Descriptions.Item label="Phạt"><strong>{numeral(salaryInfo.fines).format("0,0")}</strong></Descriptions.Item>
                    <Descriptions.Item span={3} label="Tổng"><strong style={{ color: "#2980b9" }}>{numeral(amount).format("0,0")}</strong></Descriptions.Item>
                    <Descriptions.Item span={3} label="Trạng thái"><strong>{salaryInfo.status === 0 ?   <Tag color="volcano">Chưa thanh toán</Tag> : <Tag color="green">Đã thanh toán</Tag>}</strong></Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                        {salaryInfo.note}
                    </Descriptions.Item>
                </Descriptions>

                {
                    salaryInfo.type == null ?
                        <List
                            rowKey="id"
                            itemLayout="horizontal"
                            header={<div style={{ justifyContent: "space-between", display: "flex" }}><div>Chi tiết doanh thu</div><div>{numeral(0).format("0,0")}</div></div>}
                            loading={getReceiptStatus === "loading" ? true : false}
                            dataSource={get(receipts, "data", [])}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a href="#">{item.created_at}</a>}
                                        description={item.note}
                                    />
                                    <div style={{ color: "#2980b9" }}>{numeral(item.amount).format("0,0")}</div>
                                </List.Item>
                            )}
                        /> :
                        <List rowKey="id"
                            itemLayout="horizontal"
                            header={<div style={{ justifyContent: "end", display: "flex", fontWeight: 600 }}>{numeral(0).format("0,0")}</div>}
                            loading={getLessonsStatus === "loading" ? true : false}
                            dataSource={get(lessons, "data", [])}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a href="#">{item.tuition_period_id}</a>}
                                        description={item.tuition_period_id}
                                    />
                                    <div style={{ color: "#2980b9" }}>{item.date}</div>

                                </List.Item>
                            )} />
                }
            </Modal>
        </>
    )
}
