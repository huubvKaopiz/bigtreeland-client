import { Button, Descriptions, Input, Layout, List, Space, Table, Tag, Tooltip, Modal, Collapse, InputNumber } from 'antd';
import { PlusOutlined, ProfileOutlined, DollarCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionDeleteSalary, actionGetSalaries, actionSalaryPaymentConfirmed, actionUpdateSalary } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import { useHistory } from 'react-router-dom';
import numeral from 'numeral';
import { SalaryType } from 'interface';
import moment from 'moment';
import { actionGetRevenues } from 'store/revenues/slice';
import { actionGetLessons } from 'store/lesson/slice';

const { confirm } = Modal;
const { Panel } = Collapse;
export default function Salaries(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [showDetail, setShowDetail] = useState(false);
    const [showDetailIndex, setShowDetailIndex] = useState(-1)

    const salaries = useSelector((state: RootState) => state.salariesReducer.salaries);
    const getSalariesState = useSelector((state: RootState) => state.salariesReducer.getSalaries);

    useEffect(() => {
        dispatch(actionGetSalaries())
    }, [dispatch])

    function handleShowDetail(index: number) {
        setShowDetail(true);
        setShowDetailIndex(index);
    }

    function handleDeleteSalary(salary: SalaryType) {
        confirm({
            title: "Bạn muốn xoá bảng lương này!",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                dispatch(actionDeleteSalary(salary.id)).finally(() => {
                    dispatch(actionGetSalaries())
                })
            }
        })
    }

    function handlePaymentConfirm(salary: SalaryType) {
        confirm({
            title: "Xác nhận đã thanh toán lương?",
            content: "Lưu ý khi đã xác nhận thanh toán thì không thể sửa bảng lương được nữa!",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                dispatch(actionSalaryPaymentConfirmed(salary.id)).finally(() => {
                    dispatch(actionGetSalaries())
                })
            }
        })
    }

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
                    <span style={{ color: "#c0392b" }}>{val === 0 ? "Sale" : val === 1 ? "Giáo viên (2)" : "Giáo viên"}</span>
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
                    <span style={{ color: "#c0392b" }}>{val === 0 ? <Tag color="red">Chưa thanh toán</Tag> : <Tag color="green">Đã thanh toán</Tag>}</span>
                )
            }
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: function actionsCol(val: string, record: SalaryType, index: number) {
                return (
                    <>

                        <Tooltip title="Xem chi tiết"> <Button onClick={() => handleShowDetail(index)} type="link" icon={<ProfileOutlined />} /></Tooltip>
                        {/* <Tooltip title="Sửa bảng lương"> <Button disabled={Number(record.status) === 1 ? true : false} type="link" icon={<EditOutlined />} onClick={() => history.push(`/salaries-edit/${record.id}`)} /></Tooltip> */}
                        <Tooltip title="Đã thanh toán">
                            <Button disabled={Number(record.status) === 1 ? true : false} type="link" icon={<DollarCircleOutlined style={{ color: record.status === 0 ? "#27ae60" : "#bdc3c7" }} />} onClick={() => handlePaymentConfirm(record)} />
                        </Tooltip>
                        <Tooltip title="Xoá bảng lương">
                            <Button disabled={record.status === 1 ? true : false} type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteSalary(record)} />
                        </Tooltip>
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
            <DetailSalary salaryInfo={get(salaries, "data", [])[showDetailIndex]} show={showDetail} setShow={setShowDetail} />
        </Layout.Content>
    )
}

