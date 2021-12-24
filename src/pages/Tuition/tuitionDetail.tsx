import { Layout, PageHeader, Descriptions, Button, Statistic, Table, Tooltip, Tabs, Space } from 'antd';
import { QuestionCircleOutlined, EditOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { useState } from 'react';
import moment from 'moment';
import { RootState, useAppDispatch } from 'store/store';
import { useParams } from 'react-router-dom';
import { actionGetPeriodTuion } from 'store/tuition/periodslice';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import numeral from 'numeral';
import { PeriodTuitionType, TuitionFeeType } from 'interface';
import EditStdTuition from './editStdTuition';

const dateFormat = "DD-MM-YYYY";
const std_fee_columns = [
    {
        title: 'Họ tên',
        dataIndex: 'student_id',
        key: 'student_id',
        render: function nameCol(student_id: string): JSX.Element {
            return <a>{student_id}</a>
        }
    },
    {
        title: <>Học phí <Tooltip title="Học phí ước tính của kỳ này, dựa trên số buổi học ước tính kỳ này trừ đi số buổi dư kỳ trước"><QuestionCircleOutlined style={{ color: "#f39c12" }} /></Tooltip></>,
        dataIndex: 'tuition',
        key: 'tuition',
        render: function amountCol(amount: number): JSX.Element {
            return <span>{numeral(amount).format("0,0")}</span>;
        },
        // align: 'right',
    },
    {
        title: <>Nợ kỳ trước <Tooltip title="Có thể là nợ học phí do nhập học sau kỳ thu học phí"><QuestionCircleOutlined style={{ color: "#f39c12" }} /></Tooltip></>,
        dataIndex:"debt",
        key: "debt",
        render: function amountCol(amount: number): JSX.Element {
            return <span>{numeral(amount).format("0,0")}</span>;
        },
        // align: 'right',
    },
    {
        title: "Giảm trừ cố định",
        dataIndex: "fixed_deduction",
        key: "fixed_deduction",
        render: function amountCol(amount: number): JSX.Element {
            return <span>{numeral(amount).format("0,0")}</span>;
        },
        // align: 'right',
    },
    {
        title: <>Giảm trừ theo đợt
            <Tooltip title="Giảm trừ học phí tuỳ chỉnh theo đợt">
                <QuestionCircleOutlined style={{ color: "#f39c12" }} />
            </Tooltip>
        </>,
        dataIndex: 'flexible_deduction',
        key: "flexible_deduction",
        render: function amountCol(amount: number): JSX.Element {
            return <span>{numeral(amount).format("0,0")}</span>;
        },
        // align: 'right',
    },
    {
        title: "Thành tiền",
        dataIndex: "residual",
        key: "residual",
        render: function amountCol(amount: number): JSX.Element {
            return <span>{numeral(amount).format("0,0")}</span>;
        },
        // align: 'right',
    },
    {
        title: "Trạng thái",
        dataIndex: 'status',
        key: "status",
    },
    {
        title: "Ghi chú",
        dataIndex: 'note',
        key: "note",
    },
    {
        width: "5%",
        title: "Action",
        key: "action",
        render: function ActionCol(record: TuitionFeeType): JSX.Element {
            return (
                <Tooltip title="Chỉnh sửa">
                    <EditStdTuition
                        stdTuitionFee={record}
                    />
                </Tooltip>
            );
        },
    },
];

const lesson_columns = [
    {
        title: 'Ngày học',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Giáo viên',
        dataIndex: '',
        key: '',
    },
    {
        title: 'Thời gian tạo',
        dataIndex: 'created_at',
        key: 'created_at',
    },
]
const { TabPane } = Tabs;

export default function TuitionDetail():JSX.Element{
    const params = useParams() as {tuition_id:string};
    const dispatch = useAppDispatch();
    const [today, setToday] = useState(moment(new Date()).format(dateFormat));
    const tuitionPeriodInfo = useSelector((state:RootState) => state.periodTuitionReducer.periodTuition);

    console.log(tuitionPeriodInfo, "tuitionPeriodInfo");
    
    // const estTuitionFee = (fee_per_session:string, session_num:string) => {
        
    // }
    const renderContent = (column = 2) => (
        <Descriptions size="middle" column={column}>
          <Descriptions.Item label="Lớp học">
                {get(tuitionPeriodInfo, "class.name", "")}
            </Descriptions.Item>
            <Descriptions.Item label="Chu kỳ">
                {get(tuitionPeriodInfo, "from_date", "")} - {get(tuitionPeriodInfo, "to_date", "")}
            </Descriptions.Item>
            <Descriptions.Item
                label={<>Số buổi ước tính <Tooltip title="Số buổi học phí ước tính dựa theo lịch học của lớp và khoảng thời gian của chu kỳ học phí"><QuestionCircleOutlined style={{ color: "#f39c12" }} /></Tooltip></>}>
                <span>{get(tuitionPeriodInfo, "est_session_num", 0)}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Học phí/buổi">
                <span style={{ float: "right" }}>{numeral(get(tuitionPeriodInfo, "class.fee_per_session", "")).format("0,0")}</span>
            </Descriptions.Item>
            <Descriptions.Item
                label={<>Số buổi đã học</>}>
                <span style={{ color: "#e74c3c" }}>{get(tuitionPeriodInfo, "class.act_session_num", "")}</span>
            </Descriptions.Item>
        </Descriptions>
    );
    const extraContent = (
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            justifyContent: 'flex-end',
          }}
        >
          <Statistic
            title="Học Phí Ước Tính"
            // prefix="$"
            value={numeral(get(tuitionPeriodInfo, "class.fee_per_session", 0)*get(tuitionPeriodInfo, "est_session_num", 0)).format("0,0")}
            style={{
              marginRight: 32,
              fontWeight: 600,
            }}/>
          <Statistic
            title="Hoàn Thành"
            value="20/30"
            style={{
                fontWeight: 600,
            }}/>
        </div>
    );
    const Content = (props:{children:any, extra:any}):JSX.Element => {
        const {children, extra} = props;
        return(
            <div className="content" style={{display: "flex"}}>
                <div className="main">{children}</div>
                <div className="extra">{extra}</div>
            </div>
        )};

    useEffect(()=>{
        if(params.tuition_id){
            dispatch(actionGetPeriodTuion(parseInt(params.tuition_id)));
        }
    },[dispatch, params.tuition_id])
    
    return(
        <Layout.Content>
            <PageHeader
				className="site-page-header-responsive"
                title="Chi tiết học phí"
                style={{ backgroundColor: "white" }}
                footer={
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Học phí mỗi học sinh" key="stdTuition">
                            <Table
                                rowKey="student_id"
                                bordered
                                style={{ paddingTop: 20 }}
                                dataSource={get(tuitionPeriodInfo,"tuition_fees",[])}
                                columns={std_fee_columns}
                                pagination={{ defaultPageSize: 100 }}
                            />
                        </TabPane>
                        <TabPane tab="Danh sách buổi học" key="lessionInfo">
                            <Table
                                rowKey="lesson_id"
                                bordered
                                style={{ paddingTop: 20 }}
                                dataSource={get(tuitionPeriodInfo,"lessons",[])}
                                columns={lesson_columns}
                                pagination={{ defaultPageSize: 100 }}
                            />
                        </TabPane>
                    </Tabs>
                  }
			>
                <Content extra={extraContent}>{renderContent()}</Content>
			</PageHeader>
        </Layout.Content>
    )
}