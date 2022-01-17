import { Button, DatePicker, Layout, List, Select, Space, Typography } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'store/store';
import { get } from 'lodash';
import moment, { Moment } from 'moment';
import { CreateStudySummary } from './createModal';
import { actionGetStudySummaryList } from 'store/study-summary/slice';
import { actionGetClasses } from 'store/classes/slice';

const { Option } = Select;
export function StudySumaryBoard(): JSX.Element {
    const history = useHistory();
    const dispatch = useAppDispatch();

    const classList = useSelector((state: RootState) => state.classReducer.classes)
    const studySummaryList = useSelector((state: RootState) => state.studySummaryReducer.studySummaryList)

    useEffect(() => {
        dispatch(actionGetStudySummaryList({}));
        dispatch(actionGetClasses({}));
    }, [dispatch])

    function handleChangeClass(classID: number) {
        if (classID > 0) {
            dispatch(actionGetStudySummaryList({ class_id: classID }));
        }else {
            dispatch(actionGetStudySummaryList({}));
        }
    }

    function onChangeDateFilter(date: Moment | null) {
        console.log(date)
    }

    return (
        <Layout.Content>
            <Space style={{ marginBottom: 20, marginTop: 20 }}>
                <DatePicker style={{ width: 200 }} placeholder="Lọc theo quý" onChange={onChangeDateFilter} picker="quarter" />
                <Select defaultValue={0} style={{ width: 280 }} onChange={handleChangeClass}>
                    <Option value={0}>Tất cả</Option>
                    {get(classList, "data", []).map((cl) => (
                        <Option value={cl.id} key={cl.id}>
                            {" "}
                            {cl.name}
                        </Option>
                    ))}
                </Select>
                <CreateStudySummary classList={get(classList, "data", [])} />
            </Space>
            <List
                itemLayout="horizontal"
                dataSource={get(studySummaryList, "data", [])}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            // avatar={<TableOutlined />}
                            title={<a 
                                    onClick={()=>history.push({pathname:`/study-summary-detail/${item.id}`,state:{summaryInfo:item}})}>
                                        {`${moment(item.from_date).format("DD/MM/YYYY")} - ${moment(item.to_date).format("DD/MM/YYYY")}`}
                                    </a>}
                            description={get(item,"class.name","")}
                        />
                    </List.Item>
                )}
            />,
        </Layout.Content>
    )
}