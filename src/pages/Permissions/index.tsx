import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { PERMISSION_LIST } from "../../assets/mock-data/PermissionList";
import { formatDate, dateSort, DatePattern } from "../../utils/dateUltils";
import { Button, Layout, PageHeader, Divider, Space, Table, notification } from "antd";
import { SearchOutlined, TeamOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Permission } from "interface/interfaces";
import RoleService from "api/role.service";

const Wrapper = styled.div`
	.permission {
		&__divider {
			margin: 0 auto 24px;
		}
		&__button {
			display: flex;
			justify-content: flex-end;
			margin: 0 0 24px 0;
		}
	}
`;

// Todo use fetch to get PERMISSION_LIST
const tableItem: Permission[] = PERMISSION_LIST;
const tableColumn = [
	{
		title: "Id",
		key: "id",
		dataIndex: "id",
		// eslint-disable-next-line @typescript-eslint/prefer-as-const
		defaultSortOrder: "ascend" as "ascend",
		showSorterTooltip: false,
		sorter: {
			compare: (a: Permission, b: Permission) => a.id - b.id,
			multiple: 3,
		},
	},
	{
		title: "Tên",
		key: "name",
		dataIndex: "name",
		render: function UserLink(text: string): JSX.Element {
			return (
				<a className="example-link">
					<Space>
						<TeamOutlined />
						{text}
					</Space>
				</a>
			);
		},
	},
	{
		title: "Ngày tạo",
		key: "created_at",
		dataIndex: "created_at",
		render: function UserLink(date: string): JSX.Element {
			return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
		},
		showSorterTooltip: false,
		sorter: {
			compare: (a: Permission, b: Permission) => dateSort(a.created_at, b.created_at),
			multiple: 2,
		},
	},
	{
		title: "Ngày update",
		key: "updated_at",
		dataIndex: "updated_at",
		render: function UserLink(date: string): JSX.Element {
			return <>{formatDate(date, DatePattern.DD_MM_YYYY_HH_mm_ss)}</>;
		},
		showSorterTooltip: false,
		sorter: {
			compare: (a: Permission, b: Permission) => dateSort(a.updated_at, b.updated_at),
			multiple: 1,
		},
	},
	{
		title: "",
		key: "action",
		render: function ActionRow(_: string, record: Permission): JSX.Element {
			return (
				<Space size="large" style={{ display: "flex", justifyContent: "center" }}>
					<a>
						<EditOutlined />
					</a>
					<a
						onClick={() => {
							RoleService.deleteRole(record.id)
								.then(() => {
									notification.success({
										message: `Xoá quyền ${record.name} thành công!`,
									});
								})
								.catch(() => {
									notification.error({
										message: "Có lỗi xảy ra!",
									});
								});
						}}
					>
						<DeleteOutlined />
					</a>
				</Space>
			);
		},
	},
];

function Permissions(): JSX.Element {
	const [isLoading, setIsLoading] = useState(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	}, []);

	return (
		<Wrapper>
			<Layout.Content>
				<PageHeader
					title="Permission"
					className="permission__header"
					subTitle="Danh sách quyền người dùng"
				></PageHeader>
				<Divider className="permission__divider" />
				<div className="permission__button">
					<Space>
						<Button type="primary">
							<SearchOutlined />
						</Button>
						<Button type="primary">Tạo quyền mới</Button>
					</Space>
				</div>
				<Table
					columns={tableColumn}
					loading={isLoading}
					pagination={{ position: ["bottomCenter"], pageSize: 20 }}
					dataSource={tableItem}
					size="small"
				/>
			</Layout.Content>
		</Wrapper>
	);
}

export default Permissions;
