/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Modal, Row, Select, Tag } from "antd";
import PermissionService from "api/permission.service";
import { PERMISSION_LIST } from "assets/mock-data/PermissionList";
import { UserType as User } from "interface/index";
import React, { useEffect, useState } from "react";

interface Props {
	user: User;
	handleChangePermission?: (user: User, newPermissionList: number[], oldPermissionList: number[]) => void;
}

interface PermissionOptions {
	label: string;
	value: number;
}

// Huu.bv get PermissionLis từ server sau đó lưu vào redux :'(
const permissionList: PermissionOptions[] = PERMISSION_LIST.map((item) => {
	return {
		label: item.name,
		value: item.id,
	};
});

function ChangePermisstion({ user, handleChangePermission }: Props): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [userPermissionList, setUserPermissionList] = useState<number[]>([]);
	const [userPermissionSelected, setUserPermissionSelected] = useState<number[]>([]);

	useEffect(() => {
		if (showForm)
			PermissionService.getListPermissionOfUser(user.id).then(({ data }: { data: any }) => {
				const permissionList = data.roles.reduce((list: number[], current: any) => {
					const currentPermission = current.permissions;
					list = [...new Set([...list, ...currentPermission])];
					return list;
				}, []);

				setUserPermissionList([...permissionList]);
				setUserPermissionSelected([...permissionList]);
			});
	}, [showForm, user.id]);

	function handleOkButton() {
		setShowForm(false);
		if (handleChangePermission) {
			handleChangePermission(user, userPermissionSelected, userPermissionList);
		}
	}

	function handleCancelButton() {
		setUserPermissionSelected([...userPermissionList]);
		setShowForm(false);
	}

	function handlePermissionChange(permissionListId: number[]) {
		setUserPermissionSelected(permissionListId);
	}

	return (
		<>
			<Button type="primary" onClick={() => setShowForm(true)}>
				Phân quyền
			</Button>
			<Modal
				title={`Phân quyền cho user ${user.email}`}
				centered
				width={800}
				visible={showForm}
				onCancel={handleCancelButton}
				onOk={handleOkButton}
				okText="Thay đổi quyền người dùng"
				cancelText="Huỷ bỏ"
			>
				<Row>
					<Col className="gutter-row" span={24}>
						<Row style={{ maxHeight: 500, overflow: "auto" }}>
							<Select
								mode="multiple"
								showArrow
								style={{ width: "100%" }}
								options={permissionList}
								placeholder={`Phân quyền cho user ${user.email}`}
								value={userPermissionSelected}
								onChange={(value: number[]) => handlePermissionChange(value)}
								tagRender={(selectProps) => (
									<Tag
										color="green"
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										closable={selectProps.closable}
										onClose={selectProps.onClose}
										style={{ fontSize: 15, margin: "5px 5px", padding: 5 }}
									>
										{selectProps.label}
									</Tag>
								)}
							/>
						</Row>
					</Col>
				</Row>
			</Modal>
		</>
	);
}

export default ChangePermisstion;
