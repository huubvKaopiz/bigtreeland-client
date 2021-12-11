import { Descriptions, Layout, PageHeader, DatePicker, Select, Table, Space, Form, Pagination, Input } from 'antd';
import { ParentType } from 'interface';
import { get } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { actionGetClass, actionGetClasses } from 'store/classes/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudents } from 'store/students/slice';
import { countDaysInDateRange } from 'utils/dateUltils';

const { Option } = Select;
const { RangePicker } = DatePicker;
// const dateFormat = 'YYYY/MM/DD';

export default function AddTuition(): JSX.Element {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [estSessionNum, setEstSessionNum] = useState(0);
    const [residualSessionNum, setrResidualSessionNum] = useState(0);
    const classesList = useSelector((state: RootState) => state.classReducer.classes);
    const classInfo = useSelector((state: RootState) => state.classReducer.classInfo);
    const students = useSelector((state: RootState) => state.studentReducer.students);

    useEffect(() => {
        dispatch(actionGetClasses({}));
    }, [dispatch])

    // count days in period
    useEffect(() => {
        if (classInfo) {
            dispatch(actionGetStudents({ class_id: classInfo.id }));
            setrResidualSessionNum(get(classInfo, "period_tuitions", []).length > 0 ? get(classInfo, "period_tuitions", [])[0].est_session_num - get(classInfo, "act_session_num", 0) : 0)
            if (classInfo.schedule.length > 0) {
                let count = 0;
                for (let index = 0; index < classInfo.schedule.length; index++) {
                    const day = classInfo.schedule[index];
                    count += countDaysInDateRange(fromDate, toDate, day);
                }
                setEstSessionNum(count)
            }
        }
    }, [classInfo, dispatch, fromDate, toDate])

    function handleChangePeriod(dates: any, dateString: [string, string]) {
        setFromDate(dateString[0]);
        setToDate(dateString[1]);
        // console.log(countDaysInDateRange(dateString[0], dateString[1], 2))
    }

    function handleChangeClass(classID: number) {
        dispatch(actionGetClass(classID))
    }

    function estPeriodTuitionFee(): number {
        const fee = get(classInfo, "fee_per_session", 0);
        return (estSessionNum - residualSessionNum)*fee
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: function nameCol(name: string): JSX.Element {
                return <a>{name}</a>
            }
        },
        // {
        //     title: 'Số ĐT',
        //     dataIndex: 'parent',
        //     key: 'phone',
        //     render: function parentCol(parent: ParentType): JSX.Element {
        //         return <span>{get(parent, "phone", "")}</span>
        //     }
        // },
        {
            title: 'Học phí',
            dataIndex: 'tuition',
            key: 'tuition',
            render: function tuitionCol(): JSX.Element {
                return <span>{estPeriodTuitionFee}</span>
            }
        },
        {
            title: "Nợ kỳ trước",
            key: "residual",
            render: function residualCol(): JSX.Element {
                return (
                    <>
                        <span style={{color:"#e74c3c"}}>{numeral(300000).format("0,0")}</span>
                    </>
                )
            }
        },
        {
            title: "Giảm trừ cố định",
            key: "fixed_deduction",
            width:180,
            render: function fixedDeductionCol(): JSX.Element {
                return (
                    <>
                        <Input addonBefore={(
                            <Select defaultValue={0} style={{ width: 65 }}>
                                <Option key={0} value={0}>%</Option>
                                <Option key={1} value={1}>0.0</Option>
                            </Select>
                        )} />
                    </>
                )
            }
        },
        {
            title: "Giảm trừ theo đợt",
            key: "deduction",
            width:180,
            render: function deductionCol(): JSX.Element {
                return (
                    <>
                          <Input addonBefore={(
                            <Select defaultValue={0} style={{ width: 65 }}>
                                <Option key={0} value={0}>%</Option>
                                <Option key={1} value={1}>0.0</Option>
                            </Select>
                        )} />
                    </>
                )
            }
        },
        {
            title: "Thành tiền",
            key: "residual",
            render: function residualCol(): JSX.Element {
                return (
                    <>
                        <strong style={{color:"#2980b9"}}>{numeral(300000).format("0,0")}</strong>
                    </>
                )
            }
        },
    ];
    // console.log(classInfo)

    return (
        <Layout.Content>
            <PageHeader
                className="site-page-header"
                onBack={() => history.push('/payments/tuition')}
                title="Lập bảng học phí"
                subTitle={get(classInfo, "name,")}
                style={{ backgroundColor: "white" }}
            >
                <Descriptions size="default" column={2} layout="horizontal" bordered>
                    <Descriptions.Item label="Lớp học">
                        <Select defaultValue={0} style={{ width: 280 }} onChange={handleChangeClass}>
                            <Option key={0} value={0}>Chọn lớp học...</Option>
                            {
                                get(classesList, "data", []).map((cl: { id: number, name: string }) => {
                                    return (
                                        <Option key={cl.id} value={cl.id}>{cl.name}</Option>
                                    )
                                })
                            }

                        </Select>
                    </Descriptions.Item>
                    <Descriptions.Item label="Học phí/buổi">
                        <strong>{numeral(get(classInfo, "fee_per_session", 0)).format("0,0")}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chu kỳ">
                        <RangePicker
                            ranges={{
                                '1 Tháng': [moment().startOf('month'), moment().endOf('month')],
                                '2 Tháng': [moment().startOf('month'), moment().add(1, 'month').endOf('month')],
                                '3 Tháng': [moment().startOf('month'), moment().add(2, 'months').endOf('month')]
                            }}
                            dateRender={current => {
                                const style = { border: "", borderRadius: "" };
                                if (current.date() === 2 || current.date() === 5) {
                                    style.border = '1px solid #1890ff';
                                    style.borderRadius = '50%';
                                }
                                return (
                                    <div className="ant-picker-cell-inner" style={style}>
                                        {current.date()}
                                    </div>
                                );
                            }}
                            onChange={handleChangePeriod}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Số buổi ước tính kỳ này">
                        <strong>{estSessionNum}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Học phí ước tính">
                        <strong>{numeral(estPeriodTuitionFee()).format("0,0")}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số buổi dư kỳ trước">
                        <strong style={{ color: "#e74c3c" }}>{residualSessionNum}</strong>
                    </Descriptions.Item>
                </Descriptions>
            </PageHeader>
            <strong style={{ marginTop: 40, padding: 20 }}>Học phí mỗi học sinh</strong>
            <Table bordered style={{ padding: 20 }} dataSource={get(students, "data", [])} columns={columns} />
        </Layout.Content>
    )
}