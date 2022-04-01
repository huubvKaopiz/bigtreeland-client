import {
    LikeOutlined,
    MessageOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Button,
    Image,
    List,
    Space,
    DatePicker
} from "antd";
import { ClassType, StudentType, TestType } from "interface";
import { get } from "lodash";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState, useAppDispatch } from "store/store";
import { actionGetTestes } from "store/testes/slice";
import { defaul_image_base64, STUDY_TABS } from "utils/const";
import AddTest from "./addTestModal";
const { RangePicker } = DatePicker;

export function Tests(props: {
    classInfo: ClassType | null;
    students: StudentType[];
}): JSX.Element {

    const { classInfo, students } = props;
    const dispatch = useAppDispatch();
    const history = useHistory();

    const testList = useSelector((state: RootState) => state.testReducer.testes);
    const getTestListState = useSelector((state: RootState) => state.testReducer.getTestesStatus);

    const activeTab = useSelector(
        (state: RootState) => state.classReducer.classDetailTabKey
    );
    useEffect(() => {
        if (classInfo && activeTab === STUDY_TABS.TEST) {
            dispatch(actionGetTestes({ class_id: classInfo.id }));
        }
    }, [classInfo, activeTab])
    /* For Test */
    function handleChangePageOfTest(page: number) {
        dispatch(actionGetTestes({ class_id: get(classInfo, "id", 0), page }));
    }

    const handleChangeDateRange = (_: any, dateString: string[]) => {
        const from_date = dateString[0] || void 0;
        const to_date = dateString[1] || void 0;
        if (classInfo) {
            dispatch(
                actionGetTestes({ class_id: classInfo.id, from_date, to_date })
            );
        }
    }
    return (
        <>
            <Space >
                <RangePicker
                    style={{ marginTop: 20, marginBottom: 20 }}
                    onChange={handleChangeDateRange}
                />
                <AddTest classInfo={classInfo} />
            </Space>
            <List
                itemLayout="vertical"
                size="large"
                loading={getTestListState === 'loading'}
                pagination={{
                    onChange: handleChangePageOfTest,
                    pageSize: 20,
                    total: get(testList, "total", 0),
                }}
                dataSource={get(testList, "data", [])}
                renderItem={(item: TestType) => (
                    <List.Item
                        onClick={() =>
                            history.push({
                                pathname: `/study-tests/${item.id}/${get(classInfo, "id", 0)}`,
                            })
                        }
                        style={{ backgroundColor: "white", cursor: "pointer" }}
                        key={item.id}
                        actions={[
                            <Space
                                key="act1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <Button type="link" icon={<TeamOutlined />} />
                                {students.length}
                            </Space>,
                            <Space
                                key="act2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {/* Todo refer liked */}
                                <Button type="link" icon={<LikeOutlined />} /> 0
                            </Space>,
                            <Space
                                key="act3"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {/* Todo refer commented */}
                                <MessageOutlined /> 0
                            </Space>,
                        ]}
                        extra={
                            <Image
                                width={100}
                                height={100}
                                alt="logo"
                                src={item.content_files.length > 0 ? item.content_files[0].url : "error"}
                                fallback={defaul_image_base64}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        }
                    >
                        <List.Item.Meta
                            title={item.title}
                            description={<>{item.date}</>}
                        />
                    </List.Item>
                )}
            />
        </>
    )
}