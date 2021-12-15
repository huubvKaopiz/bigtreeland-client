import { Alert, Button, Calendar, Collapse, Layout, Space, Tag } from 'antd';
import { FieldTimeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'store/store';
import { actionAddDayoff, actionDeleteDayoff, actionGetDayoffs, actionSetAddDayoffStateIdle, actionSetDeleteDayoffStateIdle } from 'store/settings/dayoff';
import { get } from 'lodash';
const { Panel } = Collapse;
export default function Settings(): JSX.Element {
    const dispatch = useAppDispatch();
    const [daySelected, setDaySelected] = useState(moment("2021-01-01"));
    const [calandarValue, setCalendarValue] = useState(moment("2021-12-01"));
    // const [setCollapeKey] = useState('1');

    const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
    const addDayoffState = useSelector((state: RootState) => state.dayoffReducer.addDayoffState);
    const deleteDayoffState = useSelector((state: RootState) => state.dayoffReducer.deleteDayoffState);

    useEffect(() => {
        dispatch(actionGetDayoffs({}));
    }, [dispatch])

    useEffect(() => {
        if (addDayoffState === "success" || deleteDayoffState === "success") {
            dispatch(actionGetDayoffs({}));
            dispatch(actionSetAddDayoffStateIdle());
            dispatch(actionSetDeleteDayoffStateIdle());
        }
    }, [dispatch, addDayoffState, deleteDayoffState])


    function dateCellRender(value: Moment) {
        let isDayoff = false;
        get(dayoffs, "data", []).forEach((element: { from_date: string, to_date: string }) => {
            if (value.isSame(moment(element.from_date)) ||
                value.isSame(moment(element.to_date)) ||
                value.isBetween(moment(element.from_date), moment(element.to_date))) {
                isDayoff = true;
            }
        });
        if (isDayoff) {
            return (
                <>
                    <Tag color="#f50">Ngày nghỉ</Tag>
                </>
            )
        }
    }

    function checkDayOff(): number {
        let isDayoff = -1;
        get(dayoffs, "data", []).forEach((element: { id: number, from_date: string, to_date: string }) => {
            if (daySelected.isSame(moment(element.from_date)) ||
                daySelected.isSame(moment(element.to_date)) ||
                daySelected.isBetween(moment(element.from_date), moment(element.to_date))) {
                isDayoff = element.id;
            }
        });
        return isDayoff;
    }

    function onPanelChange(value: any) {
        setCalendarValue(value)
    }

    function onSelectDay(value: Moment) {
        setDaySelected(value);
    }

    function handleSubmitDayOff() {
        if (daySelected) {
            dispatch(actionAddDayoff(
                { from_date: moment(daySelected).format("YYYY-MM-DD"), to_date: moment(daySelected).format("YYYY-MM-DD") }))
        }
    }

    function handleSubmitDeleteDayoff() {
        let d_id = -1;
        get(dayoffs, "data", []).forEach((element: { id: number, from_date: string, to_date: string }) => {
            if (daySelected.isSame(moment(element.from_date)) ||
                daySelected.isSame(moment(element.to_date)) ||
                daySelected.isBetween(moment(element.from_date), moment(element.to_date))) {
                d_id = element.id;
            }
        });

        if (d_id > -1) {
            dispatch(actionDeleteDayoff(d_id));
        }
    }

    return (
        <Layout.Content>
            <Collapse defaultActiveKey={['1']} >
                <Panel header="Lịch trung tâm" key="1">
                    <Space>
                        <Alert message={`Ngày đã chọn: ${daySelected && daySelected.format('YYYY-MM-DD')}`} />
                        {
                            checkDayOff() > -1 ? <Button loading={deleteDayoffState === "loading"} type="primary" danger icon={<CloseCircleOutlined />} onClick={handleSubmitDeleteDayoff}>Xoá ngày nghỉ</Button> :
                                <Button type="primary"
                                    icon={<FieldTimeOutlined />}
                                    onClick={handleSubmitDayOff}
                                    loading={addDayoffState === "loading"}
                                >
                                    Đặt ngày nghỉ
                                </Button>
                        }
                    </Space>
                    <Calendar dateCellRender={dateCellRender} value={daySelected} onSelect={onSelectDay} onPanelChange={onPanelChange} />
                </Panel>
                <Panel header="This is panel header 2" key="2">
                </Panel>
                <Panel header="This is panel header 3" key="3">
                </Panel>
            </Collapse>,

        </Layout.Content>
    )
}