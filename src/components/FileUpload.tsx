import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import { Button, Form, Spin } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionUploadFile, resetUploadFileStatus } from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import { dummyRequest } from "utils/ultil";

interface FileUploadComponentProps {
	hasCloseButton?: boolean;
	style?: React.CSSProperties;
}

function FileUpload(props: PropsWithChildren<FileUploadComponentProps>): JSX.Element {
	const { hasCloseButton, style } = props;
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();
	const statusUploadFile = useSelector((state: RootState) => state.filesReducer.statusUploadFile);

	useEffect(() => {
		if (statusUploadFile === "success" || statusUploadFile === "error") {
			setLoading(false);
			dispatch(resetUploadFileStatus());
			if (statusUploadFile === "success") {
				setFileList([]);
			}
		} else if (statusUploadFile === "loading") {
			setLoading(true);
		}
	}, [dispatch, statusUploadFile]);

	function handleUploadFile() {
		if (fileList.length > 0) {
			const listFileUpload = fileList.map((file) => {
				return file.originFileObj as File;
			});
			dispatch(actionUploadFile(listFileUpload));
		}
	}

	return (
		<div style={style}>
			<Spin spinning={loading}>
				<Form onFinish={handleUploadFile} form={form}>
					<Form.Item>
						<Dragger
							name="file"
							multiple={true}
							customRequest={dummyRequest}
							onDrop={(e) => {
								// console.log(e.dataTransfer.files);
							}}
							listType="picture-card"
							fileList={fileList}
							onChange={({ fileList }) => {
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

						{hasCloseButton && props.children}
					</Form.Item>
				</Form>
			</Spin>
		</div>
	);
}

export default FileUpload;
