import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, DatePicker, Layout, List, Modal, Select, Space, Spin } from 'antd';
import useDebouncedCallback from 'hooks/useDebounceCallback';
import useIsAdmin from 'hooks/useIsAdmin';
import usePermissionList from 'hooks/usePermissionList';
import { StudySummaryType } from 'interface';
import { get } from 'lodash';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { actionGetClasses } from 'store/classes/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionDeleteStudySummary, actionGetStudySummaryList } from 'store/study-summary/slice';
import { isHavePermission } from 'utils/ultil';
import { CreateStudySummary } from './createModal';

const { confirm } = Modal;
const { Option } = Select;
export function StudySumaryBoard(props: { class_id?: number }): JSX.Element {
    const { class_id } = props;
    const history = useHistory();
    const dispatch = useAppDispatch();
    const permissionList = usePermissionList();
	const isAdmin = useIsAdmin();
	const [search, setSearch] = useState("");

	const searchClassState = useSelector((state: RootState) => state.classReducer.getClassesStatus);
    const classList = useSelector((state: RootState) => state.classReducer.classes)
    const studySummaryList = useSelector((state: RootState) => state.studySummaryReducer.studySummaryList)
    const getStudySummaryListStatus = useSelector((state: RootState) => state.studySummaryReducer.getStudySummaryListState)

    const searchClass = useDebouncedCallback((searchText) => {
        setSearch(searchText)
		dispatch(actionGetClasses({ search }))
	}, 500)
    
    useEffect(() => {
        if (class_id) {
            dispatch(actionGetStudySummaryList({ class_id }));
        } else {
            dispatch(actionGetStudySummaryList({}));
            dispatch(actionGetClasses({}));
        }
    }, [dispatch, class_id])

    function handleChangeClass(classID: number) {
        if (classID > 0) {
            dispatch(actionGetStudySummaryList({ class_id: classID }));
        } else {
            dispatch(actionGetStudySummaryList({}));
        }
    }

    function onChangeDateFilter(date: Moment | null) {
        console.log(date)
    }

    function handleDelete(sID: number) {
        confirm({
            title: 'Bạn muốn xoá bảng tổng kết này!',
            icon: <CheckCircleOutlined />,
            onOk() {
                dispatch(actionDeleteStudySummary(sID)).finally(() => {
                    if (class_id) {
                        dispatch(actionGetStudySummaryList({ class_id }));
                    } else {
                        dispatch(actionGetStudySummaryList({}));
                    }
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    return (
        <Layout.Content>
            {
                !class_id &&
                <Space style={{ marginBottom: 20, marginTop: 20 }}>
                    <DatePicker style={{ width: 200 }} placeholder="Lọc theo quý" onChange={onChangeDateFilter} picker="quarter" />
                    <Select defaultValue={0} style={{ width: 480 }} onChange={handleChangeClass}
					showSearch
					onSearch={(e) => searchClass(e)}
					filterOption={false}
					notFoundContent={searchClassState === "loading" ? <Spin size="small" /> : null}
					>
					<Option value={0}>Tất cả</Option>
					{get(classList, "data", []).map((cl) => (
						<Option value={cl.id} key={cl.id}>
							{" "}
							{cl.name}
						</Option>
					))}
				</Select>
                    { (isAdmin || isHavePermission(permissionList, "study-summary-boards.store")) && 
                        <CreateStudySummary classList={get(classList, "data", [])} class_id={0} />
                    }
                </Space>
            }
            <List
                itemLayout="horizontal"
                dataSource={get(studySummaryList, "data", [])}
                loading={getStudySummaryListStatus === 'loading' ? true : false}
                renderItem={(item: StudySummaryType) => (
                    <List.Item
                        actions={[
                            (
                                (isAdmin || isHavePermission(permissionList, "study-summary-boards.index")) && 
                                <Button type="link" key="list-loadmore-edit" onClick={() => history.push({ pathname: `/study-summary-detail/${item.id}`, state: { summaryInfo: item } })}>Chi tiết</Button>),
                            (
                                (isAdmin || isHavePermission(permissionList, "study-summary-boards.destroy")) &&
                                <Button danger type="link" key="list-loadmore-edit" onClick={() => handleDelete(item.id)}>Xoá</Button>)
                        ]}
                    >
                        <List.Item.Meta
                            // avatar={<TableOutlined />}

                            title={<a
                                onClick={() => history.push({ pathname: `/study-summary-detail/${item.id}`, state: { summaryInfo: item } })}>
                                {`${moment(item.from_date).format("DD/MM/YYYY")} - ${moment(item.to_date).format("DD/MM/YYYY")}`}
                            </a>}
                            description={get(item, "class.name", "")}
                        />
                    </List.Item>
                )}
            />
        </Layout.Content>
    )
}