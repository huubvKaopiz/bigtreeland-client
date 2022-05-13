import { CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Col, DatePicker, Divider, Form, Input, InputNumber, Layout, List, Modal, notification, Row, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import { LessonType, PeriodTuitionType, TuitionFeeType } from 'interface';
import { findIndex, get } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { actionGetEmployeeInfo, actionGetEmployees, actionSetListEmployeesNull } from 'store/employees/slice';
import { actionGetLessons, actionSetLessionsStateNull } from 'store/lesson/slice';
import { actionGetRevenues, actionSetListRevenuesNull, RevenueType } from 'store/revenues/slice';
import { actionAddSalary, actionSetAddSalaryStateIdle, AddSalaryData } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetTuitionFees, actionSetTuitionFeesStateNull } from 'store/tuition/tuition';
import { ROLE_NAMES } from 'utils/const';

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
    }, [employeeInfo])

    //handle receipts state change, call revenue for saler
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
            setAmountSalary(
                +form.getFieldValue("basic_salary")
                + percent / 100 * amount
                + +form.getFieldValue("bonus")
                - +form.getFieldValue("fines"))
        }
    }, [receipts, role])

    // handle lessons state change, the list of lessons will be changed when the user clicks on the 'Get Revenue' button.
    useMemo(() => {
        if (get(lessons, "data", []).length > 0) {
            //if the role is teacher2 or assistant, cal Employee's revenue base on lessons and fee per session.
            if (role === ROLE_NAMES.TEACHER2 || role === ROLE_NAMES.CLASS_ASSISTANT) {
                const count = get(lessons, "data", []).length;
                setAmountRevenue(count)
                form.setFieldsValue({
                    revenue_salary:+form.getFieldValue("basic_salary") * count
                })
                setAmountSalary(parseFloat(form.getFieldValue("basic_salary")) * count
                    + +form.getFieldValue("bonus")
                    - +form.getFieldValue("fines"))
            }
            // if role is 'teacher' 
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
    }, [lessons])

    useEffect(()=>{
        if (addSalaryStatus === 'success') {
            confirm({
                title: 'Lưu bảng lương thành công!',
                icon: <CheckCircleOutlined />,
                content: 'Bạn muốn chuyển đến danh sách bảng lương',
                cancelText:"Ở lại trang này",
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
            if(role === ROLE_NAMES.SALE){
                dispatch(actionGetRevenues({ 
                    employee_id: form.getFieldValue('employee_id'), 
                    from_date: dateRange[0], 
                    to_date: dateRange[1],
                    per_page:200
                })).then(() => setRevenueLoading(false))
            }else {
                dispatch(actionGetLessons({ 
                    user_id: form.getFieldValue('employee_id'), 
                    from_date: dateRange[0], 
                    to_date: dateRange[1],
                    per_page:200
                })).then(() => setRevenueLoading(false));
            }
        }else {
           notification.error({message: 'Bạn chưa chọn nhân viên!'});
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
            const revenue = +allValues.revenue_salary;
            const basic = +allValues.basic_salary;
            const bonus = +allValues.bonus;
            const fines = +allValues.fines;
            if (role === ROLE_NAMES.SALE || role === ROLE_NAMES.TEACHER) {
                setAmountSalary(basic + revenue + bonus - fines);
            } else if (role === ROLE_NAMES.TEACHER2 || role === ROLE_NAMES.CLASS_ASSISTANT) {
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
                    case ROLE_NAMES.CLASS_ASSISTANT:
                    case ROLE_NAMES.TEACHER2:
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
            if (role === ROLE_NAMES.TEACHER2 || role === ROLE_NAMES.CLASS_ASSISTANT) {
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
            // period_id: 0,
            note: values.note,
            from_date: dateRange[0],
            to_date: dateRange[1],
            status: 0,
            type: role === ROLE_NAMES.SALE ? 0 : role === ROLE_NAMES.TEACHER2 ? 1 : role === ROLE_NAMES.TEACHER ? 2 : 3
        }
        dispatch(actionAddSalary(payload));
    }

    //UI render 
    const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Value must be numeric" };
    return (
        <Layout.Content style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={3}> Lập bảng lương </Title>
            </div>
            <Divider />
            <Form form={form} name="salary"
                style={{ padding: 20, marginBottom: 20 }}
                layout='vertical'
                onValuesChange={handleChanegValues}
                onFinish={handleSubmit}
            >
                <Form.Item label="Nhân viên">
                    <Input.Group compact>
                        <Form.Item
                            name={'role'}
                            noStyle
                        >
                            <Select placeholder="Vị trí" style={{ width: 240 }}>
                                <Option value="none">Chọn vị trí</Option>
                                <Option value={ROLE_NAMES.TEACHER}>Giáo viên chính thức</Option>
                                <Option value={ROLE_NAMES.TEACHER2}>Giáo viên hợp đồng</Option>
                                <Option value={ROLE_NAMES.SALE}>Nhân viên sale</Option>
                                <Option value={ROLE_NAMES.CLASS_ASSISTANT}>Trợ giảng</Option>
                                {/* <Option value={ROLE_NAMES.EMPLOYEE}>Khác</Option> */}
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
                                placeholder="Chọn nhân viên"
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
                <Form.Item label="Lương doanh thu" >
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
                        <Form.Item label="Lương cơ bản" name="basic_salary" rules={[IsNumeric]} tooltip="Nếu nhân viên là giáo viên (2) thì lương cơ bản chính là lương/buổi dạy">
                            <InputNumber
                                style={{ width: "90%" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Lương thưởng" name="bonus" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#16a085" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Lương trừ" name="fines" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#c0392b" }}
                                formatter={(value) => numeral(value).format("0,0")}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name='note' label="Ghi chú">
                    <Input.TextArea style={{ width: '75%' }} />
                </Form.Item>
                <Row>
                    <Col span={24} style={{ textAlign: 'left' }}>

                        <Form.Item>
                            <Space >
                                <strong style={{ marginRight: 20 }}>Tổng lương: <span style={{ color: "#d35400" }}>{numeral(amountSalary).format("0,0")}</span></strong>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={addSalaryStatus == "loading" ? true : false}>Lưu lại</Button>
                            </Space>
                        </Form.Item>

                    </Col>
                </Row>
            </Form>
            <Divider />
            <Row justify="space-between" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={4}> Bảng doanh thu (<span style={{ color: "#27ae60" }}>{numeral(amountRevenue).format("0,0")}</span>) </Title>

                </Col>
                <Col>
                    <RangePicker style={{ marginRight: 10 }} defaultValue={[moment(new Date).startOf("month"), moment(new Date).endOf("month")]} onChange={handleChangeDateRange} />
                    <Button type="primary" onClick={handleGetRevenue}>Lấy bảng doanh thu</Button>
                </Col>
            </Row>
            {role === ROLE_NAMES.SALE ? <Alert closable style={{ marginBottom: 20 }} message="Với nhân viên sale, bảng doanh thu là bảng doanh thu bán khoá học trong khoảng thời gian tính lương" type="warning" /> : ""}
            {role === ROLE_NAMES.TEACHER2 || role === ROLE_NAMES.CLASS_ASSISTANT ? <Alert closable style={{ marginBottom: 20 }} message="Với nhân viên là giáo viên lương theo buổi hoặc trợ giảng, bảng doanh thu là danh sách các buổi dạy trong khoảng thời gian tính lương" type="warning" /> : ""}
            {role === ROLE_NAMES.TEACHER  ? <Alert closable style={{ marginBottom: 20 }} message="Với nhân viên là giáo viên lương theo doanh thu học phí, bảng doanh thu là danh số buổi dạy của từng học sinh trong khoảng thời gian tính lương" type="warning" /> : ""}
            {
                role === ROLE_NAMES.SALE 
                ?
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
                    /> : role === ROLE_NAMES.TEACHER 
                    ?
                    <TeacherRevenueTable
                    tuitionFeeList={get(tuitionFees, "data", [])}
                    periodTuitionFeeList={periodTuitions}
                    lessons={get(lessons, "data", [])}
                    revenueLoading={revenueLoading}
                    handleChangeTeacherRevenue={handleChangeTeacherRevenue}
                />
                       :
                       <List rowKey="id"
                       itemLayout="horizontal"
                       // header={<div style={{ justifyContent: "end", display: "flex", fontWeight: 600 }}>{numeral(amountRevenue).format("0,0")}</div>}
                       loading={revenueLoading}
                       dataSource={get(lessons, "data", [])}
                       renderItem={(item:LessonType) => (
                           <List.Item>
                               <List.Item.Meta
                                   title={<a href="#">{item.class?.name}</a>}
                                //    description={item.tuition_period_id}
                               />
                               <div style={{ color: "#2980b9" }}>{item.date}</div>

                           </List.Item>
                       )} /> 
                       

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
                        const lsDataInTuitionPoriod = moment(ls.date).isSameOrAfter(tuition.from_date) && moment(ls.date).isSameOrBefore(tuition.to_date)
                        if (lsDataInTuitionPoriod && ls.tuition_period_id === tuition.period_tuition_id) count++;
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
            title: "Học sinh",
            dataIndex: "student",
            key: "student",
            render: function studentCol(st: { id: number, name: string }): JSX.Element {
                return (
                    <a>{st.name}</a>
                )
            }
        },
        {
            title: "Số buổi học",
            // dataIndex: "",
            key: "lesson_num",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <>{tuitionLessionNumList[record.id]}</>
                )
            }
        },
        {
            title: "Học phí/buổi",
            dataIndex: "period_tuition",
            key: "fee_per_session",
            render: function studentCol(period: PeriodTuitionType): JSX.Element {
                return (
                    <>{numeral(get(period, "fee_per_session", 0)).format("0,0")}</>
                )
            }
        },
        {
            title: "Giảm trừ",
            // dataIndex: "",
            key: "reduction",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <span style={{ color: "#d35400" }}>{numeral(reductionList[record.id]).format("0,0")}</span>
                )
            }
        },
        {
            title: "Thu ước tính",
            // dataIndex: "",
            key: "amount",
            render: function studentCol(text: string, record: TuitionFeeType): JSX.Element {
                return (
                    <strong style={{ color: "#2980b9" }}>{numeral(get(record, "period_tuition.fee_per_session", 0) * tuitionLessionNumList[record.id] - reductionList[record.id]).format("0,0")}</strong>
                )
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: function studentCol(val: number): JSX.Element {
                return (
                    <span>{
                        val === 0 
                        ? <Tag color="red">Chưa nộp</Tag> 
                        : val === 1 
                        ? <Tag color="green">Đã nộp</Tag> 
                        : val === 3 
                        ?  <Tag color="orange">Chuyển nợ</Tag>
                        :  <Tag color="blue">Thanh toán 1 phần</Tag>
                    }</span>
                )
            }
        },
    ]

    return (
        <React.StrictMode>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Bảng học phí" key="1">
                    <Table
                        rowKey="id"
                        loading={revenueLoading}
                        columns={cols}
                        dataSource={tuitionFeeList}
                        pagination={{ defaultPageSize: 100 }}
                    >
                    </Table>
                </TabPane>
                <TabPane tab="DS buổi dạy" key="2">
                    <List rowKey="id"
                        itemLayout="horizontal"
                        loading={revenueLoading}
                        dataSource={lessons}
                        renderItem={(item:LessonType) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<a href="#">Lớp: {get(item, "tuition_period.class.name", "")}</a>}
                                    description={item.date}
                                />
                                <div style={{ color: "#2980b9" }}>Chu kỳ:{moment(item.tuition_period.from_date).format("DD/MM/YYYY")} - {moment(item.tuition_period.to_date).format("DD/MM/YYYY")}</div>

                            </List.Item>
                        )} />
                </TabPane>

            </Tabs>

        </React.StrictMode>
    )
}
