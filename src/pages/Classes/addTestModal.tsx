import { Button, Modal, Form, DatePicker, Input, Upload, notification } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RootState, useAppDispatch } from "store/store";
import moment from "moment";
import {
	actionGetListFile,
	actionUploadFileTest,
	resetRecentFileTestUploaded,
	resetUploadFileStatus,
} from "store/files/slice";
import { useSelector } from "react-redux";
import { ClassType, FileType } from "interface";
import { get } from "lodash";
import { UploadFile } from "antd/lib/upload/interface";
import { actionAddTest, actionGetTestes } from "store/testes/slice";
import { dummyRequest } from "utils/ultil";
import FileSelectModal from "components/FileSelectModal";

export default function AddTest(props: { classInfo: ClassType | null }): JSX.Element {
	const { classInfo } = props;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<UploadFile | null>(null);
	const [fileUploadList, setFileUploadList] = useState<UploadFile[] | null>(null);
	const [submiting, setSubmiting] = useState(false);
	const [showSelect, setShowSelect] = useState(false);
	const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);

	const uploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile);
	const recentFileUploaded = useSelector((state: RootState) => state.filesReducer.recentFileTestUploaded);

	const uploadRef = useRef()
	console.log(uploadRef.current)

	useEffect(() => {
		if (uploadStatus === "success") {
			setFileUploadList(null);
			setUploading(false);
			dispatch(resetUploadFileStatus());
			if (recentFileUploaded) setFileSelected([...recentFileUploaded, ...fileSelected]);
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

	function handleFileSelected(filesSelected: Array<FileType>) {
		setFileSelected(filesSelected);
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
					initialValues={{ date: moment() }}
					labelCol={{ span: 5 }}
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
					<Form.Item label="Link đề bài" name="content_link">
						<Input />
					</Form.Item>

					<Form.Item label="Files đề bài">
						<Upload
							ref={uploadRef}
							maxCount={100}
							multiple={true}
							customRequest={dummyRequest}
							onChange={({ file, fileList }) => {
								setFileUploadList(fileList);
								if (fileList.length > 0) setFile(file);
							}}
							onRemove={handleRemoveFile}
						>
							{!fileUploadList || fileUploadList.length === 0 ? <Button icon={<UploadOutlined />}>Chọn files đề thi</Button> : ""}
						</Upload>
						{fileUploadList && fileUploadList.length > 0 && (
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

					<Form.Item label="Chọn files đã upload">
						<FileSelectModal
							defaultSelected={fileSelected}
							isShow={showSelect}
							okFunction={handleFileSelected}
							closeFunction={() => setShowSelect(false)}
							showSelectedList
						>
							<Button onClick={() => setShowSelect(true)} type="default" size="middle" icon={<UploadOutlined />}>
								Chọn files
							</Button>
						</FileSelectModal>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
