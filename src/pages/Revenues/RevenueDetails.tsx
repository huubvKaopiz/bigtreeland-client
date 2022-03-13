import { Descriptions, Modal, Tag } from "antd";
import { get } from "lodash";
import moment from "moment";
import React from "react";
import { RevenuesStatusList, RevenuesTypeList, RevenueType } from "store/revenues/slice";
import { formatCurrency } from "utils/ultil";

function RevenueDetails({
	handleShowDetail,
	show,
	data,
}: {
	handleShowDetail: (state: boolean) => void;
	show: boolean;
	data: RevenueType | null;
}): JSX.Element {
	return (
		<Modal
			width={1000}
			title="Thông tin phiếu thu"
			visible={show}
			onCancel={() => handleShowDetail(false)}
			footer={null}
		>
			{data && (
				<Descriptions bordered>
					<Descriptions.Item span={2} label="Người lập"><a href="#">{get(data, "creator.profile.name")}</a></Descriptions.Item>
					<Descriptions.Item label="Ngày lập">{moment(data?.created_at).format("DD-MM-YYYY HH:mm")}</Descriptions.Item>
					<Descriptions.Item label="Số tiền">
						<strong style={{ color: "#3f8600" }}> {formatCurrency(data?.amount || 0)}</strong>
					</Descriptions.Item>
					<Descriptions.Item label="Loại doanh thu">
						<Tag color={data?.type === 1 ? "#3498db" : "#d35400"}>{data && RevenuesTypeList[data?.type]}</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Trạng thái">
						<Tag color={data.status === 1 ? "green" : "red"}>{RevenuesStatusList[data?.status]}</Tag>
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
	);
}

export default RevenueDetails;
