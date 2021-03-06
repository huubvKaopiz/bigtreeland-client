import { PlusOutlined } from "@ant-design/icons";
import {
	Button,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Spin,
} from "antd";
import { EmployeeType, UserType } from "interface";
import { debounce, get } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
	actionAddNewRevenues,
	RevenuesRequestAddType,
	RevenuesTypeList,
} from "store/revenues/slice";
import { RootState, useAppDispatch } from "store/store";
import { actionGetUsers } from "store/users/slice";
import styled from "styled-components";
import { ROLE_NAMES } from "utils/const";

const Wrapper = styled.div``;

function AddNewRevenues(): JSX.Element {
	const [show, setShow] = useState(false);
	const [receiveType, setReceiveType] = useState(0);
	const [revenuesForm] = Form.useForm();

	//Redux state
	const dispatch = useAppDispatch();
	const creatorUser = useSelector((state: RootState) => state.auth.user);
	const userList = useSelector((state: RootState) => state.userReducer.users);
	const getUsersStatus = useSelector((state: RootState) => state.userReducer.statusGetUsers);

	const statusAddRevenues = useSelector((state: RootState) => state.revenuesReducer.addRevenuesStatus);
	const debounceSearch = useRef(
		debounce((nextValue) => dispatch(actionGetUsers({ search: nextValue, exclude:ROLE_NAMES.PARENT })), 500)
	).current;

	useEffect(() => {
		console.log(show)
		if(show) dispatch(actionGetUsers({exclude:ROLE_NAMES.PARENT }));
	},[show])

	useEffect(() => {
		if (statusAddRevenues === "success") {
			revenuesForm.resetFields();
			setShow(false);
		}
	}, [revenuesForm, statusAddRevenues]);

	function submitForm(formValue: RevenuesRequestAddType) {
		const formData = { ...formValue };
		formData.date = moment(formValue.date).format("YYYY-MM-DD");
		formData.creator_id = Number(creatorUser?.id);
		dispatch(actionAddNewRevenues(formData));
	}

	return (
		<Wrapper>
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => setShow(true)}
			>
				Thêm phiếu thu
			</Button>
			<Modal
				width={1000}
				visible={show}
				closable={true}
				onCancel={() => setShow(false)}
				footer={[
					<Button key="" onClick={() => {
						setShow(false);
						revenuesForm.resetFields();
					}}>
						Huỷ bỏ
					</Button>,
					<Button type="primary" form="eForm" key="submit" htmlType="submit">
						Lưu lại
					</Button>,
				]}
			>
				<Spin spinning={statusAddRevenues === "loading"}>
					<Form
						id="eForm"
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 14 }}
						layout="horizontal"
						form={revenuesForm}
						onFinish={submitForm}
					>
						<Divider>Tạo phiếu doanh thu</Divider>
						<Form.Item name="sale_id" label="Người thu">
							<Select
								showSearch={true}
								onSearch={(e) => debounceSearch(e)}
								notFoundContent={getUsersStatus === "loading"? <Spin size="small" /> : null}
								filterOption={false}
							>
								{userList &&
									get(userList, "data", []).map((user: UserType) => (
										<Select.Option key={user.id} value={user.id}>
											{`${get(user,"profile.name","")}`} <a>{user.phone ?? ''}</a>
										</Select.Option>
									))}
							</Select>
						</Form.Item>

						<Form.Item
							name="amount"
							label="Số tiền"
							rules={[
								{ required: true, message: "Số tiền không được để trống!" },
							]}
						>
							<InputNumber
								style={{ width: "100%" }}
								formatter={(value) =>
									`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								parser={(value: any) => value.replace(/(,*)/g, "")}
							/>
						</Form.Item>
						<Form.Item
							name="type"
							label="Loại chi tiêu"
							rules={[
								{
									required: true,
									message: "Loại chi tiêu không được để trống!",
								},
							]}
						>
							<Select onChange={(v) => v !== undefined && setReceiveType(+v)}>
								{RevenuesTypeList.map((v, i) => (
									<Select.Option value={i} key={i}>
										{v}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name="date"
							label="Ngày thu"
							rules={[
								{ required: true, message: "Ngày thu không được để trống!" },
							]}
						>
							<DatePicker />
						</Form.Item>
						{receiveType === 0 && (
							<Form.Item name="reason" label="Lý do">
								<Input.TextArea />
							</Form.Item>
						)}
						<Form.Item name="note" label="Ghi chú">
							<Input.TextArea />
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		</Wrapper>
	);
}

export default AddNewRevenues;
