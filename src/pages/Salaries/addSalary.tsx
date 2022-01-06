import { Col, Form, Input, Layout, Row, Select, Divider, Typography, Button, List, DatePicker, Space, InputNumber, Alert, Table } from 'antd';
// import { InfoCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionGetEmployeeInfo, actionGetEmployees, actionSetListEmployeesNull } from 'store/employees/slice';
import { findIndex, get } from 'lodash';
import moment from 'moment';
import { actionGetRevenues, actionSetListRevenuesNull } from 'store/revenues/slice';
import numeral from 'numeral';
import { actionAddSalary, AddSalaryData } from 'store/salaries/slice';
import { actionGetLessons, actionSetLessionsStateNull } from 'store/lesson/slice';
import { LessonType, TuitionFeeType } from 'interface';
import { actionGetTuitionFees } from 'store/tuition/tuition';

const { Option } = Select;
const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function AddSalary(): JSX.Element {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [dateRange, setDateRange] = useState<[string, string]>([moment(new Date).startOf("month").format("YYYY-MM-DD"), moment(new Date).endOf("month").format("YYYY-MM-DD")])
    const [disableSelectEmployee, setDisableSelectEmployee] = useState(true);
    const [amountRevenue, setAmountRevenue] = useState(0);
    const [amountSalary, setAmountSalary] = useState(0);
    const [role, setRole] = useState('none');
    const [periodTuitions, setPeriodTuitions] = useState<{ id: number, length: number }[]>([]);
    const emloyees = useSelector((state: RootState) => state.employeeReducer.employees);
    const employeeInfo = useSelector((state: RootState) => state.employeeReducer.employeeInfo);
    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const getReceiptStatus = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
    const addSalaryStatus = useSelector((state: RootState) => state.salariesReducer.addSalaryStatus);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsStatus = useSelector((state: RootState) => state.lessonReducer.getLessonsState);
    const tuitionFees = useSelector((state: RootState) => state.tuitionFeeReducer.tuitionFees);

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
        setAmountSalary(0);
        setAmountRevenue(0)
    }, [form, dispatch])

    useEffect(() => {
        if (employeeInfo) {
            form.setFieldsValue({
                basic_salary: get(employeeInfo.employee_contract, "basic_salary", "0"),
            })
        }
    }, [employeeInfo, form])

    useEffect(() => {
        if (receipts && role === 'sale') {
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

    useEffect(() => {
        if (lessons) {
            if (role === 'teacher2') {
                const count = get(lessons, "data", []).length;
                // console.log('lessons:', count)
                setAmountRevenue(count)
                form.setFieldsValue({
                    revenue_salary_percent: '100',
                    revenue_salary: parseFloat(form.getFieldValue("basic_salary")) * count
                })
                setAmountSalary(parseFloat(form.getFieldValue("basic_salary")) * count
                    + parseFloat(form.getFieldValue("bonus"))
                    - parseFloat(form.getFieldValue("fines")))
            } else if (role === 'teacher') {

                get(lessons, "data", []).forEach((ls) => {
                    const index = findIndex(periodTuitions, (p) => p.id === ls.tuition_period_id);
                    if (index == -1) {
                        periodTuitions.push({ id: ls.tuition_period_id, length: 1 })
                    } else {
                        periodTuitions[index].length++;
                    }
                })
                setPeriodTuitions(periodTuitions);
                let period_id_str = '';
                periodTuitions.forEach((p) => {
                    if (period_id_str === '') period_id_str = `${p.id}`
                    else period_id_str += `,${p.id}`
                })
                dispatch(actionGetTuitionFees({ period_tuition_fee_id: period_id_str, per_page: 1000 }));
            }
        }
    }, [lessons, role, form, periodTuitions, dispatch])
    // console.log(periodTuitions);

    function handleChangeDateRange(date: any, dateString: [string, string]) {
        setDateRange([dateString[0], dateString[1]])
    }

    function handleGetRevenue() {
        if (form.getFieldValue('employee_id') > 0 && role != 'none') {
            switch (role) {
                case 'sale':
                    dispatch(actionGetRevenues({ employee_id: form.getFieldValue('employee_id'), fromDate: dateRange[0], toDate: dateRange[1] }))
                    break;
                case 'teacher':
                    dispatch(actionGetLessons({ employee_id: form.getFieldValue('employee_id'), from_date: dateRange[0], to_date: dateRange[1] }));
                    break;
                case 'teacher2':
                    dispatch(actionGetLessons({ employee_id: form.getFieldValue('employee_id'), from_date: dateRange[0], to_date: dateRange[1] }));
                    break;
                case 'other':
                    break;
                default:
                    break;
            }

        }
    }

    function handleChanegValues(changeValues: any, allValues: any) {
        if (allValues.employee_id > 0) {
            const revenue = parseFloat(allValues.revenue_salary);
            const basic = parseFloat(allValues.basic_salary);
            const bonus = parseFloat(allValues.bonus);
            const fines = parseFloat(allValues.fines);
            // console.log(revenue, basic, bonus, fines);
            if (role === 'sale') {
                setAmountSalary(basic + revenue + bonus - fines);
            } else if (role === 'teacher2') {
                setAmountSalary(basic * amountRevenue + bonus - fines);
            }
        }
        if (changeValues.role) {
            // console.log(allValues.employee_id)
            setRole(changeValues.role);
            dispatch(actionSetListRevenuesNull());
            dispatch(actionSetLessionsStateNull());
            setAmountRevenue(0)
            setAmountSalary(0)
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
                dispatch(actionGetEmployees({ role_name: changeValues.role }))
                setDisableSelectEmployee(false)
            }
            return;
        }
        if (changeValues.employee_id) {
            dispatch(actionSetListRevenuesNull())
            dispatch(actionSetLessionsStateNull());
            setAmountRevenue(0)
            setAmountSalary(0)
            if (changeValues.employee_id > 0) {
                dispatch(actionGetEmployeeInfo(changeValues.employee_id));
            }
            return;
        }
        if (changeValues.basic_salary) {
            if (role === 'teacher2') {
                form.setFieldsValue({
                    revenue_salary_percent: '100',
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
            type: role === 'sale' ? 0 : role === 'teacher2' ? 1 : 2
        }
        dispatch(actionAddSalary(payload));
    }

    // console.log(sForm.getFieldValue('role'))
    const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Value must be numeric" };
    return (
        <Layout.Content style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={3}> Lập bảng lương </Title>
                <Paragraph ellipsis={false}>
                    <Alert closable style={{ marginBottom: 20 }} message="Với nhân viên sale, bảng doanh thu là bảng doanh thu bán khoá học trong khoảng thời gian tính lương, tổng lương = lương doanh thu + lương cơ bản + thưởng  - phạt" type="info" showIcon />
                    <Alert closable message="Với nhân viên là giáo viên lương theo buổi, bảng doanh thu là danh sách các buổi dạy trong khoảng thời gian tính lương, tổng lương = lương doanh thu(lương cơ bản * số buổi dạy) + thưởng  - phạt" type="info" showIcon />
                </Paragraph>

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
                            <Select placeholder="Vị trí" style={{ width: 150 }}>
                                <Option value="none">Chọn vị trí</Option>
                                <Option value="teacher">Giáo viên</Option>
                                <Option value="teacher2">Giáo viên(2)</Option>
                                <Option value="sale">Nhân viên sale</Option>
                                <Option value="other">Khác</Option>
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
                                style={{ width: 350 }}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                }
                            >
                                {
                                    form.getFieldValue('role') === 'none' ? <Option value={0} key={0}>--</Option > : ""
                                }
                                {
                                    get(emloyees, "data", []).map((e) => <Option value={e.id} key={e.id}><a>{e.name}</a> - {e.phone}</Option >)
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
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value: any) => value.replace(/(,*)/g, "")}
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
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value: any) => value.replace(/(,*)/g, "")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Lương thưởng" name="bonus" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#16a085" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value: any) => value.replace(/(,*)/g, "")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Lương trừ" name="fines" rules={[IsNumeric]} >
                            <InputNumber
                                style={{ width: "90%", color: "#c0392b" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value: any) => value.replace(/(,*)/g, "")}
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
                                <Button type="primary" htmlType="submit" loading={addSalaryStatus == "loading" ? true : false}>Submit</Button>
                            </Space>
                        </Form.Item>

                    </Col>
                </Row>
            </Form>
            <Divider />
            <Row justify="space-between" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={4}> Bảng doanh thu </Title>
                </Col>
                <Col>
                    <RangePicker style={{ marginRight: 10 }} defaultValue={[moment(new Date).startOf("month"), moment(new Date).endOf("month")]} onChange={handleChangeDateRange} />
                    <Button type="primary" onClick={handleGetRevenue}>Lấy bảng doanh thu</Button>
                </Col>
            </Row>

            {
                role === "sale" ?
                    <List
                        rowKey="id"
                        itemLayout="horizontal"
                        header={<div style={{ justifyContent: "end", display: "flex" }}>{numeral(amountRevenue).format("0,0")}</div>}
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
                    /> : role === "teacher2" ?
                        <List rowKey="id"
                            itemLayout="horizontal"
                            header={<div style={{ justifyContent: "end", display: "flex", fontWeight: 600 }}>{numeral(amountRevenue).format("0,0")}</div>}
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
                            )} /> :
                        <TeacherRevenueTable tuitionFeeList={get(tuitionFees,"data",[])} periodTuitionFeeList={periodTuitions}/>

            }
        </Layout.Content>
    )
}


function TeacherRevenueTable(prop:{tuitionFeeList:TuitionFeeType[], periodTuitionFeeList:{id:number, length:number}[]}):JSX.Element{
    const {tuitionFeeList, periodTuitionFeeList} = prop;

    function getLessonNum(tuitionFee:TuitionFeeType):number{
        let res = 0;
        if(tuitionFee.from_date == null){
            const found = periodTuitionFeeList.find((p) => p.id === tuitionFee.period_tuition_id);
            if(found) res = found.length;
        }else {
            res = 1;
        }
        return res;
    }

    const cols = [
        {
            title: "Học sinh",
            dataIndex: "student",
            key: "student",
            render: function studentCol(st:{id:number, name:string}):JSX.Element{
                return(
                    <>{st.name}</>
                )
            }
        },
        {
            title: "Số buổi học",
            dataIndex: "lesson_num",
            key: "lesson_num",
            render: function studentCol(val:string, record:TuitionFeeType):JSX.Element{
                return(
                    <>{getLessonNum(record)}</>
                )
            }

        }
    ]

    return(
        <>
            <Table
                rowKey="id"
                columns={cols}
                dataSource={get(tuitionFeeList,"data",[])}
            >
            </Table>
        </>
    )
}