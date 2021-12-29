import { Col, Form, Input, Layout, Row, Select, Divider, Typography, Button, List, DatePicker, Space, InputNumber } from 'antd';
// import { CopyOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionGetEmployeeInfo, actionGetEmployees, actionSetListEmployeesNull } from 'store/employees/slice';
import { get } from 'lodash';
import moment from 'moment';
import { actionGetRevenues, actionSetListRevenuesNull } from 'store/revenues/slice';
import numeral from 'numeral';
import { actionAddSalary, AddSalaryData } from 'store/salaries/slice';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

export default function AddSalary(): JSX.Element {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [dateRange, setDateRange] = useState<[string, string]>([moment(new Date).startOf("month").format("YYYY-MM-DD"), moment(new Date).endOf("month").format("YYYY-MM-DD")])
    const [disableSelectEmployee, setDisableSelectEmployee] = useState(true);
    const [amountRevenue, setAmountRevenue] = useState(0);
    const [amountSalary, setAmountSalary] = useState(0);
    const emloyees = useSelector((state: RootState) => state.employeeReducer.employees);
    const employeeInfo = useSelector((state: RootState) => state.employeeReducer.employeeInfo);
    const receipts = useSelector((state: RootState) => state.revenuesReducer.revenues);
    const getReceiptStatus = useSelector((state: RootState) => state.revenuesReducer.getRevenuesStatus);
    const addSalaryStatus = useSelector((state: RootState) => state.salariesReducer.addSalaryStatus);

    useEffect(() => {
        form.setFieldsValue({
            role: "none",
            employee_id: 0,
            basic_salary: "0",
            revenue_salary: "0",
            revenue_salary_percent: "10",
            fines: "0",
            bonus: "0",
            note: ""
        });
        dispatch(actionSetListRevenuesNull());
        dispatch(actionSetListEmployeesNull());
    }, [form, dispatch])

    useEffect(() => {
        if (employeeInfo) {
            form.setFieldsValue({
                basic_salary: get(employeeInfo.employee_contract, "basic_salary", "0"),
            })
        }
    }, [employeeInfo, form])

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
    }, [receipts, form])

    function handleChangeDateRange(date: any, dateString: [string, string]) {
        setDateRange([dateString[0], dateString[1]])
    }

    function handleGetRevenue() {
        if (form.getFieldValue('employee_id') > 0) {
            dispatch(actionGetRevenues({ employee_id: form.getFieldValue('employee_id'), fromDate: dateRange[0], toDate: dateRange[1] }))
        }
    }

    function handleChanegValues(changeValues: any, allValues: any) {
        if (allValues.employee_id > 0) {
            const revenue = parseFloat(allValues.revenue_salary);
            const basic = parseFloat(allValues.basic_salary);
            const bonus = parseFloat(allValues.bonus);
            const fines = parseFloat(allValues.fines);
            setAmountSalary(basic + revenue + bonus - fines);
        }
        if (changeValues.role) {
            console.log(allValues.employee_id)
            if (changeValues.role == 'none') {
                dispatch(actionSetListRevenuesNull());
                setDisableSelectEmployee(true)
                setAmountRevenue(0)
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
            if (changeValues.employee_id > 0) {
                console.log(changeValues.employee_id)
                dispatch(actionGetEmployeeInfo(changeValues.employee_id));
            }
            return;
        }
        if (changeValues.basic_salary) {

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
        const payload:AddSalaryData = {
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
            status:0,
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
                    Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
                    Design, a design language for background applications, is refined by Ant UED Team. Ant
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
                        <Form.Item label="Lương cơ bản" name="basic_salary" rules={[IsNumeric]} >
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
                                <Button type="primary"  htmlType="submit" loading={addSalaryStatus == "loading" ? true : false}>Submit</Button>
                            </Space>
                        </Form.Item>

                    </Col>
                </Row>
            </Form>

            <Row justify="space-between">
                <Col>
                    <Title level={4}> Bảng doanh thu </Title>
                </Col>
                <Col>
                    <RangePicker style={{ marginRight: 10 }} defaultValue={[moment(new Date).startOf("month"), moment(new Date).endOf("month")]} onChange={handleChangeDateRange} />
                    <Button type="primary" loading={getReceiptStatus === "loading" ? true : false} onClick={handleGetRevenue}>Lấy bảng doanh thu</Button>
                </Col>
            </Row>
            <Divider />
            <List
                rowKey="id"
                itemLayout="horizontal"
                loading={getReceiptStatus === "loading" ? true : false}
                dataSource={get(receipts, "data", [])}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={<a href="https://ant.design">{numeral(item.amount).format("0,0")}</a>}
                            description={item.created_at}
                        />
                    </List.Item>
                )}
            />
        </Layout.Content>
    )
}