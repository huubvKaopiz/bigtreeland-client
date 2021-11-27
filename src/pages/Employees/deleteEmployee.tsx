import { Button, Space, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { EmployeeType } from "interface";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { actionDeleteEmployee, actionGetEmployees } from "store/employees/slice";

function DeleteEmployeeModal(props: { employee: EmployeeType }): JSX.Element {
	const { employee } = props;
	const [show, setShow] = useState(false);
	const dispatch = useAppDispatch();
	const status = useSelector((state: RootState) => state.employeeReducer.deleteEmployeeStatus);

	useEffect(() => {
		if (status === "success" && show) {
			setShow(false);
			dispatch(actionGetEmployees({}));
		}
	}, [status, dispatch, show]);

	function handleDelete() {
		dispatch(actionDeleteEmployee(employee.id));
	}
	return (
		<Space>
			<Tooltip placement="top" title="Xoá nhân viên">
				<Button type="link" icon={<DeleteOutlined />} danger onClick={() => setShow(true)} />
			</Tooltip>
			<Modal
				visible={show}
				title={
					<>
						<WarningOutlined twoToneColor="#eb2f96" /> Bạn muốn xoá nhân viên{" "}
					</>
				}
				onCancel={() => setShow(false)}
				onOk={handleDelete}
				centered
			>
				<p>
					Khi xoá nhân viên thì tất cả những thông tin liên quan đến nhân viên có thể bị xoá và không thể phục hồi được!
				</p>
			</Modal>
		</Space>
	);
}

export default React.memo(DeleteEmployeeModal);
