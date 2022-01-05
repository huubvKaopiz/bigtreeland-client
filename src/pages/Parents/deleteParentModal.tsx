import { Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ParentType } from "interface";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import Modal from "antd/lib/modal/Modal";
import confirm from "antd/lib/modal/confirm";
import { actionResetStatusDeleteParent, actionDeleteParent, actionGetParents } from "../../store/parents/slice";

export default function DeleteParent(props: { parent: ParentType }): JSX.Element {
	const { parent } = props;
	const dispatch = useAppDispatch();
	const deleteParentStatus = useSelector((state: RootState) => state.parentReducer.deleteParentStatus);

	useEffect(() => {
		if (deleteParentStatus === "success" || deleteParentStatus === "error") {
			dispatch(actionResetStatusDeleteParent());
		}
		if (deleteParentStatus === "success") {
			dispatch(actionGetParents({ page: 1 }));
		}
	}, [deleteParentStatus, dispatch]);

	return (
		<div>
			<Tooltip placement="top" title="Xoá">
				<Button
					danger
					type="text"
					icon={<DeleteOutlined />}
					disabled={deleteParentStatus === "loading"}
					onClick={() => {
						confirm({
							title: "Bạn có chắc chắn?",
							onOk: function () {
								dispatch(actionDeleteParent(parent.id));
							},
						});
					}}
				/>
			</Tooltip>
		</div>
	);
}
