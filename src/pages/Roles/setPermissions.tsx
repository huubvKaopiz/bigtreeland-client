/* eslint-disable no-mixed-spaces-and-tabs */
import React, { useEffect, useState } from "react";
import { Layout, PageHeader, Table, Checkbox, message, Button } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { RoleType } from "interface";
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { actionGetPermissions, actionSetRolePermissions, PermistionType } from "store/permissions/slice";
import { RootState, useAppDispatch } from "store/store";
import { getPermissionDes } from "utils/ultil";

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
	const location = useLocation();
	const history = useHistory();
	const dispatch = useAppDispatch();
	const roleInfo = get(location, "state.roleInfo", null) as RoleType;

	const [rolePermissions, setRolePermissions] = useState<RolePermissionType[]>([])
	const [addPermissions, setAddPermissions] = useState<number[]>([])
	const [removePermissions, setRemovePermissions] = useState<number[]>([])
	const [submitting, setSubmitting] = useState(false);

	//Application state
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);

	useEffect(() => {
		dispatch(actionGetPermissions())
	}, [dispatch])

	useEffect(() => {
		if (permissions) {
			let object = '';
			const per_list: RolePermissionType[] = [];
			permissions.forEach((p: PermistionType) => {
				const granted = get(roleInfo, "permissions", []).findIndex((granted) => granted.name === p.name) >= 0;
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
			})
			// console.log(per_list)
			setRolePermissions(per_list)

		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [permissions, roleInfo.permissions])


	function handleCheckboxChange(e: any, record: RolePermissionType, action: PermissionActions, otherIndex: number) {

		let per_name = record.object + ".";
		if (otherIndex === -1) {
			per_name += action;
		} else per_name += record.granted.other[otherIndex].code;
		const permission = permissions?.find((per) => per.name === per_name);
		if (permission === undefined) {
			message.error({ message: `Không thể tìm thấy permission tương ứng với per_name: ${per_name}!` })
			return;
		}
		// console.log(per_name, granted);
		const granted = get(roleInfo, "permissions", []).find((per) => per.name === per_name)
		if (e.target.checked) {
			if (granted === undefined) {
				addPermissions.push(permission.id);
				setAddPermissions([...addPermissions])
			} else {
				const r_index = removePermissions.findIndex((rm) => rm === permission.id)
				removePermissions.splice(r_index, 1)
				setRemovePermissions([...removePermissions]);
			}
		} else {
			if (granted) {
				removePermissions.push(permission.id);
				setRemovePermissions([...removePermissions])
			} else {
				const a_index = addPermissions.findIndex((rm) => rm === permission.id)
				addPermissions.splice(a_index, 1)
				setAddPermissions([...addPermissions]);
			}
		}
	}
	// console.log(addPermissions, removePermissions)

	function handleSubmit(){
		if(roleInfo){
			setSubmitting(true);
			dispatch(actionSetRolePermissions({
				role_id:roleInfo.id,
				permission_add_ids:addPermissions,
				permission_delete_ids:removePermissions,
			})).finally(()=>{
				setSubmitting(false);
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
									defaultChecked={record.granted.show || record.granted.index}
									onChange={(e) => handleCheckboxChange(e, record, PermissionActions.SHOW, -1)} />
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
									onChange={(e) => handleCheckboxChange(e, record, PermissionActions.STORE, -1)} />
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
									onChange={(e) => handleCheckboxChange(e, record, PermissionActions.UPDATE, -1)} />
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
									onChange={(e) => handleCheckboxChange(e, record, PermissionActions.DESTROY, -1)} />
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
												onChange={(e) => handleCheckboxChange(e, record, PermissionActions.UPDATE, index)}>
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
					<Button key="2">Làm lại</Button>,
					<Button key="1" type="primary" onClick={()=>handleSubmit()} loading={submitting}>
						Lưu thay đổi
					</Button>,
				]}
			/>
			<Table
				columns={permissions_columns}
				dataSource={rolePermissions}
				bordered
				pagination={{ defaultPageSize: 1000 }}
				size="middle"
			/>,
		</Layout.Content>
	)
}

