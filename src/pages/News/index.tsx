import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Layout, List, Modal, Skeleton, Space } from 'antd';
import { NewsType } from 'interface';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionDeleteNews, actionGetNewsList } from 'store/news/slice';
import { RootState, useAppDispatch } from 'store/store';
import { AddNewsModal } from './addNewsModal';
const { confirm } = Modal;

export function News(): JSX.Element {

    const dispatch = useAppDispatch();
    const [editting, setEditting] = useState(false);
    const [show, setShow] = useState(false);
    const [newEditting, setNewEditting] = useState<NewsType | null>(null);
    const newsList = useSelector((state: RootState) => state.newsReducer.newsList);
    const getNewsListState = useSelector((state: RootState) => state.newsReducer.getNewsListStatus);


    useEffect(() => {
        dispatch(actionGetNewsList({ per_page: 20 }));
    }, [dispatch])

    function handleAddNew() {
        setShow(true);
        setEditting(false);
        setNewEditting(null);
    }


    function handleEdit(newInfo: NewsType) {
        setShow(true);
        setEditting(true);
        setNewEditting(newInfo);
    }

    function handleDelete(newID: number) {
        confirm({
            title: "Xác nhận xoá tin bài?",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                dispatch(actionDeleteNews(newID)).finally(() => {
                    dispatch(actionGetNewsList({ per_page: 20 }))
                })
            }
        })
    }

    return (
        <Layout.Content>
            <AddNewsModal editting={editting} setEditting={setEditting} newInfo={newEditting} show={show} setShow={setShow} />
            <Space style={{ padding: 20 }}>
                <Input suffix={<SearchOutlined />} style={{ width: 500 }} placeholder="Tìm theo tiêu đề" />
                <Button type="primary" onClick={() => handleAddNew()} icon={<PlusOutlined />}>Thêm tin bài</Button>
            </Space>
            <List
                style={{ padding: 20 }}
                className="demo-loadmore-list"
                // loading={getNewsListState === "loading" ? true : false}
                itemLayout="horizontal"
                dataSource={get(newsList, "data", [])}
                renderItem={(item:NewsType) => (
                    <List.Item
                        actions={[
                            <Button type="link" danger key="list-loadmore-more" onClick={() => handleDelete(item.id)}>Xoá</Button>,
                            <Button type="link" key="list-loadmore-edit" onClick={() => handleEdit(item)}>Chi tiết</Button>,
                        ]}
                    >
                        <Skeleton avatar title={false} loading={getNewsListState === "loading" ? true : false} active>
                            <List.Item.Meta
                                // avatar={<ProfileOutlined />}
                                title={<a href="#">{item.title}</a>}
                                description={item.created_at}
                            />
                            {/* <div
                                dangerouslySetInnerHTML={{ __html: item.content }}
                                style={{
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                    overflow: "hidden",
                                }}>
                            </div> */}
                        </Skeleton>
                    </List.Item>
                )}
            />
        </Layout.Content>
    )
}