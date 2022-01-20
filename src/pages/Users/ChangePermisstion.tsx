/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Select, Tag, Tooltip } from "antd";
import PermissionService from "api/permission.service";
import { PERMISSION_LIST } from "assets/mock-data/PermissionList";
import useIsMounted from "hooks/useIsMounted";
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
	const isMounted = useIsMounted();
	const [userPermissionList, setUserPermissionList] = useState<number[]>([]);
	const [userPermissionSelected, setUserPermissionSelected] = useState<number[]>([]);
	
	useEffect(() => {
		if (showForm)
			PermissionService.getListPermissionOfUser(user.id).then(({ data }: { data: any }) => {
				const permissionList: number[] = data.permissions.reduce((list: number[], permissionDetail: any) => {
					list.push(permissionDetail.id);
					return list;
				}, []);

				showForm && isMounted && setUserPermissionList([...permissionList]);
				showForm && isMounted && setUserPermissionSelected([...permissionList]);
			});
	}, [showForm, user.id, isMounted]);

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
			<Tooltip placement="top" title="Phân quyền cho tài khoản">
				<Button type="link" icon={<SafetyCertificateOutlined />} onClick={() => setShowForm(true)} />
			</Tooltip>
			<Modal
				title={`Phân quyền cho user ${user?.profile?.name ?? ''}`}
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
								listHeight={600}
								style={{ width: "100%" }}
								options={permissionList}
								placeholder={`Phân quyền cho user ${user.email ?? ''}`}
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
