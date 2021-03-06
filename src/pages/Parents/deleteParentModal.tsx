import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import confirm from "antd/lib/modal/confirm";
import { ParentType } from "interface";
import { useState } from "react";
import { useAppDispatch } from "store/store";
import { actionDeleteParent, actionGetParents } from "../../store/parents/slice";
import React from "react";

export default function DeleteParent(props: { parent: ParentType }): JSX.Element {
	const { parent } = props;
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);

	return (
		<div>
			<Tooltip placement="top" title="Vô hiệu hoá tài khoản">
				<Button
					danger
					type="text"
					icon={<MinusCircleOutlined />}
					loading={loading}
					onClick={() => {
						confirm({
							title: "Bạn muốn vô hiệu hoá tài khảon người dùng này!",
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
