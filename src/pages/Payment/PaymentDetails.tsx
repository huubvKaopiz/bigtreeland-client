import { Descriptions, Drawer, Tag } from "antd";
import moment from "moment";
import React from "react";
import { PaymentStatusList, PaymentType, PaymentTypeEnum } from "store/payments/slice";
import styled from "styled-components";
import { formatCurrency } from "utils/ultil";
import logo from "assets/image/mainlogo.png";
import Modal from "antd/lib/modal/Modal";
import { get } from "lodash";

const Wrapper = styled.div`
	position: relative;
	border: 1px solid rgba(64, 64, 64, 0.5);
	border-radius: 10px;
	padding: 10px 30px;
	.text-center {
		text-align: center;
	}
	.mb-20px {
		margin-bottom: 20px;
	}
	.logo {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		opacity: 70%;
	}
`;

function PaymentDetails({
	handleShowDetail,
	show,
	data,
}: {
	handleShowDetail: (state: boolean) => void;
	show: boolean;
	data: PaymentType | null;
}): JSX.Element {
	return (
		<>
			<Modal
				width={800}
				title="Thông tin phiếu chi"
				visible={show}
				cancelText=""
				onCancel={() => handleShowDetail(false)}
			>
				{data && (
				<Descriptions bordered>
					<Descriptions.Item span={2} label="Người lập"><a href="#">{get(data, "creator.profile.name")}</a></Descriptions.Item>
					<Descriptions.Item label="Ngày lập">{moment(data?.created_at).format("DD-MM-YYYY HH:mm")}</Descriptions.Item>
					<Descriptions.Item label="Số tiền">
						<strong style={{ color: "#cf1322" }}> {formatCurrency(data?.amount || 0)}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Loại chi">
						<Tag color={data?.type === 1 ? "#3498db" : "#d35400"}>{data && PaymentTypeEnum[data?.type]}</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Trạng thái">
						<Tag color={data.status === 1 ? "green" : "red"}>{PaymentStatusList[data?.status]}</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Lý do" span={4}>
						{data?.reason}
					</Descriptions.Item>
					<Descriptions.Item label="Ghi chú">
						{data?.note}
					</Descriptions.Item>
				</Descriptions>
			)}
			</Modal>
		</>
	);
}

export default PaymentDetails;
