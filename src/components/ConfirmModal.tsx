import { Modal } from "antd";
import React from "react";

interface ModalPropsType {
    onOk : () => void;
    onCancel: () => void;
    visible: boolean
}

function ConfirmModal(
	props: ModalPropsType,
	children: JSX.ElementChildrenAttribute
): JSX.Element {
	return (
		<>
			<Modal
				title="Basic Modal"
				visible={props.visible}
				onOk={props.onOk}
				onCancel={props.onCancel}
			>
				{{ children }}
			</Modal>
		</>
	);
}

export default React.memo(ConfirmModal);
