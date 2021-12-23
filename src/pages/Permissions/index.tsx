import { DeleteOutlined, EditOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Layout, notification, Space, Table } from "antd";
import RoleService from "api/role.service";
import { Permission } from "interface/interfaces";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionGetPermissions, PermistionType } from "store/permissions/slice";
import { RootState, useAppDispatch } from "store/store";
import styled from "styled-components";
import { PERMISSION_LIST } from "../../assets/mock-data/PermissionList";
import { DatePattern, dateSort, formatDate } from "../../utils/dateUltils";

const Wrapper = styled.div`
	.permission {
		&__divider {
			margin: 0 auto 24px;
		}
		&__button {
			display: flex;
			justify-content: flex-start;
			margin: 0 0 24px 0;
			padding-top: 20px;
		}
	}
`;

// Todo use fetch to get PERMISSION_LIST
// const tableItem: Permission[] = PERMISSION_LIST;
const tableColumn = [
	{
		title: "Id",
		key: "id",
		dataIndex: "id",
		// eslint-disable-next-line @typescript-eslint/prefer-as-const
		defaultSortOrder: "ascend" as "ascend",
		showSorterTooltip: false,
		sorter: {
			compare: (a: PermistionType, b: PermistionType) => a.id - b.id,
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
			compare: (a: PermistionType, b: PermistionType) => dateSort(a.created_at, b.created_at),
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
			compare: (a: PermistionType, b: PermistionType) => dateSort(a.updated_at, b.updated_at),
			multiple: 1,
		},
	},
	{
		title: "Action",
		key: "action",
		render: function ActionRow(_: string, record: PermistionType): JSX.Element {
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
	const dispatch = useAppDispatch()
	const [isLoading, setIsLoading] = useState(false);
	const listPermission = useSelector((state: RootState) => state.permissionReducer.permissions);
	const [tableItem, setTableItem] = useState<PermistionType[]>(listPermission)
	
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if(listPermission.length === 0) {
			setIsLoading(true)
			dispatch(actionGetPermissions()).then(()=> {
				setTableItem(listPermission)
			}).finally(() => {
				setIsLoading(false)
			})
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

	return (
		<Wrapper>
			<Layout.Content>
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
					pagination={{ pageSize: 20 }}
					dataSource={tableItem}
					size="small"
				/>
			</Layout.Content>
		</Wrapper>
	);
}

export default Permissions;
