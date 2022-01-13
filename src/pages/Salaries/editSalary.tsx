import { Col, Form, Input, Layout, Row, Select, Divider, Typography, Button, List, DatePicker, Space, InputNumber, Alert } from 'antd';
// import { InfoCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionGetEmployeeInfo, actionGetEmployees, actionSetListEmployeesNull } from 'store/employees/slice';
import { get } from 'lodash';
import moment from 'moment';
import { actionGetRevenues, actionSetListRevenuesNull } from 'store/revenues/slice';
import numeral from 'numeral';
import { actionAddSalary, actionGetSalary, AddSalaryData } from 'store/salaries/slice';
import { actionGetLessons, actionSetLessionsStateNull } from 'store/lesson/slice';
import { useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function EditSalary(): JSX.Element {
    const params = useParams() as { salary_id: string };
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [amountRevenue, setAmountRevenue] = useState(0);
    const [amountSalary, setAmountSalary] = useState(0);

    const salaryInfo = useSelector((state: RootState) => state.salariesReducer.salary);
    const updateSalaryStatus = useSelector((state: RootState) => state.salariesReducer.updateSalaryStatus);
    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const getReceiptStatus = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
    const lessons = useSelector((state: RootState) => state.lessonReducer.lessons);
    const getLessonsStatus = useSelector((state: RootState) => state.lessonReducer.getLessonsState);


    useEffect(() => {
        if (params.salary_id) {
            dispatch(actionGetSalary(Number(params.salary_id)))
        }
    }, [dispatch, params])

    useEffect(() => {
        if (salaryInfo) {
            form.setFieldsValue({
                role: salaryInfo.type === 0 ? 'sale' : salaryInfo.type === 1 ? 'teacher2' : 'teacher',
                basic_salary: salaryInfo.basic_salary,
                revenue_salary: salaryInfo.revenue_salary,
                revenue_salary_percent: "0",
                bonus: salaryInfo.bonus,
                fines: salaryInfo.fines,
                note: salaryInfo.note
            })
            dispatch(actionGetRevenues({ employee_id: salaryInfo.employee_id, fromDate: salaryInfo.from_date, toDate: salaryInfo.to_date }))
        }
    }, [form, dispatch, salaryInfo])


    useEffect(() => {
        if (receipts) {
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
    }, [receipts, form, salaryInfo])

    useEffect(() => {
        if (lessons) {
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
        }

    }, [lessons, form])

    function handleChanegValues(changeValues: any, allValues: any) {
        if (allValues.employee_id > 0) {
            const revenue = parseFloat(allValues.revenue_salary);
            const basic = parseFloat(allValues.basic_salary);
            const bonus = parseFloat(allValues.bonus);
            const fines = parseFloat(allValues.fines);
            // console.log(revenue, basic, bonus, fines);
            if (salaryInfo?.type === 0) {
                setAmountSalary(basic + revenue + bonus - fines);
            } else if (salaryInfo?.type === 1) {
                setAmountSalary(basic * amountRevenue + bonus - fines);
            }
        }
        if (changeValues.role) {
            // console.log(allValues.employee_id)
            dispatch(actionSetListRevenuesNull());
            dispatch(actionSetLessionsStateNull());
            setAmountRevenue(0)
            setAmountSalary(0)
            if (changeValues.role === 'none') {
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
            if (salaryInfo?.type === 0) {
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
            from_date: get(salaryInfo, "from_date", ""),
            to_date: get(salaryInfo, "to_date", ""),
            status: 0,
            type: get(salaryInfo, "type", 0)
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
            <Space style={{padding:20}}>
                <div>Nhân viên: <strong>{get(salaryInfo, "user.name", "")}</strong></div>
    <div>Chu kỳ lương: <strong>{get(salaryInfo,"from_date","")} - {get(salaryInfo,"to_date","")}</strong></div>
            </Space>
            <Form form={form} name="salary"
                style={{ padding: 20, marginBottom: 20 }}
                layout='vertical'
                onValuesChange={handleChanegValues}
                onFinish={handleSubmit}
            >
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
                                <Button type="primary" htmlType="submit" loading={updateSalaryStatus == "loading" ? true : false}>Submit</Button>
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
            </Row>

            {
                salaryInfo?.type === 0 ?
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
                    /> :
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
                        )} />
            }
        </Layout.Content>
    )
}