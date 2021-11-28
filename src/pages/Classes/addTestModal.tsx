import { Button, Modal, Form, DatePicker, Input, Upload, notification } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { RootState, useAppDispatch } from "store/store";
import moment from "moment";
import { actionUploadFileTest, resetRecentFileTestUploaded, resetUploadFileStatus } from "store/files/slice";
import { useSelector } from "react-redux";
import { ClassType } from "interface";
import { get } from "lodash";
import { UploadFile } from "antd/lib/upload/interface";
import { actionAddTest, actionGetTestes } from "store/testes/slice";
import { dummyRequest } from "utils/ultil";

export default function AddTest(props: { classInfo: ClassType | null }): JSX.Element {
	const { classInfo } = props;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<UploadFile | null>(null);
	const [submiting, setSubmiting] = useState(false);

	const uploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile);
	const addTestStatus = useSelector((state: RootState) => state.testReducer.addTestStatus);
	const recentFileUploaded = useSelector((state: RootState) => state.filesReducer.recentFileTestUploaded);

	useEffect(() => {
		if (uploadStatus === "success") {
			setUploading(false);
			dispatch(resetUploadFileStatus());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uploadStatus, recentFileUploaded]);

	function handleUpload() {
		if (file) {
			setUploading(true);
			const fileToUpload = file.originFileObj as File;
			dispatch(actionUploadFileTest(fileToUpload));
		}
	}

	function handleRemoveFile() {
		dispatch(resetRecentFileTestUploaded());
		setUploading(false);
	}

	function handleSubmit(values: any) {
		if (!recentFileUploaded) {
			notification.error({ message: "Chưa chọn file test" });
			return;
		}

		if (recentFileUploaded && recentFileUploaded.length > 0) {
			setSubmiting(true);
			const data = {
				class_id: get(classInfo, "id", 0),
				title: values.title,
				date: moment(values.date).format("YYYY-MM-DD"),
				content_file: get(recentFileUploaded[0], "id", 0),
			};
			dispatch(actionAddTest(data))
				.then(() => {
					setShow(false);
					dispatch(resetRecentFileTestUploaded());
					dispatch(actionGetTestes({ class_id: get(classInfo, "id", 0) }));
				})
				.finally(() => setSubmiting(false));
		}
	}

	return (
		<>
			<Button icon={<PlusOutlined />} type="primary" onClick={() => setShow(true)}>
				Tạo bài test
			</Button>
			<Modal
				visible={show}
				closable
				onCancel={() => setShow(false)}
				title="Tạo bài test mới"
				width={800}
				footer={[
					<Button key="btncancle" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button loading={submiting} key="btnok" type="primary" htmlType="submit" form="aForm">
						Lưu lại
					</Button>,
				]}
			>
				<Form
					id="aForm"
					initialValues={{ date: moment(new Date()) }}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					onFinish={handleSubmit}
				>
					<Form.Item
						label="Tiêu đề"
						name="title"
						rules={[{ required: true, message: "Tiêu đề bài test không được bỏ trống" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item label="Ngày" name="date">
						<DatePicker format="YYYY-MM-DD" defaultValue={moment(new Date())} />
					</Form.Item>
					<Form.Item
						label="Link đề bài"
						name="content_link"
					>
						<Input />
					</Form.Item>

					<Form.Item label="Files đề bài">
						<Upload
							maxCount={100}
							multiple={true}
							customRequest={dummyRequest}
							onChange={({ file }) => setFile(file)}
							onRemove={handleRemoveFile}
						>
							{!file ? <Button icon={<UploadOutlined />}>Chọn files đề thi</Button> : ""}
						</Upload>
						{file && (
							<Button
								loading={uploading}
								onClick={handleUpload}
								style={{ marginTop: 10 }}
								type="primary"
								size="small"
								ghost
								icon={<UploadOutlined />}
							>
								Tải lên
							</Button>
						)}
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
