import {
    Alert,
    Button,
    Input,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { RootState } from "store/store";
import {
    actionAddTestResult,
    actionUpdateTestResult,
    resetUpdateTestResultsStatus,
} from "store/test-results/slice";
import { TestResultDataType } from ".";
import FileSelectModal from "components/FileSelectModal";
import { FileType } from "interface";


const { TextArea } = Input;
export default function UpdateModal(props: {
    testResultInfo: TestResultDataType | null;
    test_id: number | null;
    show: boolean;
    setShow: (param: boolean) => void;
}): JSX.Element {
    const { testResultInfo, show, setShow, test_id } = props;
    const dispatch = useDispatch();
    const [comment, setComment] = useState("");
    const [point, setPoint] = useState("");
    const [correctLink, setCorrectLink] = useState("");
    const [fileSelected, setFileSelected] = useState<FileType[]>([]);
    const [showSelect, setShowSelect] = useState(false);

    // application state
    const updateTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.updateTestResultStatus
    );
    const addTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.addTestResultStatus
    );

    useEffect(() => {
        if (testResultInfo?.test_result) {
            setComment(testResultInfo.test_result.teacher_comment)
            setPoint(testResultInfo.test_result.point)
            setFileSelected(testResultInfo.test_result.correct_files)
            setCorrectLink(testResultInfo.test_result.correct_link)
        } else {
            setComment("")
            setPoint("")
            setCorrectLink("")
            setFileSelected([])
        }
    }, [testResultInfo])


    function handleSubmit() {
        if (testResultInfo) {
            if (testResultInfo.test_result) {
                const data = {
                    id: testResultInfo.test_result.id,
                    teacher_comment: comment,
                    point,
                    correct_link:correctLink,
                    correct_files: fileSelected.map((file) => file.id),
                };
                dispatch(actionUpdateTestResult(data));
            } else if (test_id) {
                const data = {
                    test_id,
                    student_id: testResultInfo.student.id,
                    teacher_comment: comment,
                    correct_link:correctLink,
                    point,
                    correct_files: fileSelected.map((file) => file.id),
                }
                dispatch(actionAddTestResult(data))
            }
        }
    }

    return (
        <>
            <Modal
                title="Ch???m ??i???m v?? nh???n x??t"
                width={800}
                visible={show}
                closable
                onCancel={() => setShow(false)}
                onOk={handleSubmit}
                okText="L??u l???i"
                cancelText="Hu??? b???"
                confirmLoading={updateTestResultState === "loading" || addTestResultState === 'loading'}
            >
                <div style={{ padding: 20 }}>
                    <Alert
                        message="N???u h???c sinh ch??a n???p b??i th?? vi???c ch???m ??i???m v?? nh???n x??t s??? ??i k??m v???i vi???c gi??o vi??n x??c nh???n ???? n???p b??i cho h???c sinh."
                        type="warning"
                    />
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Ch???m ??i???m</p>
                    <Input
                        placeholder="0.0"
                        onChange={({ target: { value } }) => setPoint(value)}
                        value={point}
                        style={{width:100}}
                    />
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Nh???n x??t</p>
                    <TextArea
                        placeholder="Vi???t nh???n x??t b??i l??m c???a h???c sinh..."
                        onChange={({ target: { value } }) => setComment(value)}
                        value={comment}
                        style={{ height: 100 }}
                    />
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Link b??i ch???a</p>
                    <Input placeholder="D??n ???????ng d???n b??i ch???a n???u c??..." onChange={(e)=>setCorrectLink(e.target.value)} value={correctLink}/>
                    <p style={{ marginTop: 20 }}>???nh b??i ch???a</p>
                    <FileSelectModal
                        defaultSelected={fileSelected}
                        isShow={showSelect}
                        okFunction={setFileSelected}
                        closeFunction={() => setShowSelect(false)}
                        showSelectedList
                        review={true}
                    >
                        <Button
                            onClick={() => setShowSelect(true)}
                            type="primary"
                            ghost
                            size="middle"
                            icon={<UploadOutlined />}
                        >
                            Ch???n files
                        </Button>
                    </FileSelectModal>
                </div>
            </Modal>
        </>
    );
}
