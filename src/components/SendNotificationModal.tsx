import { Button, Input, Modal } from "antd";
import { StudentType } from "interface";
import { get } from "lodash";
import { useState } from "react";
import { useSelector } from "react-redux";
import { actionAddNotification } from "store/notifications/slice";
import { RootState, useAppDispatch } from "store/store";
import { NOTIFI_URIS } from "utils/const";

export default function SendNotificationModal(prop: {
    students:StudentType[],
    show: boolean,
    setShow: (param: boolean) => void
    title: string;
    uri: NOTIFI_URIS | ''
}): JSX.Element {
    const { students, show, setShow, title, uri } = prop;
    const dispatch = useAppDispatch();
    const [message, setMessage] = useState("");

    const sendNotiState = useSelector((state: RootState) => state.notificationReducer.addNotificationStatus);

    function handleSendNotification() {
        setShow(false);
        const user_ids: number[] = [];
        students.forEach((st)=>{
            const userID = get(st, "parent_id", 0);
            if (userID > 0) user_ids.push(userID)
        })
        const payload = {
            user_ids,
            message: {
                title,
                body: message,
                data: {
                    uri
                }
            }
        }
        dispatch(actionAddNotification(payload));
    }

    return (
        <>
            <Modal title={title}
                visible={show}
                onCancel={() => setShow(false)}
                onOk={handleSendNotification}
                footer={[
                    <Button key="btncancel" onClick={() => setShow(false)}>Huỷ bỏ</Button>,
                    <Button
                        key="btnsubmit"
                        type="primary"
                        onClick={() => handleSendNotification()}
                        loading={sendNotiState === 'loading'}>Gửi đi
                    </Button>

                ]}
            >
                <Input.TextArea
                    placeholder="Write something here!"
                    style={{ marginBottom: 20 }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} />
            </Modal>

        </>
    )
}