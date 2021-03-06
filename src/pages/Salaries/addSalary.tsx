import { CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Col, DatePicker, Divider, Form, Input, InputNumber, Layout, List, Modal, Row, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import { LessonType, PeriodTuitionType, RoleType, TuitionFeeType } from 'interface';
import { findIndex, get } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { actionGetEmployeeInfo, actionGetEmployees, actionSetListEmployeesNull } from 'store/employees/slice';
import { actionGetLessons, actionSetLessionsStateNull } from 'store/lesson/slice';
import { actionGetRevenues, actionSetListRevenuesNull, RevenueType } from 'store/revenues/slice';
import { actionGetRoles } from 'store/roles/slice';
import { actionAddSalary, actionSetAddSalaryStateIdle, AddSalaryData } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetTuitionFees, actionSetTuitionFeesStateNull } from 'store/tuition/tuition';
import { ROLE_NAMES } from 'utils/const';
import { converRoleNameToVN } from 'utils/ultil';

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { confirm } = Modal;

export default function AddSalary(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [form] = Form.useForm();
    const [dateRange, setDateRange] = useState<[string, string]>([moment(new Date).startOf("month").format("YYYY-MM-DD"), moment(new Date).endOf("month").format("YYYY-MM-DD")])
    const [disableSelectEmployee, setDisableSelectEmployee] = useState(true);
    const [amountRevenue, setAmountRevenue] = useState(0);
    const [amountSalary, setAmountSalary] = useState(0);
    const [role, setRole] = useState('none');
    const [periodTuitions, setPeriodTuitions] = useState<{ id: number, count: number }[]>([]); // the list of periods that the teacher has teached
    const [revenueLoading, setRevenueLoading] = useState(false);
    //application state 
    const emloyees = useSelector((state: RootState) => state.employeeReducer.employees);
    const employeeInfo = useSelector((state: RootState) => state.employeeReducer.employeeInfo);
    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const addSalaryStatus = useSelector((state: RootState) => state.salariesReducer.addSalaryStatus);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const tuitionFees = useSelector((state: RootState) => state.tuitionFeeReducer.tuitionFees);
    const roles = useSelector((state: RootState) => state.roleReducer.roles);
    //initialize
    useEffect(() => {
        form.setFieldsValue({
            role: "none",
            employee_id: 0,
            basic_salary: "0",
            revenue_salary: "0",
            revenue_salary_percent: "10",
            fines: "0",
            bonus: "0",
            note: "",
        });
        dispatch(actionSetListRevenuesNull());
        dispatch(actionSetListEmployeesNull());
        dispatch(actionSetLessionsStateNull());
        dispatch(actionSetTuitionFeesStateNull());
        setAmountSalary(0);
        setAmountRevenue(0)
    }, [form, dispatch])

    //handle employeInfo state change
    useEffect(() => {
        if (employeeInfo) {
            form.setFieldsValue({
                basic_salary: get(employeeInfo.employee_contract, "basic_salary", "0"),
            })
        }
        dispatch(actionGetRoles(0));
    }, [employeeInfo, form, dispatch])

    //handle receipts state change
    useEffect(() => {
        if (receipts && role === ROLE_NAMES.SALE) {
            let amount = 0;
            get(receipts, "data", []).forEach((rc => {
                amount += Number(rc.amount);
            }))
            setAmountRevenue(amount);
            const percent = parseFloat(form.getFieldValue("revenue_salary_percent"));
            form.setFieldsValue({
                revenue_salary: percent / 100 * amount
            })
            setAmountSalary(parseFloat(form.getFieldValue("basic_salary"))
                + percent / 100 * amount
                + parseFloat(form.getFieldValue("bonus"))
                - parseFloat(form.getFieldValue("fines")))
        }
    }, [receipts, form, role])

    // handle lessons state change, the list of lessons will be changed when the user clicks on the 'Get Revenue' button.
    useEffect(() => {
        if (get(lessons, "data", []).length > 0) {
            //if the role is teacher2, cal Employee's revenue base on lessons and fee per session.
            if (role === ROLE_NAMES.TEACHER2) {
                const count = get(lessons, "data", []).length;
                setAmountRevenue(count)
                form.setFieldsValue({
                    revenue_salary: parseFloat(form.getFieldValue("basic_salary")) * count
                })
                setAmountSalary(parseFloat(form.getFieldValue("basic_salary")) * count
                    + parseFloat(form.getFieldValue("bonus"))
                    - parseFloat(form.getFieldValue("fines")))
            }
            // if the role is 'teacher' 
            else if (role === ROLE_NAMES.TEACHER) {
                //1. get list of periods with count of lessons that this teacher has teached 
                const peridoList: { id: number, count: number }[] = [];
                get(lessons, "data", []).forEach((ls) => {
                    const index = findIndex(peridoList, (p) => p.id === ls.tuition_period_id);
                    if (index == -1) {
                        peridoList.push({ id: ls.tuition_period_id, count: 1 })
                    } else {
                        peridoList[index].count++;
                    }
                })
                let period_id_str = '';
                peridoList.forEach((p) => {
                    if (period_id_str === '') period_id_str = `${p.id}`
                    else period_id_str += `,${p.id}`
                })
                //get all of tuitonFees of periods 
                if (period_id_str != '') {
                    setRevenueLoading(true)
                    dispatch(actionGetTuitionFees({ period_tuition_ids: period_id_str, per_page: 1000 })).then(() => setRevenueLoading(false));
                }
                setPeriodTuitions(peridoList);
            }
        }
    }, [lessons, role, form, dispatch])

    useEffect(()=>{
        if (addSalaryStatus === 'success') {
            confirm({
                title: 'L??u b???ng l????ng th??nh c??ng!',
                icon: <CheckCircleOutlined />,
                content: 'B???n mu???n chuy???n ?????n danh s??ch b???ng l????ng',
                cancelText:"??? l???i trang n??y",
                onOk() {
                    history.push("/salaries")
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
            dispatch(actionSetAddSalaryStateIdle());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[addSalaryStatus])

    function handleChangeDateRange(date: any, dateString: [string, string]) {
        setDateRange([dateString[0], dateString[1]])
    }

    // handle 'Get Revenue' button onclick!
    function handleGetRevenue() {
        if (form.getFieldValue('employee_id') > 0 && role != 'none') {
            setRevenueLoading(true);
            switch (role) {
                case ROLE_NAMES.SALE:
                    dispatch(actionGetRevenues({ employee_id: form.getFieldValue('employee_id'), from_date: dateRange[0], to_date: dateRange[1] })).then(() => setRevenueLoading(false))
                    break;
                case ROLE_NAMES.TEACHER:
                    dispatch(actionGetLessons({ employee_id: form.getFieldValue('employee_id'), from_date: dateRange[0], to_date: dateRange[1] })).then(() => setRevenueLoading(false));
                    break;
                case ROLE_NAMES.TEACHER2:
                    dispatch(actionGetLessons({ employee_id: form.getFieldValue('employee_id'), from_date: dateRange[0], to_date: dateRange[1] })).then(() => setRevenueLoading(false));
                    break;
                case ROLE_NAMES.EMPLOYEE:
                    break;
                default:
                    break;
            }

        }
    }

    function handleChangeTeacherRevenue(revenue: number) {
        setAmountRevenue(revenue);
        const percent = form.getFieldValue('revenue_salary_percent');
        const basic = form.getFieldValue('basic_salary');
        const bonus = form.getFieldValue('bonus');
        const fines = form.getFieldValue('fines');

        const rev = +percent * revenue / 100;
        form.setFieldsValue({
            revenue_salary: rev
        })
        setAmountSalary(+basic + +bonus + rev - +fines)
    }

    // handle form values change
    function handleChanegValues(changeValues: any, allValues: any) {
        if (allValues.employee_id > 0) {
            const revenue = parseFloat(allValues.revenue_salary);
            const basic = parseFloat(allValues.basic_salary);
            const bonus = parseFloat(allValues.bonus);
            const fines = parseFloat(allValues.fines);
            if (role === ROLE_NAMES.SALE || role === ROLE_NAMES.TEACHER) {
                setAmountSalary(basic + revenue + bonus - fines);
            } else if (role === ROLE_NAMES.TEACHER2) {
                setAmountSalary(basic * amountRevenue + bonus - fines);
            }
        }
        if (changeValues.role) {
            setRole(changeValues.role);
            dispatch(actionSetListRevenuesNull());
            dispatch(actionSetLessionsStateNull());
            dispatch(actionSetTuitionFeesStateNull());
            setAmountRevenue(0)
            setAmountSalary(0)
            form.setFieldsValue({ employee_id: null })
            if (changeValues.role === 'none') {
                setDisableSelectEmployee(true)
                form.setFieldsValue({
                    role: "none",
                    employee_id: 0,
                    basic_salary: "0",
                    revenue_salary: "0",
                    revenue_salary_percent: "0",
                    bonus: "0",
                    fines: "0",
                    note: ""
                })
            } else {
                switch (changeValues.role) {
                    case 'teacher':
                        form.setFieldsValue({
                            revenue_salary_percent: '50',
                        })
                        break;
                    case 'teacher2':
                        form.setFieldsValue({
                            revenue_salary_percent: '100',
                        })
                        break;
                    case 'sale':
                        form.setFieldsValue({
                            revenue_salary_percent: '20',
                        })
                        break;
                    default:
                        break;
                }
                dispatch(actionGetEmployees({ role_name: changeValues.role }))
                setDisableSelectEmployee(false)
            }
            return;
        }
        if (changeValues.employee_id) {
            dispatch(actionSetListRevenuesNull())
            dispatch(actionSetLessionsStateNull());
            dispatch(actionSetTuitionFeesStateNull());
            setAmountRevenue(0)
            setAmountSalary(0)
            if (changeValues.employee_id > 0) {
                dispatch(actionGetEmployeeInfo(changeValues.employee_id));
            }
            return;
        }
        if (changeValues.basic_salary) {
            if (role === ROLE_NAMES.TEACHER2) {
                form.setFieldsValue({
                    revenue_salary: parseFloat(changeValues.basic_salary) * get(lessons, "data", []).length
                })
            }
            return;
        }
        if (changeValues.revenue_salary_percent) {
            form.setFieldsValue({
                revenue_salary: parseFloat(changeValues.revenue_salary_percent) / 100 * amountRevenue
            })
            return;
        }
        if (changeValues.debt) {
            return;
        }
        if (changeValues.note) {
            return;
        }
    }

    // handle submit to server
    function handleSubmit(values: any) {
        console.log(values)
        if (values.employee_id <= 0) return;
        const payload: AddSalaryData = {
            employee_id: values.employee_id,
            basic_salary: values.basic_salary,
            revenue_salary: values.revenue_salary,
            debt: "",
            bonus: values.bonus,
            fines: values.fines,
            period_id: 0,
            note: values.note,
            from_date: dateRange[0],
            to_date: dateRange[1],
            status: 0,
            type: role === ROLE_NAMES.SALE ? 0 : role === ROLE_NAMES.TEACHER2 ? 1 : 2
        }
        dispatch(actionAddSalary(payload));
    }

    //UI render 
    const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Value must be numeric" };
    return (
        <Layout.Content style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={3}> L???p b???ng l????ng </Title>
            </div>
            <Divider />
            <Form form={form} name="salary"
                style={{ padding: 20, marginBottom: 20 }}
                layout='vertical'
                onValuesChange={handleChanegValues}
                onFinish={handleSubmit}
            >
                <Form.Item label="Nh??n vi??n">
                    <Input.Group compact>
                        <Form.Item
                            name={'role'}
                            noStyle
                        >
                            <Select style={{ width: 400 }} placeholder="Ch???n vai tr??" onChange={(value:any) => setRole(value)} allowClear={true}>
                                {roles.map((role: RoleType) => {
                                    return (
                                        role.name !== ROLE_NAMES.PARENT &&
                                        <Select.Option key={role.id} value={role.name}>
                                            {role.description ? role.description : <span>{converRoleNameToVN(role.name as ROLE_NAMES)}</span>}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name='employee_id'
                            noStyle
                            rules={[{ required: true, message: 'Street is required' }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                disabled={disableSelectEmployee}
                                style={{ width: 500 }}
                                placeholder="Ch???n nh??n vi??n"
                                optionFilterProp="children"
                            // filterSort={(optionA, optionB) =>
                            //     optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            // }
                            >
                                {
                                    role === 'none' ? <Option value={0} key={0}>--</Option > : ""
                                }
                                {
                                    get(emloyees, "data", []).map((e) => <Option value={e.id} key={e.id}><a>{get(e, "profile.name")}</a> ({e.phone})</Option >)
                                }
                            </Select>
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Form.Item label="L????ng doanh thu" >
                    <Input.Group compact>
                        <Form.Item name="revenue_salary_percent" style={{ width: '8%' }}>
                            <Input prefix="%" />
                        </Form.Item>
                        <Form.Item name="revenue_salary">
                            <InputNumber
                                style={{ width: "90%", color: "#16a085" }}
                                formatter={(value) => numeral(value).format("0,0")}
                                disabled
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Row>
                    <Col span={6}>
                        <Form.Item label="L????ng c?? b???n" name="basic_salary" rules={[IsNumeric]} tooltip="N???u nh??n vi??n l?? gi??o vi??n (2) th?? l????ng c?? b???n ch??nh l?? l????ng/bu???i d???y">
                            <InputNumber
                                style={{ width: "90%" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="L????ng th?????ng" name="bonus" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#16a085" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="L????ng tr???" name="fines" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#c0392b" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name='note' label="Ghi ch??">
                    <Input.TextArea style={{ width: '75%' }} />
                </Form.Item>
                <Row>
                    <Col span={24} style={{ textAlign: 'left' }}>

                        <Form.Item>
                            <Space >
                                <strong style={{ marginRight: 20 }}>T???ng l????ng: <span style={{ color: "#d35400" }}>{numeral(amountSalary).format("0,0")}</span></strong>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={addSalaryStatus == "loading" ? true : false}>L??u l???i</Button>
                            </Space>
                        </Form.Item>

                    </Col>
                </Row>
            </Form>
            <Divider />
            <Row justify="space-between" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={4}> B???ng doanh thu (<span style={{ color: "#27ae60" }}>{numeral(amountRevenue).format("0,0")}</span>) </Title>

                </Col>
                <Col>
                    <RangePicker style={{ marginRight: 10 }} defaultValue={[moment(new Date).startOf("month"), moment(new Date).endOf("month")]} onChange={handleChangeDateRange} />
                    <Button type="primary" onClick={handleGetRevenue}>L???y b???ng doanh thu</Button>
                </Col>
            </Row>
            {role === ROLE_NAMES.SALE ? <Alert closable style={{ marginBottom: 20 }} message="V???i nh??n vi??n sale, b???ng doanh thu l?? b???ng doanh thu b??n kho?? h???c trong kho???ng th???i gian t??nh l????ng" type="warning" /> : ""}
            {role === ROLE_NAMES.TEACHER2 ? <Alert closable style={{ marginBottom: 20 }} message="V???i nh??n vi??n l?? gi??o vi??n l????ng theo bu???i, b???ng doanh thu l?? danh s??ch c??c bu???i d???y trong kho???ng th???i gian t??nh l????ng" type="warning" /> : ""}
            {role === ROLE_NAMES.TEACHER ? <Alert closable style={{ marginBottom: 20 }} message="V???i nh??n vi??n l?? gi??o vi??n l????ng theo doanh thu h???c ph??, b???ng doanh thu l?? danh s??? bu???i d???y c???a t???ng h???c sinh trong kho???ng th???i gian t??nh l????ng" type="warning" /> : ""}
            {
                role === ROLE_NAMES.SALE ?
                    <List
                        rowKey="id"
                        itemLayout="horizontal"
                        // header={<div style={{ justifyContent: "end", display: "flex" }}>{numeral(amountRevenue).format("0,0")}</div>}
                        loading={revenueLoading}
                        dataSource={get(receipts, "data", [])}
                        renderItem={(item:RevenueType) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<a href="#">{item.created_at}</a>}
                                    description={item.note}
                                />
                                <div style={{ color: "#2980b9" }}>{numeral(item.amount).format("0,0")}</div>
                            </List.Item>
                        )}
                    /> : role === ROLE_NAMES.TEACHER2 ?
                        <List rowKey="id"
                            itemLayout="horizontal"
                            // header={<div style={{ justifyContent: "end", display: "flex", fontWeight: 600 }}>{numeral(amountRevenue).format("0,0")}</div>}
                            loading={revenueLoading}
                            dataSource={get(lessons, "data", [])}
                            renderItem={(item:LessonType) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a href="#">{item.tuition_period_id}</a>}
                                        description={item.tuition_period_id}
                                    />
                                    <div style={{ color: "#2980b9" }}>{item.date}</div>

                                </List.Item>
                            )} /> :

                        <TeacherRevenueTable
                            tuitionFeeList={get(tuitionFees, "data", [])}
                            periodTuitionFeeList={periodTuitions}
                            lessons={get(lessons, "data", [])}
                            revenueLoading={revenueLoading}
                            handleChangeTeacherRevenue={handleChangeTeacherRevenue}
                        />

            }
        </Layout.Content>
    )
}

// the revenue detail table of 'Teacher'
function TeacherRevenueTable(prop: {
    tuitionFeeList: TuitionFeeType[],
    periodTuitionFeeList: { id: number, count: number }[],
    revenueLoading: boolean,
    lessons: LessonType[],
    handleChangeTeacherRevenue: (r: number) => void,
}): JSX.Element {
    const { tuitionFeeList, periodTuitionFeeList, lessons, revenueLoading, handleChangeTeacherRevenue } = prop;
    const [tuitionLessionNumList, setTuitionLessionNumList] = useState<number[]>([]);
    const [reductionList, setReductionList] = useState<number[]>([]);

    useEffect(() => {
        if (tuitionFeeList) {
            const lessonNumList: number[] = [];
            const reductions: number[] = [];
            let amountRev = 0;
            tuitionFeeList.forEach((tuition: TuitionFeeType) => {
                if (tuition.from_date == null) {
                    const found = periodTuitionFeeList.find((p) => p.id === tuition.period_tuition_id);
                    // console.log(found)
                    if (found) lessonNumList[tuition.id] = found.count;
                    else lessonNumList[tuition.id] = 0
                } else {
                    let count = 0;
                    lessons.forEach((ls) => {
                        if (moment(ls.date).isSameOrAfter(tuition.from_date) && ls.tuition_period_id === tuition.period_tuition_id) count++;
                    })
                    lessonNumList[tuition.id] = count;
                }
                const fee_per_session = get(tuition, "period_tuition.fee_per_session", 0);
                const reduction = get(tuition, "flexible_deduction", "0");
                let est_fee = 0;
                if (tuition.est_session_num === 0) {
                    est_fee = fee_per_session * +get(tuition, "period_tuition.est_session_num", 0);
                } else est_fee = fee_per_session * +get(tuition, "est_session_num", 0);
                reductions[tuition.id] = +reduction / est_fee * (fee_per_session * lessonNumList[tuition.id]);
                amountRev += (fee_per_session * lessonNumList[tuition.id] - reductions[tuition.id])
            })
            setTuitionLessionNumList(lessonNumList);
            setReductionList(reductions);
            handleChangeTeacherRevenue(amountRev);

        }
    }, [tuitionFeeList, periodTuitionFeeList, lessons, handleChangeTeacherRevenue])

    const cols = [
        {
            title: "H???c sinh",
            dataIndex: "student",
            key: "student",
            render: function studentCol(st: { id: number, name: string }): JSX.Element {
                return (
                    <a>{st.name}</a>
                )
            }
        },
        {
            title: "S??? bu???i h???c",
            // dataIndex: "",
            key: "lesson_num",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <>{tuitionLessionNumList[record.id]}</>
                )
            }
        },
        {
            title: "H???c ph??/bu???i",
            dataIndex: "period_tuition",
            key: "fee_per_session",
            render: function studentCol(period: PeriodTuitionType): JSX.Element {
                return (
                    <>{numeral(get(period, "fee_per_session", 0)).format("0,0")}</>
                )
            }
        },
        {
            title: "Gi???m tr???",
            // dataIndex: "",
            key: "reduction",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <span style={{ color: "#d35400" }}>{numeral(reductionList[record.id]).format("0,0")}</span>
                )
            }
        },
        {
            title: "Thu ?????c t??nh",
            // dataIndex: "",
            key: "amount",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <strong style={{ color: "#2980b9" }}>{numeral(get(record, "period_tuition.fee_per_session", 0) * tuitionLessionNumList[record.id] - reductionList[record.id]).format("0,0")}</strong>
                )
            }
        },
        {
            title: "Tr???ng th??i",
            dataIndex: "status",
            key: "status",
            render: function studentCol(val: number): JSX.Element {
                return (
                    <span>{val === 0 ? <Tag color="red">Ch??a n???p</Tag> : val === 1 ? <Tag color="green">???? n???p</Tag> : <Tag color="orange">Chuy???n n???</Tag>}</span>
                )
            }
        },
    ]

    return (
        <React.StrictMode>
            <Tabs defaultActiveKey="1">
                <TabPane tab="B???ng h???c ph??" key="1">
                    <Table
                        rowKey="id"
                        loading={revenueLoading}
                        columns={cols}
                        dataSource={tuitionFeeList}
                        pagination={{ defaultPageSize: 100 }}
                    >
                    </Table>
                </TabPane>
                <TabPane tab="DS bu???i d???y" key="2">
                    <List rowKey="id"
                        itemLayout="horizontal"
                        loading={revenueLoading}
                        dataSource={lessons}
                        renderItem={(item:LessonType) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<a href="#">L???p: {get(item, "tuition_period.class.name", "")}</a>}
                                    description={item.date}
                                />
                                <div style={{ color: "#2980b9" }}>Chu k???:{moment(item.tuition_period.from_date).format("DD/MM/YYYY")} - {moment(item.tuition_period.to_date).format("DD/MM/YYYY")}</div>

                            </List.Item>
                        )} />
                </TabPane>

            </Tabs>

        </React.StrictMode>
    )
}
