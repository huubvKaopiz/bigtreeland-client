/* eslint-disable no-mixed-spaces-and-tabs */
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, List, message, Modal, Select, Space } from "antd";
import { RoleType } from "interface";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionSetRoleForUsers } from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetUsers } from "store/users/slice";

interface RoleUserType {
    id: number;
    name: string;
    phone: number | undefined;
}

const { Option } = Select;

export function RoleUsers(prop: { roleInfo: RoleType, show: boolean, setShow: (param: boolean) => void }): JSX.Element {
    const dispatch = useAppDispatch();
    const { roleInfo, show, setShow } = prop
    const [roleUsers, setRoleUsers] = useState<RoleUserType[]>([]);
    const [remainUsers, setRemainUsers] = useState<RoleUserType[]>([]);
    const [userSelected, setUserSelected] = useState<number | undefined>();
    const [submitting, setSubmitting] = useState(false);
    //Application state
    const users = useSelector((state: RootState) => state.userReducer.users);

    useEffect(() => {
        dispatch(actionGetUsers({ per_page: 1000 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const role_users: RoleUserType[] = [];
        const remain_users: RoleUserType[] = [];
        get(roleInfo, "users", []).forEach((user) => {
            role_users.push({
                id: user.id,
                name: get(user, "profile.name", ""),
                phone: user.phone
            })
        })

        get(users, "data", []).forEach((user) => {
            if (role_users.findIndex((u) => u.id === user.id) === -1) {
                remain_users.push({
                    id: user.id,
                    name: get(user, "profile.name", ""),
                    phone: user.phone
                })
            }
        })
        setRoleUsers(role_users);
        setRemainUsers(remain_users);
    }, [roleInfo, users])




    function handleDeleteRoleUser(uID: number) {
        const deleteIndex = roleUsers.findIndex((u) => u.id === uID);
        if (deleteIndex >= 0) {
            const deleted = roleUsers.splice(deleteIndex, 1);
            remainUsers.push(deleted[0])
            setRoleUsers([...roleUsers]);
            setRemainUsers([...remainUsers]);
        }
    }

    function handleSelectedRoleUser() {
        if (userSelected === undefined) return;
        const deleteIndex = remainUsers.findIndex((u) => u.id === userSelected);
        if (deleteIndex >= 0) {
            const added = remainUsers.splice(deleteIndex, 1);
            roleUsers.push(added[0]);
            setRemainUsers([...remainUsers]);
            setRoleUsers([...roleUsers]);

        }
        setUserSelected(undefined);
    }

    function handleSubmit() {
        // if(roleInfo === undefined) return;
        const add_user_ids: number[] = [];
        const remove_user_ids: number[] = [];

        get(roleInfo, "users", []).forEach((u) => {
            if (roleUsers.findIndex((ru) => ru.id === u.id) === -1) remove_user_ids.push(u.id);
        })
        roleUsers.forEach((ru) => {
            if (get(roleInfo, "users", []).findIndex((u) => u.id === ru.id) === -1) add_user_ids.push(ru.id)
        })
        if (get(roleInfo, "id", 0) === 0) {
            message.warning({ message: "Kh??ng t??m th???y vai tr??!" });
            return;
        }
        setSubmitting(true);
        dispatch(actionSetRoleForUsers({
            role_id: roleInfo.id,
            add_user_ids,
            remove_user_ids
        })).finally(() => setSubmitting(false))
    }
    return (
        <>

            <Modal
                width={600}
                visible={show}
                onCancel={() => setShow(false)}
                closable
                title="Danh s??ch ng?????i d??ng"
                okText="L??u l???i"
                cancelText="Hu??? b???"
                footer={[
                    <Button key="btncancel" onClick={() => setShow(false)}>Hu??? b???</Button>,
                    <Button loading={submitting} key="btnsubmit" type="primary" onClick={() => handleSubmit()}>L??u l???i</Button>,

                ]}
            >
                {
                    roleUsers.length > 0 ?
                        <List
                            size="small"
                            dataSource={roleUsers}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Button key="btnDelete" danger type="text" icon={<CloseOutlined />} onClick={() => handleDeleteRoleUser(item.id as number)} />]}
                                >
                                    <a>{item.name}</a> {item.phone}
                                </List.Item>
                            )}
                        /> : ""
                }
                <Space style={{ paddingTop: 20 }}>
                    <Select
                        style={{ width: 320 }}
                        placeholder="Th??m ng?????i d??ng"
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        value={userSelected}
                        onChange={(val: number) => setUserSelected(val)}>
                        {
                            remainUsers.map((user, index: number) =>
                                <Option key={index} value={user.id} label={user.name}><a>{user.name}</a> {user.phone}</Option>
                            )
                        }
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleSelectedRoleUser()} />
                </Space>
            </Modal>
        </>
    )
}

