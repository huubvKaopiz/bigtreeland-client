/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Image, Button, Descriptions, Input, Layout, List, PageHeader, Skeleton, Space, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Modal from "antd/lib/modal/Modal";

const { Title } = Typography;

export function ListTestResults(): JSX.Element {
	const params = useParams() as { test_id: string };
	const dispatch = useDispatch();

	useEffect(() => {
		if (params.test_id) {
			// dispatch(action)
		}
	});

	const listRs = [
		{
			id: 1,
			name: "Nguyen Van A",
			result_file: "",
			date: "2021-11-21 09:20",
		},
		{
			id: 2,
			name: "Nguyen Van B",
			result_file: "",
			date: "2021-11-21 10:12",
		},
		{
			id: 3,
			name: "Nguyen Van C",
			result_file: "",
			date: "2021-11-21 11:11",
		},
	];

	return (
		<Layout.Content>
			<PageHeader
				title="Bai test tieng anh 5 bai 2"
				subTitle="Danh sách bài làm"
				onBack={() => window.history.back()}
				style={{ backgroundColor: "white", marginTop: 20 }}
				extra={[
					<Button type="primary" key="2">Đăng đáp án</Button>,
				]}
			>
				<Descriptions size="small" column={2}>
					<Descriptions.Item label="Giáo viên tạo">Lili Qu</Descriptions.Item>
					<Descriptions.Item label="Lớp">Gonghu Road, Xihu District, Hangzhou, Zhejiang, China</Descriptions.Item>
					<Descriptions.Item label="Tham gia">
						<a>16/24</a>
					</Descriptions.Item>
					<Descriptions.Item label="Ngày tạo">2017-01-10</Descriptions.Item>
				</Descriptions>
			</PageHeader>
			<Title style={{ marginTop: 20 }} level={4}>Đề bài</Title>
			<Space style={{ marginTop: 20, backgroundColor: "white", padding: 10 }} size={[10, 10]} wrap>

				{new Array(10).fill(null).map((_, index) => (
					<Image
						key={index}
						width={200}
						src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
					/>
				))}
			</Space>
			<Title style={{ marginTop: 20 }} level={4}>Đáp án</Title>
			<Space style={{ marginTop: 20, backgroundColor: "white", padding: 10 }} size={[10, 10]} wrap>

				{new Array(10).fill(null).map((_, index) => (
					<Image
						key={index}
						width={200}
						src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
					/>
				))}
			</Space>
			<List
				rowKey="id"
				className="demo-loadmore-list"
				loading={false}
				itemLayout="horizontal"
				style={{ backgroundColor: "white", marginTop: 20, padding: 20 }}
				loadMore={true}
				dataSource={listRs}
				renderItem={(item) => (
					<List.Item actions={[<UploadResultModal key="upload" />, <CommentModal key="cmt" />]}>
						<Skeleton avatar title={false} loading={false} active>
							<List.Item.Meta
								avatar={
									<Image
										width={100}
										height={100}
										alt="logo"
										src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
									/>
								}
								title={<a href="https://ant.design">{item.name}</a>}
								description={item.date}
							/>
						</Skeleton>
					</List.Item>
				)}
			/>
		</Layout.Content>
	);
}

const { TextArea } = Input;
function CommentModal(): JSX.Element {
	const [show, setShow] = useState(false);
	const [comment, setComment] = useState<any>(null);
	const [point, setPoint] = useState("");

	function handleSubmit() {
		if (comment) {
			// console.log(comment)
		}
	}

	return (
		<>
			<Button type="link" onClick={() => setShow(true)}>
				Nhận xet
			</Button>
			<Modal
				title="Chấm điểm bài làm"
				visible={show}
				closable
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
				okText="Lưu lại"
			>
				<Input placeholder="Điểm" onChange={(e: any) => setPoint(e.value)} style={{ marginBottom: 20 }} />
				<TextArea placeholder="Nhận xét" onChange={(e: any) => setComment(e.value)} />
			</Modal>
		</>
	);
}


function UploadResultModal(): JSX.Element {
	const [show, setShow] = useState(false);

	const handleSubmit = () => {
		console.log("submit")
	}
	return (
		<>
			<Button type="link" onClick={() => setShow(true)}>
				Đăng bài chấm
			</Button>
			<Modal
				title="Tải bài chấm"
				visible={show}
				closable
				onCancel={() => setShow(false)}
				onOk={handleSubmit}
				okText="Lưu lại"
			>
				<Upload>
					<Button icon={<UploadOutlined />}>Upload</Button>
				</Upload>,
			</Modal>
		</>
	)
}