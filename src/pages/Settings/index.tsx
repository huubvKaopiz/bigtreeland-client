import { CloseCircleOutlined, FieldTimeOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Calendar, Collapse, Form, Input, Layout, Space, Tag, Upload } from 'antd';
import FileSelectModal from 'components/FileSelectModal';
import { FileType } from 'interface';
import { get } from 'lodash';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionAddDayoff, actionDeleteDayoff, actionGetDayoffs, actionSetAddDayoffStateIdle, actionSetDeleteDayoffStateIdle } from 'store/settings/dayoff';
import { actionGetSystemSettingInfo, actionUpdateSystemSetting } from 'store/settings/system';
import { RootState, useAppDispatch } from 'store/store';
const { Panel } = Collapse;

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
};

export default function Settings(): JSX.Element {
    const dispatch = useAppDispatch();
    const [daySelected, setDaySelected] = useState(moment(new Date()));
    const [calandarValue, setCalendarValue] = useState(moment("2021-12-01"));
    const [resultFilesModal, setResultFilesModal] = useState(false);
    const [slideFilesSelected, setSlideFilesSelected] = useState<Array<FileType>>([]);
    const [resultFiles, setResultFiles] = useState<Array<FileType>>([]);
    const [showSelect, setShowSelect] = useState(false);

    const [systemInfoForm] = Form.useForm();
    // const [setCollapeKey] = useState('1');

    const dayoffs = useSelector((state: RootState) => state.dayoffReducer.dayoffs);
    const addDayoffState = useSelector((state: RootState) => state.dayoffReducer.addDayoffState);
    const deleteDayoffState = useSelector((state: RootState) => state.dayoffReducer.deleteDayoffState);
    const systemInfo = useSelector((state: RootState) => state.systemSettingReducer.systemSettingInfo);
    const updateSystemInfoState = useSelector((state: RootState) => state.systemSettingReducer.updateSystemSettingState);


    useEffect(() => {
        dispatch(actionGetDayoffs({}));
        dispatch(actionGetSystemSettingInfo({}));
    }, [dispatch])

    useEffect(() => {
        if (addDayoffState === "success" || deleteDayoffState === "success") {
            dispatch(actionGetDayoffs({}));
            dispatch(actionSetAddDayoffStateIdle());
            dispatch(actionSetDeleteDayoffStateIdle());
        }
    }, [dispatch, addDayoffState, deleteDayoffState])

    useEffect(() => {
        if (systemInfo) {
            systemInfoForm.setFieldsValue(systemInfo);
            setSlideFilesSelected(get(systemInfo, "app_slide_files", []))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[systemInfo])


    function dateCellRender(value: Moment) {
        let isDayoff = false;
        const dateValue = moment(value).format("YYYY-MM-DD")
        get(dayoffs, "data", []).forEach((element: { from_date: string, to_date: string }) => {
            if (moment(dateValue).isSame(moment(element.from_date))) {
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

    function handleSlideFilesSelected(filesSelected: Array<FileType>) {
        setSlideFilesSelected(filesSelected);
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

    function handleUpdateSystemtInfo(values: any) {
        // console.log(values)
        const app_slide_files: number[] = [];
        slideFilesSelected.forEach((file) => app_slide_files.push(file.id));
        dispatch(actionUpdateSystemSetting({ ...values, app_slide_files }));
    }

    return (
        <Layout.Content>
            <Collapse defaultActiveKey={['1']} >
                <Panel header={
                    <Space style={{width:"100%", display: "flex", justifyContent: "space-between", alignItems:"center" }}>
                        <span>Thông tin trung tâm</span>
                        <Button type="primary" htmlType="submit" form="setting-form" loading={updateSystemInfoState === 'loading' ? true : false}>
                            Cập nhật
                        </Button>
                    </Space>
                } key="1">
                    <Form {...layout} id="setting-form" onFinish={handleUpdateSystemtInfo} form={systemInfoForm}>
                        <Form.Item name='name' label="Tên trung tâm" >
                            <Input />
                        </Form.Item>
                        <Form.Item name='email' label="Email" rules={[{ type: 'email' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name='phone' label="Điện thoại"  >
                            <Input />
                        </Form.Item>
                        <Form.Item name='address' label="Địa chỉ">
                            <Input />
                        </Form.Item>
                        <Form.Item name='logo' label="Logo file">
                            <Upload>
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item name='config' label="Config file">
                            <Upload>
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item name="slide_files" label="App slide images">
                            <FileSelectModal
                                defaultSelected={slideFilesSelected}
                                isShow={showSelect}
                                okFunction={handleSlideFilesSelected}
                                closeFunction={() => setShowSelect(false)}
                                showSelectedList
                                review={true}
                            >
                                <Button
                                    onClick={() => setShowSelect(true)}
                                    type="default"
                                    size="middle"
                                    icon={<UploadOutlined />}
                                >
                                    Chọn files
                                </Button>
                            </FileSelectModal>
                        </Form.Item>

                        {/* <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 3 }}>
                            <Button type="primary" htmlType="submit" loading={updateSystemInfoState === 'loading' ? true : false}>
                                Cập nhật
                            </Button>
                        </Form.Item> */}
                    </Form>
                </Panel>
                <Panel header="Lịch trung tâm" key="2">
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
                    <Calendar dateCellRender={dateCellRender} onSelect={onSelectDay} onPanelChange={onPanelChange} />
                </Panel>
                {/* <Panel header="This is panel header 3" key="3">
                </Panel> */}
            </Collapse>

        </Layout.Content>
    )
}