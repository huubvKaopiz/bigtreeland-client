import { Button, Input, Modal } from "antd";
import { get } from "lodash";
import { useState } from "react";
import { useSelector } from "react-redux";
import { actionAddNotification } from "store/notifications/slice";
import { RootState, useAppDispatch } from "store/store";
import { NOTIFI_URIS } from "utils/const";

// SendNotiModal component
export default function SendNotiModal(prop: {
    studentInfo: { id: number; name: string; birthday: string, parent: { id: number, name: string } },
    show: boolean,
    setShow: (param: boolean) => void
}): JSX.Element {
    const { studentInfo, show, setShow } = prop;
    const dispatch = useAppDispatch();
    const [message, setMessage] = useState("");

    const sending = useSelector((state: RootState) => state.notificationReducer.addNotificationStatus);

    function handleSendNotification() {
        setShow(false);
        const user_ids: number[] = [];
        console.log(studentInfo)
        const userID = get(studentInfo, "parent.id", 0);
        if (userID > 0) user_ids.push(userID)
        const payload = {
            user_ids,
            message: {
                title: "Thông báo vào lớp!",
                body: message,
                data: {
                    uri: NOTIFI_URIS.ATTENDANCE_REMIND
                }
            }
        }
        dispatch(actionAddNotification(payload)).finally(() => {
            setShow(false);
        })
    }

    return (
        <>
            <Modal title="Gửi thông báo cho phụ huynh!"
                visible={show}
                onCancel={() => setShow(false)}
                onOk={handleSendNotification}
                footer={[
                    <Button key="btncancel" onClick={() => setShow(false)}>Huỷ bỏ</Button>,
                    <Button
                        key="btnsubmit"
                        type="primary"
                        onClick={() => handleSendNotification()}
                        loading={sending === 'loading' ? true : false}>Gửi đi
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