import { Drawer } from "antd";
import moment from "moment";
import React from "react";
import { RevenueType, RevenuesTypeList, RevenuesStatusList } from "store/revenues/slice";
import styled from "styled-components";
import { formatCurrency } from "utils/ultil";
import logo from "assets/image/mainlogo.png";

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
		<>
			<Drawer
				width={"50%"}
				title="Thông tin phiếu thu"
				placement="right"
				visible={show}
				onClose={() => handleShowDetail(false)}
			>
				{data && (
					<Wrapper>
						<div className="logo">
							<img style={{ maxWidth: "100%" }} src={logo} alt="" />
						</div>
						<div style={{ position: "relative", zIndex: 1 }}>
							<h1 className="text-center">PHIẾU THU</h1>
							<h4 className="text-center mb-20px">
								<i>
									Ngày {moment(data?.created_at).format("DD")} tháng {moment(data?.created_at).format("MM")} năm{" "}
									{moment(data?.created_at).format("YYYY")}
								</i>
							</h4>
							<h3>Mã số: {data?.id}</h3>
							<h3>
								Người lập phiếu: <i style={{ color: "#3f8600" }}>{data?.creator?.name}</i>
							</h3>
							<h3>
								Loại chi:{" "}
								<i style={{ color: data?.type === 1 ? "#cf1322" : "#3f8600" }}>
									{data && RevenuesTypeList[data?.type]}
								</i>
							</h3>
							<h3>
								Lý do chi: <i>{data?.reason}</i>
							</h3>
							<h3>
								Số tiền: <i style={{ color: "#3f8600" }}> {formatCurrency(data?.amount)}</i>
							</h3>
							<h3>
								Ghi chú: <i>{data?.note}</i>
							</h3>
							<h3>
								Trạng thái: <i>{RevenuesStatusList[data?.status]}</i>
							</h3>
						</div>
					</Wrapper>
				)}
			</Drawer>
		</>
	);
}

export default RevenueDetails;
