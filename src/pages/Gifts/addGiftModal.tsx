import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import FileSelectModal from 'components/FileSelectModal';
import { FileType, GiftType } from 'interface';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionAddGift, actionGetGiftList, actionUpdateGift } from 'store/gifts/slice';
import { RootState, useAppDispatch } from 'store/store';

export function AddGiftModal(props: {
    editMode: boolean;
    setEditMode: (param: boolean) => void;
    show: boolean;
    setShow: (param: boolean) => void;
    giftInfo: GiftType | null;
}): JSX.Element {

    const { editMode, setEditMode, show, setShow, giftInfo } = props;
    const dispatch = useAppDispatch();

    const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);
    const [showSelect, setShowSelect] = useState(false);
    const [form] = Form.useForm();

    const addGiftStatus = useSelector((state: RootState) => state.giftReducer.addGiftStatus)
    const updateGiftStatus = useSelector((state: RootState) => state.giftReducer.updateGiftStatus)

    useEffect(() => {
        if (editMode && giftInfo) {
            form.setFieldsValue({
                name: get(giftInfo, "name", ""),
                type: get(giftInfo, "type", ""),
                description: get(giftInfo, "description", ""),
                quantity: get(giftInfo, "quantity", 0),
                condition_point: get(giftInfo, "condition_point", 0),

            })
            setFileSelected([giftInfo.photo])
        } else {
            form.setFieldsValue({
                name: "",
                type: null,
                description: "",
                quantity: 0,
                condition_point: 0,
            })
            setFileSelected([])
        }
    }, [editMode, giftInfo])

    useEffect(() => {
        if (updateGiftStatus === 'success' || addGiftStatus === 'success') {
            setShow(false);
            setEditMode(false);
            dispatch(actionGetGiftList({}))
        }
    }, [updateGiftStatus, addGiftStatus])

    function handleFileSelected(filesSelected: Array<FileType>) {
        setFileSelected(filesSelected);
    }

    function handleSubmit(values: any) {
        const payload = { ...values, type: 1, photo: fileSelected.length > 0 && fileSelected[0].id }
        if (editMode && giftInfo) {
            dispatch(actionUpdateGift({ giftId: giftInfo.id, data: payload }));
        } else {
            dispatch(actionAddGift(payload));
        }
    }

    return (
        <Modal
            title={editMode ? "Cập nhật thông tin quà tặng" : "Thêm quà tặng"}
            visible={show}
            width={1000}
            onCancel={() => {
                setShow(false);
                setEditMode(false);
            }}
            footer={[
                <Button key="btn-cacel" htmlType="reset" form="gift_form">Huỷ bỏ</Button>,
                <Button
                    key="btn-submit"
                    type="primary"
                    htmlType="submit"
                    loading={
                        editMode ? updateGiftStatus === "loading" : addGiftStatus === "loading"
                    }
                    form="gift_form">{editMode ? "Cập nhật" : "Lưu lại"}</Button>,
            ]}
        >
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                id="gift_form"
                form={form}
                onFinish={handleSubmit}
            >
                <Form.Item label="Tên quà tặng" name="name">
                    <Input />
                </Form.Item>
                {/* <Form.Item label="Xếp loại" name="type">
                    <Select>
                        <Select.Option value={1}>Loại 1</Select.Option>
                        <Select.Option value={2}>Loại 2</Select.Option>
                        <Select.Option value={3}>Loại 3</Select.Option>
                    </Select>
                </Form.Item> */}
                <Form.Item label="Điểm điều kiện" name="condition_point">
                    <InputNumber />
                </Form.Item>
                <Form.Item label="Số lượng trong kho" name="quantity">
                    <InputNumber />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item name="photo" label="Hình ảnh">
                    <FileSelectModal
                        defaultSelected={fileSelected}
                        isShow={showSelect}
                        okFunction={handleFileSelected}
                        closeFunction={() => setShowSelect(false)}
                        showSelectedList
                        review={true}
                    >
                        <Button
                            onClick={() => setShowSelect(true)}
                            type="primary"
                            ghost
                            size="middle"
                            icon={<UploadOutlined />}
                        >
                            Chọn files
                        </Button>
                    </FileSelectModal>
                </Form.Item>

            </Form>

        </Modal >
    )
}