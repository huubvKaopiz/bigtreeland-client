import { Button, Col, Modal, Row, Select, Tag } from "antd";
import { PERMISSION_LIST } from "assets/mock-data/PermissionList";
import React, { useState } from "react";
import { User } from "utils/interfaces";

interface Props {
	user: User;
	handleChangePermission?: (user: User, permissionList: number[]) => void;
}

interface PermissionOptions {
	label: string;
	value: number;
}

// Todo get from server
const permissionList: PermissionOptions[] = PERMISSION_LIST.map((item) => {
	return {
		label: item.name,
		value: item.id,
	};
});

function ChangePermisstion({ user, handleChangePermission }: Props): JSX.Element {
	const [showForm, setShowForm] = useState(false);
	const [userPermissionList, setUserPermissionList] = useState<number[]>(() => {
		// Todo call API to get list permission of user
		return []
	});

	function handleOkButton() {
		setShowForm(false);
		if (handleChangePermission) {
			handleChangePermission(user, userPermissionList);
		}
	}

	function handleCancelButton() {
		// Todo need reset default permission when click cancel
		setShowForm(false);
	}

	function handlePermissionChange(permissionListId: number[]) {
		setUserPermissionList(permissionListId);
		console.log(permissionListId);
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
						<Row style={{maxHeight: 500, overflow: "auto"}}>
							<Select
								mode="multiple"
								showArrow
								style={{ width: "100%" }}
								options={permissionList}
								placeholder={`Phân quyền cho user ${user.email}`}
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
