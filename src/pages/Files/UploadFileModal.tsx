import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import { Button, Form, Modal, Spin } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";
import { actionUploadFile } from "store/files/slice";
import { useAppDispatch } from "store/store";
import styled from "styled-components";
import { dummyRequest } from "utils/ultil";

export interface UploadFileModalProps {
	onUploadFile: () => void;
}

const Wrapper = styled.div``;

function UploadFileModal(props: UploadFileModalProps): JSX.Element {
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
	const [form] = Form.useForm();

	function handleUploadFile() {
		if (fileList.length > 0) {
			const listFileUpload = fileList.map((file) => {
				return { ...file.originFileObj } as File;
			});
			// dispatch(actionUploadFile(listFileUpload));
            console.log(listFileUpload)
		}
	}

	console.log("upload file re-render");

	return (
		<Wrapper>
			<Button
				type="primary"
				icon={<PlusOutlined />}
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
				<Spin spinning={loading}>
					<Form onFinish={handleUploadFile} form={form}>
						<Form.Item>
							<Dragger
								name="file"
								multiple={true}
								customRequest={dummyRequest}
								onDrop={(e) => {
									console.log(e.dataTransfer.files);
								}}
								listType="picture-card"
								fileList={fileList}
								onChange={({ file, fileList }) => {
									setFileList(fileList);
								}}
								// className="upload-list-inline"
							>
								<p className="ant-upload-drag-icon">
									<InboxOutlined />
								</p>
								<p className="ant-upload-text">Nhấn hoặc kéo thả file vào khu vực để upload!</p>
							</Dragger>
						</Form.Item>
						<Form.Item style={{ textAlign: "center" }}>
							<Button type="primary" htmlType="submit">
								Upload
							</Button>
							<Button
								style={{ marginLeft: 30 }}
								onClick={() => {
									setShow(false);
									setFileList([]);
								}}
							>
								Cancel
							</Button>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</Wrapper>
	);
}

export default UploadFileModal;
