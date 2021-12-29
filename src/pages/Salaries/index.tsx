import { Button, Input, Layout, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { actionGetSalaries } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import { useHistory } from 'react-router-dom';

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
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Ngày tạo",
            dataIndex: "date",
            key: "date"
        },
        {
            title: "Lương cơ bản",
            dataIndex: "basic_salary",
            key: "basic_salary"
        },
        {
            title: "Lương doanh thu",
            dataIndex: "revenue_salary",
            key: "revenue_salary"
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions"
        }
    ]

    return (
        <Layout.Content>
            <Space style={{ marginBottom: 30 }}>
                <Input.Search />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push("/salaries-create")}>Lập bảng lương</Button>
            </Space>
            <Table dataSource={get(salaries, "data", [])} columns={columns} loading={getSalariesState == "loading" ? true : false} />;
        </Layout.Content>
    )
}