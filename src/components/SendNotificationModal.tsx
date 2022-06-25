import { Button, Input, Modal } from "antd"
import { StudentType } from "interface"
import { get } from "lodash"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { actionAddNotification } from "store/notifications/slice"
import { RootState, useAppDispatch } from "store/store"
import React from "react"

export default function SendNotificationModal(prop: {
	students: StudentType[]
	show: boolean
	setShow: (param: boolean) => void
	title?: string
}): JSX.Element {
	const { students, show, setShow, title } = prop
	const dispatch = useAppDispatch()
	const [message, setMessage] = useState("")
	const [notiTitle, setNotiTitle] = useState("")

	const sendNotiState = useSelector(
		(state: RootState) => state.notificationReducer.addNotificationStatus
	)

	useEffect(() => {
		if (title) setNotiTitle(title)
	}, [title])

	function handleSendNotification() {
		setShow(false)
		const user_ids: number[] = []
		students.forEach((st) => {
			const userID = get(st, "parent_id", 0)
			if (userID > 0) user_ids.push(userID)
		})
		const payload = {
			user_ids,
			message: {
				title: notiTitle,
				body: message,
				data: {},
			},
		}
		dispatch(actionAddNotification(payload))
	}

	return (
		<>
			<Modal
				title="Gửi thông báo cho phụ huynh"
				style={{ padding: 10 }}
				visible={show}
				onCancel={() => setShow(false)}
				onOk={handleSendNotification}
				footer={[
					<Button key="btncancel" onClick={() => setShow(false)}>
						Huỷ bỏ
					</Button>,
					<Button
						key="btnsubmit"
						type="primary"
						onClick={() => handleSendNotification()}
						loading={sendNotiState === "loading"}
					>
						Gửi đi
					</Button>,
				]}
			>
				<Input
					style={{ marginBottom: 20 }}
					placeholder="Nhập tiêu đề thông báo"
					value={notiTitle}
					onChange={(e) => setNotiTitle(e.target.value)}
				/>
				<Input.TextArea
					placeholder="Nhập nội dung thông báo"
					style={{ marginBottom: 20 }}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</Modal>
		</>
	)
}