function DetailSalary(props: { salaryInfo: SalaryType, show: boolean, setShow: (param: boolean) => void }): JSX.Element {
    const { salaryInfo, show, setShow } = props;
    const dispatch = useAppDispatch();

    const [amount, setAmount] = useState(0);
    const [editing, setEditing] = useState(false);
    const [editPayload, setEditPayload] = useState({
        bonus: "",
        fines: "",
        note: ""
    })

    //application state 
    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const getReceiptStatus = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsStatus = useSelector((state: RootState) => state.lessonReducer.getLessonsState);
    const updateSalaryStutus = useSelector((state: RootState) => state.salariesReducer.updateSalaryStatus);


    useEffect(() => {
        if (salaryInfo) {
            setEditPayload({
                bonus: get(salaryInfo, "bonus", "0,0"),
                fines: get(salaryInfo, "fines", "0,0"),
                note: get(salaryInfo, "note", "")

            })
        }
    }, [salaryInfo])

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
                setAmount(parseFloat(salaryInfo.basic_salary) + parseFloat(salaryInfo.revenue_salary) + parseFloat(salaryInfo.bonus) - parseFloat(salaryInfo.fines))
            } else if (salaryInfo.type === 1) {
                dispatch(actionGetLessons(
                    {
                        employee_id: salaryInfo.employee_id,
                        from_date: moment(salaryInfo.from_date).format("YYYY-MM-DD"),
                        to_date: moment(salaryInfo.to_date).format("YYYY-MM-DD"),
                    }))
                setAmount(parseFloat(salaryInfo.revenue_salary) + parseFloat(salaryInfo.bonus) - parseFloat(salaryInfo.fines))
            }
        }
    }, [salaryInfo, dispatch, show])

    function handleSubmitEdit() {
        confirm({
            title: "Xác nhận sửa bảng lương?",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                dispatch(actionUpdateSalary({ sID: salaryInfo.id, data: editPayload })).finally(() => {
                    if (updateSalaryStutus === 'success') {
                        setEditing(false)
                        dispatch(actionGetSalaries())
                        // setShow(false)
                    }
                })
            }
        })
    }



    return (
        <>
            {
                salaryInfo &&
                <Modal
                    visible={show}
                    onCancel={() => { setShow(false); setEditing(false) }}
                    width={1000}
                    footer={[
                        <Button type={get(salaryInfo, "status", 0) === 1 ? "primary" : "default"} key="print">In bảng lương</Button>,
                        editing === false && get(salaryInfo, "status", 0) === 0 ? <Button type="primary" key="edit" onClick={() => setEditing(true)}>Sửa bảng lương</Button> : "",
                        editing === true ? <Button key="submit" type="primary" onClick={() => handleSubmitEdit()}>Lưu lại</Button> : ""
                    ]}
                >
                    <Descriptions
                        title="Chi tiết bảng lương"
                        bordered
                        column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
                        style={{ marginBottom: 20 }}
                    >
                        <Descriptions.Item span={3} label="Nhân viên"><strong>{get(salaryInfo, "user.profile.name", "")}</strong></Descriptions.Item>
                        <Descriptions.Item span={2} label="Ngày tạo">{moment(get(salaryInfo, "created_at", "")).format("YYYY-MM-DD")}</Descriptions.Item>
                        <Descriptions.Item span={2} label="Chu kỳ">{moment(get(salaryInfo, "from_date", "")).format("YYYY-MM-DD")} - {moment(salaryInfo.to_date).format("YYYY-MM-DD")} </Descriptions.Item>
                        <Descriptions.Item label="Cơ bản"><strong>{numeral(get(salaryInfo, "basic_salary", "")).format("0,0")}</strong></Descriptions.Item>
                        <Descriptions.Item label="Doanh thu"><strong>{numeral(get(salaryInfo, "revenue_salary", "")).format("0,0")}</strong></Descriptions.Item>
                        <Descriptions.Item label="Thưởng">
                            {
                                editing === true ?
                                    <InputNumber
                                        value={editPayload.bonus}
                                        style={{ width: "90%", color: "#16a085" }}
                                        formatter={(value) => numeral(value).format("0,0")}
                                        onChange={(value) => { editPayload.bonus = value; setEditPayload({ ...editPayload }) }}
                                    /> :
                                    <strong>{numeral(salaryInfo.bonus).format("0,0")}</strong>
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="Phạt">
                            {
                                editing === true ?
                                    <InputNumber
                                        value={editPayload.fines}
                                        style={{ width: "90%", color: "#e74c3c" }}
                                        formatter={(value) => numeral(value).format("0,0")}
                                        onChange={(value) => { editPayload.fines = value; setEditPayload({ ...editPayload }) }}
                                    /> :
                                    <strong>{numeral(salaryInfo.fines).format("0,0")}</strong>
                            }

                        </Descriptions.Item>
                        <Descriptions.Item span={3} label="Tổng"><strong style={{ color: "#2980b9" }}>{numeral(amount).format("0,0")}</strong></Descriptions.Item>
                        <Descriptions.Item span={3} label="Trạng thái"><strong>{salaryInfo.status === 0 ? <Tag color="volcano">Chưa thanh toán</Tag> : <Tag color="green">Đã thanh toán</Tag>}</strong></Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            {
                                editing === true ? <Input.TextArea value={editPayload.note} style={{ width: '75%' }} onChange={(e) => { editPayload.note = e.target.value; setEditPayload({ ...editPayload }) }} /> : salaryInfo.note
                            }

                        </Descriptions.Item>
                    </Descriptions>
                    <Collapse accordion>
                        <Panel header="Chi tiết doanh thu" key="1">
                            {
                                salaryInfo.type == 0 ?
                                    <List
                                        rowKey="id"
                                        itemLayout="horizontal"
                                        // header={<div style={{ justifyContent: "space-between", display: "flex" }}><div>Chi tiết doanh thu</div><div>{numeral(0).format("0,0")}</div></div>}
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
                                    /> : salaryInfo.type === 1 ?
                                        <List rowKey="id"
                                            itemLayout="horizontal"
                                            // header={<div style={{ justifyContent: "end", display: "flex", fontWeight: 600 }}>{numeral(0).format("0,0")}</div>}
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
                                        :
                                        ""
                            }
                        </Panel>
                    </Collapse>

                </Modal>
            }

        </>
    )
}
