import { Card, Checkbox, Modal, Pagination, Spin } from "antd";
import Meta from "antd/lib/card/Meta";
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
	okFunction: (selected: Array<number>) => void;
	closeFunction: () => void;
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
const okFunction = (filesSelect: Array<number>) => {
	console.log(filesSelect)
};
<FileSelectModal isShow={showSelect} okFunction={okFunction} closeFunction={() => setShowSelect(false)}>
	<button onClick={() => setShowSelect(true)}>File Select</button>
</FileSelectModal>
*/

function FileSelectModal(props: PropsWithChildren<FileSelectModalProps>): JSX.Element {
    const { isShow, closeFunction, okFunction } = props
	const dispatch = useAppDispatch();
    const [fileSelected, setFileSelected] = useState<Array<number>>([]);
	const listFile = useSelector((state: RootState) => state.filesReducer.files);
	const statusGetFiles = useSelector((state: RootState) => state.filesReducer.statusGetFiles);

    // useImperativeHandle()

	useEffect(() => {
		if (statusGetFiles === "success" || statusGetFiles === "error") dispatch(resetGetFileStatus());
	}, [dispatch, statusGetFiles]);

    function pageChange(page: number) {
        dispatch(actionGetListFile({page}))
    }

    function checkboxChangeValue(id: number) {
        const fileIndexRemoved = fileSelected.indexOf(id)
        if(fileIndexRemoved > -1){
            const newFileSelectedList = [...fileSelected]
            newFileSelectedList.splice(fileIndexRemoved, 1)
            setFileSelected(newFileSelectedList)
        } else {
            setFileSelected([...fileSelected, id])
        }
    }

    function handleCloseModal(){
        setFileSelected([])
        closeFunction()
    }

    function handleSelectFile() {
        okFunction(fileSelected)
        closeFunction()
    }

	return (
        <>
        {props.children}
		<Modal
			title="Chọn File"
			centered
			visible={isShow}
			onCancel={handleCloseModal}
			onOk={handleSelectFile}
			width={1500}
            style={{paddingTop: 0}}
			maskClosable={false}
		>
			<Spin spinning={statusGetFiles === "loading"}>
				<Card>
					{listFile.data?.map((file) => (
						<Card.Grid key={file.id} style={gridStyle as React.CSSProperties}>
                            <Checkbox onClick={() => {checkboxChangeValue(file.id)}} checked={fileSelected.find(o => o === file.id) !== undefined} style={{position: 'absolute', zIndex: 2, left: '6px', top: '5px'}}/>
                            <Card onClick={()=> {checkboxChangeValue(file.id)}} style={{width: '100%', border: 'unset', position: 'relative', cursor: 'pointer'}}
                                cover={(isImageType(file.type || "") && (
                                    <img
                                        className="img-center"
                                        src={file.url}
                                        style={imageStyle as React.CSSProperties}
                                    />
                                )) || (
                                    <img
                                        className="img-center"
                                        src={
                                            fileIconList[Object.keys(fileIconList).find((k) => k === file.type) as keyof typeof fileIconList]
                                        }
                                        style={imageStyle as React.CSSProperties}
                                    />
                                )}>
                                <Meta style={{cursor: 'pointer'}} title={file.name} description={`Upload: ${moment(file.created_at).format('DD/MM/YYYY HH:mm')}`}/>
                            </Card>
						</Card.Grid>
					))}
				</Card>
				<Pagination
					style={{ marginTop: "10px", textAlign: "right" }}
					pageSize={20}
					total={get(listFile, "total", 0)}
					onChange={(page) => pageChange(page)}
				/>
			</Spin>
		</Modal>
        </>
	);
}

export default (FileSelectModal);
