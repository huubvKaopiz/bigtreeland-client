import React, { useState } from "react";
import styled from "styled-components";
import { PERMISSION_LIST } from "../../assets/mock-data/PermissionList";
import { formatDate, dateSort, DatePattern } from "../../utils/dateUltils";
import { Button, Layout, PageHeader, Divider, Space, Table } from "antd";
import { SearchOutlined, TeamOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

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

interface Permission {
	id: number;
	name: string;
	guard_name: string;
	created_at: string;
	updated_at: string;
}

// Todo use fetch to get PERMISSION_LIST
const tableItem: Permission[] = PERMISSION_LIST;
const tableColumn = [
	{
		title: "Id",
		key: "id",
		dataIndex: "id",
		defaultSortOrder: "ascend" as 'ascend',
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
		render: function ActionRow(text: string, record: Permission): JSX.Element {
			return (
				<Space size="large" style={{display: "flex", justifyContent: "center"}}>
					<a>
						<EditOutlined />
					</a>
					<a>
						<DeleteOutlined />
					</a>
				</Space>
			);
		},
	},
];

function Permissions(): JSX.Element {
	const [isLoading, setIsLoading] = useState(false);
	return (
		<Wrapper>
			<Layout.Content>
				<PageHeader
					title="Permission"
					className="permission__header"
					subTitle="Quản lý phân quyền người dùng"
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
				/>
			</Layout.Content>
		</Wrapper>
	);
}

export default Permissions;
