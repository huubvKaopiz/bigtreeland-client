import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal, notification, Upload } from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import FileSelectModal from "components/FileSelectModal";
import { ClassType, FileType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
	actionUploadFileTest,
	resetRecentFileTestUploaded,
	resetUploadFileStatus
} from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionAddTest, actionGetTestes } from "store/testes/slice";
import { dummyRequest } from "utils/ultil";

export default function AddTest(props: { classInfo: ClassType | null }): JSX.Element {
	const { classInfo } = props;
	const dispatch = useAppDispatch();
	const [show, setShow] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [fileUploadList, setFileUploadList] = useState<UploadFile[] | undefined>(undefined);
	const [submiting, setSubmiting] = useState(false);
	const [showSelect, setShowSelect] = useState(false);
	const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);

	const uploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile);

	useEffect(() => {
		if (uploadStatus === "success") {
			setFileUploadList([]);
			setUploading(false);
			dispatch(resetUploadFileStatus());
		
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uploadStatus]);

	function handleUpload() {
		if (fileUploadList && fileUploadList.length > 0) {
			setUploading(true);
			const fileToUpload: File[] = []
			fileUploadList.forEach(file => fileToUpload.push(file.originFileObj as File));
			dispatch(actionUploadFileTest(fileToUpload));
		}
	}

	function handleFileSelected(filesSelected: Array<FileType>) {
		setFileSelected(filesSelected);
	}

	// function handleRemoveFile() {
	// 	dispatch(resetRecentFileTestUploaded());
	// 	setUploading(false);
	// }

	function handleSubmit(values: any) {
		if (fileSelected.length === 0) {
			notification.error({ message: "Chưa chọn file test" });
			return;
		}

		if (fileSelected.length > 0 ) {
			setSubmiting(true);
			const listIdFile = fileSelected.map(file => file.id)
			const data = {
				class_id: get(classInfo, "id", 0),
				title: values.title,
				date: moment(values.date).format("YYYY-MM-DD"),
				'content_file[]': listIdFile,
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
							maxCount={100}
							multiple={true}
							customRequest={dummyRequest}
							onChange={({ fileList }) => {
								setFileUploadList(fileList);
							}}
							fileList={fileUploadList}
							// onRemove={handleRemoveFile}
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
