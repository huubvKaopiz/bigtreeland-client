/* eslint-disable no-mixed-spaces-and-tabs */
import React, { useEffect, useState } from "react";
import { Layout, PageHeader, Table, Checkbox, message, Button, notification } from "antd";
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { actionGetPermissions, actionSetRolePermissions, PermistionType } from "store/permissions/slice";
import { RootState, useAppDispatch } from "store/store";
import { getPermissionDes } from "utils/ultil";
import { actionGetRoleInfo } from "store/roles/slice";

interface RolePermissionType {
	object: string,
	granted: {
		store: boolean,
		update: boolean,
		show: boolean,
		index: boolean,
		destroy: boolean,
		other: {
			code: string,
			granted: boolean,
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

export function SetRolePermissions(): JSX.Element {
	const history = useHistory();
	const dispatch = useAppDispatch();
	const params = useParams() as { role_id: string };


	const [rolePermissions, setRolePermissions] = useState<RolePermissionType[]>([])
	const [grantedPermissions, setGrantedPermissions] = useState<{ id: number, granted: boolean }[]>([])
	const [submitting, setSubmitting] = useState(false);

	//Application state
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);
	const roleInfo = useSelector((state: RootState) => state.roleReducer.roleInfo)
	const loading = useSelector((state: RootState) => state.roleReducer.statusGetRoleInfo)
	useEffect(() => {
		dispatch(actionGetPermissions())
		dispatch(actionGetRoleInfo(+params.role_id))
	}, [dispatch, params])

	useEffect(() => {
		if (get(roleInfo, "id", 0) === +params.role_id) {
			let object = '';
			const per_list: RolePermissionType[] = [];
			const granted_permissions: { id: number, granted: boolean }[] = [];
			permissions && permissions.forEach((p: PermistionType) => {
				const granted = get(roleInfo, "permissions", []).findIndex((granted) => granted.name === p.name) >= 0
				const perArray = p.name.split('.');
				const isOther = perArray[1] != 'store' && perArray[1] != 'update' && perArray[1] != 'show' && perArray[1] != 'index' && perArray[1] != 'destroy';
				if (object === '' || object != perArray[0]) {
					object = perArray[0];
					per_list.push({
						object,
						granted: {
							store: perArray[1] === 'store' ? granted : false,
							update: perArray[1] === 'update' ? granted : false,
							show: perArray[1] === 'show' ? granted : false,
							index: perArray[1] === 'index' ? granted : false,
							destroy: perArray[1] === 'destroy' ? granted : false,
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
				granted_permissions.push({ id: p.id, granted })
			})
			// console.log(per_list)
			setRolePermissions(per_list)
			setGrantedPermissions(granted_permissions)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [permissions, roleInfo])


	function handleCheckboxChange(granted: boolean, record: RolePermissionType, action: PermissionActions, otherIndex: number) {

		let per_name = record.object + ".";
		if (otherIndex === -1) {
			per_name += action;
		} else per_name += record.granted.other[otherIndex].code;
		const permission = permissions?.find((per) => per.name === per_name);
		// console.log(permission?.id, granted)
		if (permission === undefined) {
			notification.error({ message: `Không thể tìm thấy permission tương ứng với per_name: ${per_name}!` })
		} else {
			const index = grantedPermissions.findIndex((gr) => gr.id === permission.id);
			if (index >= 0) grantedPermissions[index].granted = granted;
			setGrantedPermissions([...grantedPermissions]);
		}

	}
	// console.log(grantedPermissions)

	function handleSubmit() {
		const permission_add_ids: number[] = [];
		const permission_delete_ids: number[] = [];
		grantedPermissions.forEach((gr) => {
			const index = get(roleInfo, "permissions", []).findIndex((rp) => rp.id === gr.id);
			if (index === -1 && gr.granted === true) permission_add_ids.push(gr.id);
			else if (index >= 0 && gr.granted === false) permission_delete_ids.push(gr.id)
		})
		if (roleInfo) {
			setSubmitting(true);
			dispatch(actionSetRolePermissions({
				role_id: roleInfo.id,
				permission_add_ids,
				permission_delete_ids
			})).finally(() => {
				setSubmitting(false);
				dispatch(actionGetRoleInfo(roleInfo.id))
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
					dataIndex: 'age',
					key: 'age',
					width: 50,
					render: function showCol(text: string, record: any): JSX.Element {
						return (
							<>
								<Checkbox
									defaultChecked={record.granted.show}
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
                    render: function showCol(text: string, record: RolePermissionType): JSX.Element {
                        return (
                            <>
                                <Checkbox
                                    defaultChecked={record.granted.index}
                                    onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.INDEX, -1)} />
                            </>
                        )
                    }
                },
				{
					title: 'Thêm',
					key: 'add',
					width: 50,
					render: function showCol(text: string, record: RolePermissionType): JSX.Element {
						return (
							<>
								<Checkbox
									defaultChecked={record.granted.store}
									onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.STORE, -1)} />
							</>
						)
					}
				},
				{
					title: 'Sửa',
					key: 'edit',
					width: 50,
					render: function showCol(text: string, record: RolePermissionType): JSX.Element {
						return (
							<>
								<Checkbox
									defaultChecked={record.granted.update}
									onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.UPDATE, -1)} />
							</>
						)
					}
				},

				{
					title: 'Xoá',
					key: 'del',
					width: 50,
					render: function showCol(text: string, record: RolePermissionType): JSX.Element {
						return (
							<>
								<Checkbox defaultChecked={record.granted.destroy}
									onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.DESTROY, -1)} />
							</>
						)
					}
				},

				{
					title: 'Khác',
					key: 'other',
					width: 150,
					render: function showCol(text: string, record: RolePermissionType): JSX.Element {
						return (
							<>
								{
									record.granted.other.map((per, index) =>
										<div key={per.code}>
											<Checkbox key={per.code}
												defaultChecked={per.granted}
												onChange={(e) => handleCheckboxChange(e.target.checked, record, PermissionActions.UPDATE, index)}>
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
				onBack={() => history.push("/roles")}
				title={<>Phân quyền cho <span style={{ color: "#d35400" }}> {get(roleInfo, "name", "")}</span></>}
				subTitle=""
				extra={[
					// <Button key="2">Làm lại</Button>,
					<Button key="1" type="primary" onClick={() => handleSubmit()} loading={submitting}>
						Lưu thay đổi
					</Button>,
				]}
			/>
			<Table
				scroll={{ y: 600 }}
				loading={loading === "loading" ? true : false}
				columns={permissions_columns}
				dataSource={rolePermissions}
				bordered
				pagination={{ defaultPageSize: 1000 }}
				size="middle"
			/>,
		</Layout.Content>
	)
}

