/* eslint-disable no-mixed-spaces-and-tabs */
import { Button, Modal, Table } from "antd";
import { RoleType } from "interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PermistionType } from "store/permissions/slice";
import { actionSetPermissionForRole } from "store/roles/slice";
import { RootState, useAppDispatch } from "store/store";

interface RoleDetailProps {
	roleDetail: RoleType | undefined;
	show: boolean;
	onClose: () => void;
}

function RoleDetail({ show, roleDetail, onClose }: RoleDetailProps): JSX.Element {
	const dispatch = useAppDispatch();

	//Permision List
	const permissions = useSelector((state: RootState) => state.permissionReducer.permissions);
	const [permissionsOptions, setPermissionsOptions] = useState<PermistionType[]>([]);
	const [permissionsSelected, setPermissionsSelected] = useState<React.Key[]>([]);
	const [permissionsGranted, setPermissionsGranted] = useState<React.Key[]>([]);

	const statusSetPermissionForRole = useSelector((state: RootState) => state.roleReducer.statusSetPermissionForRole);

    useEffect(() => {
        if(statusSetPermissionForRole === "success")
            setPermissionsGranted(permissionsSelected)
    }, [permissionsSelected, statusSetPermissionForRole])

	useEffect(() => {
		permissions &&
			setPermissionsOptions(
				permissions
					.map((p) => ({
						...p,
						key: p.id,
					}))
					.sort((a, b) => a.name.localeCompare(b.name))
			);
		const pGranted = roleDetail?.permissions.map((p) => p.id) as React.Key[];
		setPermissionsGranted(pGranted);
		setPermissionsSelected(pGranted);
	}, [permissions, roleDetail]);

	function selectRow(record: PermistionType) {
		if (record.key) {
			const selectedRowKeys: React.Key[] = [...permissionsSelected];
			if (selectedRowKeys.indexOf(record.key) >= 0) {
				selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
			} else {
				selectedRowKeys.push(record.key);
			}
			setPermissionsSelected(selectedRowKeys);
		}
	}
	function handlePermissionChange(value: React.Key[]) {
		setPermissionsSelected(value);
	}

	function handleSetPermission() {
		const listPermissionAdded = permissionsSelected.filter((permission) => !permissionsGranted.includes(permission));
		const listPermissionRemoved = permissionsGranted.filter((permission) => !permissionsSelected.includes(permission));
            
		dispatch(
			actionSetPermissionForRole({
				role_id: roleDetail?.id,
				added: listPermissionAdded,
				removed: listPermissionRemoved,
			})
		);
	}

	const tableColumn = [
		{
			title: "Chức năng",
			key: "function",
			dataIndex: "name",
			showSorterTooltip: false,
			render: function UserLink(text: string): JSX.Element {
				return <a className="example-link">{text.split(".")[0]}</a>;
			},
		},
		{
			title: "Danh sách quyền",
			key: "name",
			dataIndex: "name",
			showSorterTooltip: false,
			render: function UserLink(text: string): JSX.Element {
				return <a className="example-link">{text.split(".")[1]}</a>;
			},
		},
	];
	return (
		<>
			<Modal
				title={`Danh sách quyền cho ${roleDetail?.name}`}
				width={1000}
				visible={show}
				closable={true}
				onCancel={onClose}
				footer={[
					<Button
						key=""
						onClick={() => {
							setPermissionsSelected(permissionsGranted);
							onClose();
						}}
					>
						Cancel
					</Button>,
					<Button type="primary" key="submit" onClick={handleSetPermission}>
						Lưu thay đổi
					</Button>,
				]}
			>
				<Table
					loading={statusSetPermissionForRole === "loading"}
					columns={tableColumn}
					dataSource={permissionsOptions}
					pagination={false}
					scroll={{ y: 500 }}
					rowSelection={{
						type: "checkbox",
						onChange: handlePermissionChange,
						selectedRowKeys: permissionsSelected,
					}}
					bordered
					onRow={(record) => ({
						onClick: () => selectRow(record),
					})}
				/>
				,
			</Modal>
		</>
	);
}

export default React.memo(RoleDetail);
