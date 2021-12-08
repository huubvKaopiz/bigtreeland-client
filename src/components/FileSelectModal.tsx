import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { Button, Card, Checkbox, List, Modal, Pagination, Spin } from "antd";
import Meta from "antd/lib/card/Meta";
import { FileType } from "interface";
import { get } from "lodash";
import moment from "moment";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetListFile, resetGetFileStatus } from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import { fileIconList } from "utils/const";
import { isImageType } from "utils/ultil";

interface FileSelectModalProps {
	isShow: boolean;
	okFunction: (selected: Array<FileType>) => void;
	closeFunction: () => void;
	showSelectedList?: boolean;
    defaultSelected: Array<FileType>;
}

interface FileSelectRenderProps {
	listFileSelected: Array<FileType>;
	handleRemoveFileSelected: (id: number) => void;
}

const gridStyle = {
	width: "20%",
	position: "relative",
};

const imageStyle = {
	width: "100%",
	height: "80px",
	objectFit: "contain",
};

/*
** use 
const [showSelect, setShowSelect] = useState(false);
const okFunction = (filesSelect: Array<FileType>) => {
	console.log(filesSelect)
};
<FileSelectModal showSelectedList isShow={showSelect} okFunction={okFunction} closeFunction={() => setShowSelect(false)}>
	<button onClick={() => setShowSelect(true)}>File Select</button>
</FileSelectModal>
*/

export function FileSelectedListRender(props: FileSelectRenderProps): JSX.Element {
	const { listFileSelected: data, handleRemoveFileSelected } = props;
	return data.length > 0 ? (
		<List
			itemLayout="horizontal"
			dataSource={data}
			renderItem={(item) => (
				<a style={{display: 'block'}}>
					{item.name}
					<Button type={"text"} icon={<DeleteOutlined />} onClick={() => handleRemoveFileSelected(item.id)} />
				</a>
			)}
		/>
	) : (
		<></>
	);
}

function FileSelectModal(props: PropsWithChildren<FileSelectModalProps>): JSX.Element {
	const { isShow, closeFunction, okFunction, showSelectedList, defaultSelected } = props;
	const dispatch = useAppDispatch();
	const [fileSelected, setFileSelected] = useState<Array<FileType>>([...defaultSelected]);
	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const statusGetFiles = useSelector((state: RootState) => state.filesReducer.statusGetFiles);
	const statusUploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile);

	// useImperativeHandle()
	useEffect(() => {
		if (statusGetFiles === "success" || statusGetFiles === "error") dispatch(resetGetFileStatus());
	}, [dispatch, statusGetFiles]);

    useEffect(()=> {
        if (statusUploadStatus === "success")
            dispatch(actionGetListFile());
    }, [dispatch, statusUploadStatus])

    useEffect(() => {
        setFileSelected([...defaultSelected])
    }, [defaultSelected])
	function pageChange(page: number) {
		dispatch(actionGetListFile({ page }));
	}

	function checkboxChangeValue(id: number) {
		// const fileIndexRemoved = fileSelected.indexOf(id);
		const fileIndexRemoved = fileSelected.findIndex((f) => f.id === id);
		if (fileIndexRemoved > -1) {
			const newFileSelectedList = [...fileSelected];
			newFileSelectedList.splice(fileIndexRemoved, 1);
			setFileSelected(newFileSelectedList);
		} else {
			setFileSelected([...fileSelected, listFile.data?.find((f) => f.id === id) as FileType]);
		}
	}

	function handleCloseModal() {
		setFileSelected([]);
		closeFunction();
	}

	function handleSelectFile() {
		okFunction(fileSelected);
		closeFunction();
	}

	return (
		<>
			{props.children}
			<Modal
				bodyStyle={{ minHeight: 200 }}
				title="Chọn File"
				centered
				visible={isShow}
				onCancel={handleCloseModal}
				onOk={handleSelectFile}
				width={1500}
				style={{ paddingTop: 0 }}
				maskClosable={false}
			>
				<Spin spinning={statusGetFiles === "loading"}>
					<Card>
						{listFile.data?.map((file) => (
							<Card.Grid key={file.id} style={gridStyle as React.CSSProperties}>
								<Checkbox
									onClick={() => {
										checkboxChangeValue(file.id);
									}}
									checked={fileSelected.find((o) => o.id === file.id) !== undefined}
									style={{ position: "absolute", zIndex: 2, left: "6px", top: "5px" }}
								/>
								<Card
									onClick={() => {
										checkboxChangeValue(file.id);
									}}
									style={{ width: "100%", border: "unset", position: "relative", cursor: "pointer" }}
									cover={
										(isImageType(file.type || "") && (
											<img className="img-center" src={file.url} style={imageStyle as React.CSSProperties} />
										)) || (
											<img
												className="img-center"
												src={
													fileIconList[
														Object.keys(fileIconList).find((k) => k === file.type) as keyof typeof fileIconList
													]
												}
												style={imageStyle as React.CSSProperties}
											/>
										)
									}
								>
									<Meta
										style={{ cursor: "pointer" }}
										title={file.name}
										description={`Upload: ${moment(file.created_at).format("DD/MM/YYYY HH:mm")}`}
									/>
								</Card>
							</Card.Grid>
						))}
					</Card>
					{get(listFile, "total", 0) && (
						<Pagination
							style={{ marginTop: "10px", textAlign: "right" }}
							pageSize={20}
							total={get(listFile, "total", 0)}
							onChange={(page) => pageChange(page)}
						/>
					)}
				</Spin>
			</Modal>
			{showSelectedList && (
				<FileSelectedListRender handleRemoveFileSelected={checkboxChangeValue} listFileSelected={fileSelected} />
			)}
		</>
	);
}

export default FileSelectModal;
