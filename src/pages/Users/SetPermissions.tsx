/* eslint-disable no-mixed-spaces-and-tabs */
import React, { useEffect, useState } from "react";
import { Layout, PageHeader, Table, Checkbox, Button, notification, Alert, Tag } from "antd";
// import { CloseOutlined } from '@ant-design/icons';
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { actionGetPermissions, actionGetUserPermissions, actionSetUserPermissions, PermistionType } from "store/permissions/slice";
import { RootState, useAppDispatch } from "store/store";
import { getPermissionDes } from "utils/ultil";

interface GrantedPermissionType {
    object: string,
    granted: {
        store: number,
        update: number,
        show: number,
        index: number,
        destroy: number,
        other: {
            code: string,
            granted: number,
        }[],
    }
}

enum PermissionActions {
    STORE = "store",
    UPDATE = "update",
    SHOW = "show",
    INDEX = "index",
    DESTROY = "destroy",
    OTHER = "other"
}

export function SetUserPermissions(): JSX.Element {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const params = useParams() as { user_id: string };


    const [grantedPermissions, setGrantedPermissions] = useState<GrantedPermissionType[]>([])
    const [grantedUserPermissions, setGrantedUserPermissions] = useState<{ id: number, granted: boolean }[]>([])

    const [submitting, setSubmitting] = useState(false);

    //Application state
    const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);
    const userPermissions = useSelector((state: RootState) => state.permissionReducer.userPermissions);
    const loading = useSelector((state: RootState) => state.permissionReducer.getUserPermissionsState);
    useEffect(() => {
        dispatch(actionGetPermissions())
        dispatch(actionGetUserPermissions(+params.user_id))
    }, [dispatch, params])

    useEffect(() => {
        if (get(userPermissions,"id",0) === +params.user_id) {
            let object = '';
            let granted = 0;
            const per_list: GrantedPermissionType[] = [];
            const user_granted_permissions: { id: number, granted: boolean }[] = [];
            permissions && permissions.forEach((p: PermistionType) => {
                let r_granted = false; 
                for (let index = 0; index < get(userPermissions,"roles",[]).length; index++) {
                    const gr_index = get(userPermissions,"roles",[])[index].permissions.findIndex((per) => per.name === p.name);
                    if(gr_index >= 0){
                        r_granted = true;
                        break;
                    }
                }
                const u_granted =  get(userPermissions, "permissions", []).findIndex((granted) => granted.name === p.name) >= 0
                granted = r_granted === true ? 2 : u_granted === true ? 1 : 0;
                const perArray = p.name.split('.');
                const isOther = perArray[1] != 'store' && perArray[1] != 'update' && perArray[1] != 'show' && perArray[1] != 'index' && perArray[1] != 'destroy';
                if (object === '' || object != perArray[0]) {
                    object = perArray[0];
                    per_list.push({
                        object,
                        granted: {
                            store: perArray[1] === 'store' ? granted : 0,
                            update: perArray[1] === 'update' ? granted : 0,
                            show: perArray[1] === 'show' ? granted : 0,
                            index: perArray[1] === 'index' ? granted : 0,
                            destroy: perArray[1] === 'destroy' ? granted : 0,
                            other: isOther ? [{
                                code: perArray[1],
                                granted
                            }] : []
                        }
                    })
                } else {
                    const index = per_list.findIndex((ob) => ob.object === object);
                    if (isOther) {
                        per_list[index].granted.other.push({
                            code: perArray[1],
                            granted,
                        })
                    } else {
                        per_list[index] = {
                            ...per_list[index],
                            granted: {
                                store: perArray[1] === 'store' ? granted : per_list[index].granted.store,
                                update: perArray[1] === 'update' ? granted : per_list[index].granted.update,
                                show: perArray[1] === 'show' ? granted : per_list[index].granted.show,
                                destroy: perArray[1] === 'destroy' ? granted : per_list[index].granted.destroy,
                                index: perArray[1] === 'index' ? granted : per_list[index].granted.index,
                                other: per_list[index].granted.other
                            }
                        }
                    }

                }
                user_granted_permissions.push({ id: p.id, granted:u_granted })
            })
            // console.log(per_list)
            setGrantedPermissions(per_list)
            setGrantedUserPermissions(user_granted_permissions)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissions, userPermissions])


    function handleCheckboxChange(granted: boolean, record: GrantedPermissionType, action: PermissionActions, otherIndex: number) {

        let per_name = record.object + ".";
        if (otherIndex === -1) {
            per_name += action;
        } else per_name += record.granted.other[otherIndex].code;
        const permission = permissions?.find((per) => per.name === per_name);
        // console.log(permission?.id, granted)
        if (permission === undefined) {
            notification.error({ message: `Không thể tìm thấy permission tương ứng với per_name: ${per_name}!` })
        } else {
            const index = grantedUserPermissions.findIndex((gr) => gr.id === permission.id);
            if (index >= 0) grantedUserPermissions[index].granted = granted;
            setGrantedUserPermissions([...grantedUserPermissions]);
        }

    }
    // console.log(grantedPermissions)

    function handleSubmit() {
        const permission_add_ids: number[] = [];
        const permission_delete_ids: number[] = [];
        grantedUserPermissions.forEach((gr) => {
            const index = get(userPermissions, "permissions", []).findIndex((rp) => rp.id === gr.id);
            if (index === -1 && gr.granted === true) permission_add_ids.push(gr.id);
            else if (index >= 0 && gr.granted === false) permission_delete_ids.push(gr.id)
        })
        if (userPermissions) {
            setSubmitting(true);
            dispatch(actionSetUserPermissions({
                user_id: userPermissions.id,
                permission_add_ids,
                permission_delete_ids
            })).finally(() => {
                setSubmitting(false);
                dispatch(actionGetUserPermissions(userPermissions.id))
            })
        }
    }


    const permissions_columns: any = [
        {
            title: 'Đối tượng',
            dataIndex: 'object',
            key: 'name',
            width: 100,
            render: function showCol(text: string): JSX.Element {
                return (
                    <a>{getPermissionDes(text)}</a>
                )
            }
        },
        {
            title: 'Quyền',
            children: [
                {
                    title: 'Xem',
                    dataIndex: 'show',
                    key: 'show',
                    width: 50,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                <Checkbox
                                    defaultChecked={record.granted.show > 0}
                                    disabled={record.granted.show === 2}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.SHOW, -1)} />
                            </>
                        )
                    }
                },
                {
                    title: 'Xem DS',
                    dataIndex: 'index',
                    key: 'index',
                    width: 50,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                <Checkbox
                                    defaultChecked={record.granted.index > 0}
                                    disabled={record.granted.index === 2}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.INDEX, -1)} />
                            </>
                        )
                    }
                },
                {
                    title: 'Thêm',
                    key: 'add',
                    width: 50,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                <Checkbox
                                    defaultChecked={record.granted.store > 0}
                                    disabled={record.granted.store === 2}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.STORE, -1)} />
                            </>
                        )
                    }
                },
                {
                    title: 'Sửa',
                    key: 'edit',
                    width: 50,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                  <Checkbox
                                    defaultChecked={record.granted.update > 0}
                                    disabled={record.granted.update === 2}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.UPDATE, -1)} />
                            </>
                        )
                    }
                },

                {
                    title: 'Xoá',
                    key: 'del',
                    width: 50,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                  <Checkbox
                                    defaultChecked={record.granted.destroy > 0}
                                    disabled={record.granted.destroy === 2}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.DESTROY, -1)} />
                            </>
                        )
                    }
                },

                {
                    title: 'Khác',
                    key: 'other',
                    width: 150,
                    render: function showCol(text: string, record: GrantedPermissionType): JSX.Element {
                        return (
                            <>
                                {
                                    record.granted.other.map((per, index) =>
                                        <div key={per.code}>
                                            <Checkbox key={per.code}
                                                defaultChecked={per.granted > 0}
                                                disabled={per.granted === 2}
                                                onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.OTHER, index)}>
                                                {getPermissionDes(per.code)}
                                            </Checkbox>
                                        </div>

                                    )
                                }
                            </>
                        )
                    }
                },
            ],
        },
    ];

    return (
        <Layout.Content>
            <PageHeader
                className="site-page-header"
                onBack={() => history.push("/users")}
                title={<>Phân quyền cho <span style={{ color: "#d35400", marginRight:10 }}> {get(userPermissions, "profile.name", "")}</span>
                    {
                        get(userPermissions,"roles",[]).map((role) => <Tag key={role.id} color="orange">{role.name}</Tag>)
                    }
                </>}
                subTitle=""
                extra={[
                    // <Button key="2">Làm lại</Button>,
                    <Button key="1" type="primary" onClick={() => handleSubmit()} loading={submitting}>
                        Lưu thay đổi
                    </Button>,
                ]}
            />
            <Alert
                style={{marginBottom:20, marginTop:20}}
                message="Lưu ý chỉ phân quyền cho người dùng khi muốn mở rộng quyền từ vai trò người dùng. Vì vậy nên phân quyền cho vai trò trước khi phân thêm quyền mở rộng cho người dùng"
                type="warning"
                closable
            />
            <Table
                scroll={{ y: 600 }}
                loading={loading === "loading" ? true : false}
                columns={permissions_columns}
                dataSource={grantedPermissions}
                bordered
                pagination={{ defaultPageSize: 1000 }}
                size="middle"
            />,
        </Layout.Content>
    )
}

