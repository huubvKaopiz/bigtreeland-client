import { Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ParentType } from "interface";
import { useState } from "react";
import { useAppDispatch } from "store/store";
import confirm from "antd/lib/modal/confirm";
import { actionDeleteParent, actionGetParents } from "../../store/parents/slice";

export default function DeleteParent(props: { parent: ParentType }): JSX.Element {
	const { parent } = props;
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);

	return (
		<div>
			<Tooltip placement="top" title="Xoá">
				<Button
					danger
					type="text"
					icon={<DeleteOutlined />}
					loading={loading}
					onClick={() => {
						confirm({
							title: "Bạn có chắc chắn?",
							onOk: function () {
								setLoading(true);
								dispatch(actionDeleteParent(parent.id))
									.then(() => {
										dispatch(actionGetParents({ page: 1 }));
									})
									.finally(() => {
										setLoading(false);
									});
							},
						});
					}}
				/>
			</Tooltip>
		</div>
	);
}
