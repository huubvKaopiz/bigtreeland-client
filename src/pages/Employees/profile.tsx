import { Button, Descriptions, Tag } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { RoleType } from 'interface';
import { get } from 'lodash';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';

export function EmpProfile(): JSX.Element {

    const [show, setShow] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <>
            <Button type="link" onClick={() => setShow(true)}>Thông tin cá nhân</Button>
            <Modal
                title="Thông tin cá nhân"
                width={1000}
                visible={show}
                onCancel={() => setShow(false)}
                cancelText=""
                footer={[
                    <Button key="btnOK" type="primary" onClick={() => setShow(false)}>OK</Button>
                ]}
            >
                <Descriptions bordered>
                    <Descriptions.Item label="Họ tên"><strong>{get(user, "profile.name", "")}</strong></Descriptions.Item>
                    <Descriptions.Item label="ĐT">{get(user, "phone", "")}</Descriptions.Item>
                    <Descriptions.Item label="Email">{get(user, "profile.email", "")}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò">{get(user, "roles", []).map((role: RoleType) => {
                        <Tag color="orange">{role.name}</Tag>
                    })}</Descriptions.Item>
                    <Descriptions.Item label="Ngày vào làm">---</Descriptions.Item>
                    <Descriptions.Item span={3} label="Địa chỉ">{get(user, "profile.address", "")}</Descriptions.Item>
                    
                </Descriptions>

            </Modal>
        </>
    )
}