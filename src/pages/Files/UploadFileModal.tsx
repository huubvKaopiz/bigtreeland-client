import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";
import { Button, Modal } from "antd";
import FileUpload from "components/FileUpload";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";

const Wrapper = styled.div``;

function UploadFileModal(): JSX.Element {
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const statusUploadFile = useSelector((state: RootState) => state.filesReducer.statusUploadFile);

	useEffect(() => {
		if (statusUploadFile === "success" || statusUploadFile === "error") {
			if (statusUploadFile === "success") {
				setShow(false);
			}
		}
	}, [dispatch, statusUploadFile]);

	return (
		<Wrapper>
			<Button
				type="primary"
				icon={<UploadOutlined />}
				onClick={() => {
					setShow(true);
				}}
			>
				Upload file
			</Button>
			<Modal
				title="Upload file"
				centered
				visible={show}
				onCancel={() => {
					setShow(false);
				}}
				footer={null}
				width={950}
				maskClosable={false}
			>
				<FileUpload hasCloseButton>
					<Button
						style={{ marginLeft: 30 }}
						onClick={() => {
							setShow(false);
						}}
					>
						Cancel
					</Button>
				</FileUpload>
			</Modal>
		</Wrapper>
	);
}

export default UploadFileModal;
