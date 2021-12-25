import { Input, Layout, Space, Table } from 'antd';
import { get } from 'lodash';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { actionGetSalaries } from 'store/salaries/slice';
import { RootState, useAppDispatch } from 'store/store';
import AddSalary from './addSalary';

export default function Salaries(): JSX.Element {
    const dispatch = useAppDispatch();
    const salaries = useSelector((state: RootState) => state.salariesSlice.salaries);
    const getSalariesState = useSelector((state: RootState) => state.salariesSlice.getSalaries);

    useEffect(() => {
        dispatch(actionGetSalaries())
    },[dispatch])

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
                <AddSalary />
            </Space>
            <Table dataSource={get(salaries, "data", [])} columns={columns} loading={getSalariesState == "loading" ? true : false }/>;
        </Layout.Content>
    )
}