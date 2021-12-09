import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import QuestionCircleOutlined from "@ant-design/icons/lib/icons/QuestionCircleOutlined";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import { Input, Layout, Popconfirm, Spin, Table } from "antd";
import { FileType } from "interface";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
	actionDeleteUploadFile,
	actionGetListFile,
	resetDeleteFileStatus,
	resetGetFileStatus,
	resetUploadFileStatus,
} from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";
import { fileIconList } from "utils/const";
import { DatePattern, formatDate } from "utils/dateUltils";
import { formatFileSize, isImageType } from "utils/ultil";
import UploadFileModal from "./UploadFileModal";

const Wrapper = styled.div`
	.ant-table-tbody > tr.ant-table-row:hover > td {
		background: #61dafb38;
	}
	.img-center {
		display: block;
		margin: 0 auto;
	}
`;

function Files(): JSX.Element {
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const statusDeleteFile = useSelector((state: RootState) => state.filesReducer.statusDeleteFile);
	const statusUploadFile = useSelector((state: RootState) => state.filesReducer.statusUploadFile);
	const statusGetFiles = useSelector((state: RootState) => state.filesReducer.statusGetFiles);

	useEffect(() => {
		dispatch(actionGetListFile({ page, search }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, page]);

	useEffect(() => {
		if (statusDeleteFile === "success") {
			dispatch(actionGetListFile({ search }));
			dispatch(resetDeleteFileStatus());
		} else if (statusUploadFile === "success") {
			dispatch(actionGetListFile({ search }));
			dispatch(resetUploadFileStatus());
		} else if (statusDeleteFile === "error" || statusUploadFile === "error") {
			setLoading(false);
			if (statusDeleteFile === "error") dispatch(resetDeleteFileStatus());
			else dispatch(resetUploadFileStatus());
		}
		if (statusGetFiles === "success" || statusGetFiles === "error") {
			dispatch(resetGetFileStatus());
			setLoading(false);
		} else if (statusGetFiles === "loading") setLoading(true);
	}, [dispatch, search, statusDeleteFile, statusGetFiles, statusUploadFile]);

	function handleTableFilter() {
		setLoading(true);
		dispatch(actionGetListFile({ search }));
	}

	function handleDeleteFile(file: FileType) {
		setLoading(true);
		dispatch(actionDeleteUploadFile(+file.id));
	}


	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			// eslint-disable-next-line react/display-name
			render: (file_name: string, file: FileType) => {
				return (
					<span>
						{
							<a rel="noopener noreferrer" target="_blank" href={file.url}>
								{file_name}
							</a>
						}
					</span>
				);
			},
		},
		{
			width: "10%",
			title: "Type",
			dataIndex: "type",
			key: "type",
		},
		{
			width: "20%",
			title: "Preview",
			key: "_",
			// eslint-disable-next-line react/display-name
			render: (file: FileType) => {
				if (isImageType(file.type || ""))
					return (
						<>
							<img className="img-center" src={file.url} style={{ maxHeight: 50, maxWidth: 200 }} />
						</>
					);
				const iconUrl = Object.keys(fileIconList).find((k) => k === file.type) as keyof typeof fileIconList;
				return <img className="img-center" src={fileIconList[iconUrl]} style={{ maxHeight: 50, maxWidth: 200 }} />;
			},
		},
		{
			width: "10%",
			title: "Size",
			dataIndex: "size",
			key: "size",
			// eslint-disable-next-line react/display-name
			render: (size: string) => <span>{formatFileSize(size)}</span>,
		},
		{
			width: "12%",
			title: "Ngày upload",
			dataIndex: "created_at",
			key: "created_at",
			// eslint-disable-next-line react/display-name
			render: (date: string) => <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>,
		},
		{
			width: "10%",
			title: "Action",
			key: "action",
			// eslint-disable-next-line react/display-name
			render: (file: FileType) => (
				<Popconfirm
					title="Xác nhận xoá file?"
					icon={<QuestionCircleOutlined />}
					onConfirm={() => handleDeleteFile(file)}
				>
					<a style={{ display: "block", margin: "0 auto", width: "fit-content" }}>
						<DeleteOutlined />
					</a>
				</Popconfirm>
			),
		},
	];

	return (
		<Wrapper>
			<Layout.Content style={{ padding: 20 }}>
				<Spin spinning={loading}>
					<div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
						<Input
							placeholder="Tìm kiếm thông qua tên file"
							onChange={(e) => setSearch(e.target.value)}
							onKeyUp={(e) => e.key === "Enter" && handleTableFilter()}
							prefix={<SearchOutlined />}
						/>
						<div style={{ marginLeft: 20 }}>
							<UploadFileModal />
						</div>
					</div>
					<Table
						rowKey="id"
						dataSource={get(listFile, "data", [])}
						columns={columns}
						bordered
						pagination={{
							pageSize: 20,
							total: get(listFile, "total", 0),
							onChange: (page) => {
								setPage(page);
							},
						}}
						size="small"
					/>
				</Spin>
			</Layout.Content>
		</Wrapper>
	);
}

export default Files;
