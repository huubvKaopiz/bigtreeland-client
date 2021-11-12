
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Select, Input, Spin } from 'antd';
import { SelectProps } from 'antd/es/select';
import { EditOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionUpdateClass, actionGetClasses } from 'store/classes/slice';
import { actionGetEmployees } from 'store/employees/slice';
import { get, debounce } from 'lodash';
import { ClassType, EmployeeType } from 'interface';

export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
    fetchOptions: (search: string) => ValueType[];
    debounceTimeout?: number;
}

export default function EditClassModal(props: { calssInfo: ClassType }): JSX.Element {
    const { calssInfo } = props;
    const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();
    const addStatus = useSelector((state: RootState) => state.classReducer.updateClassStatus);
    const teachers = useSelector((state: RootState) => state.employeeReducer.employees);
    const getTeachersStatus = useSelector((state: RootState) => state.employeeReducer.getEmployeesStatus);

    useEffect(() => {
        if (addStatus === 'success') {
            setShow(false);
            dispatch(actionGetClasses({ page: 1 }));
        }
    }, [dispatch, addStatus]);

    useEffect(() => {
        dispatch(actionGetEmployees({ class_id: 0 }))
    }, [dispatch])

    function handleSubmit(values: any) {
        dispatch(actionUpdateClass({ data: values, cID: calssInfo.id }))
    }

    function handleSearchTeacher(search: string): EmployeeType[] {
        console.log("handle search teacher!")
        dispatch(actionGetEmployees({ search }));
        if (getTeachersStatus === "success") {
            return teachers?.data as EmployeeType[];
        }
        return [];
    }
    function TeacherSelect<ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any>
        ({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) {
        const [fetching, setFetching] = React.useState(false);
        const [options, setOptions] = React.useState<ValueType[]>([]);

        const debounceFetcher = React.useMemo(() => {
            const loadOptions = (value: string) => {
                setOptions([]);
                setFetching(true);

                const newOptions: any[] = [];
                fetchOptions(value).map((emp: EmployeeType) => {
                    newOptions.push({ label: <span>{emp.name}</span>, value: emp.id } as ValueType)
                })
                console.log(newOptions)
                setOptions(newOptions);
                setFetching(false);
            };
         
            return debounce(loadOptions, debounceTimeout);
        }, [fetchOptions, debounceTimeout]);
        console.log(options)

        return (
            <Form.Item label="Giáo viên" name="employee_id">
            <Select<ValueType>
                labelInValue
                showSearch
                filterOption={false}
                onSearch={debounceFetcher}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                {...props}
                options={options}
            />
            </Form.Item>
        );
    }

    return (
        <div>
            <Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
            <Modal visible={show} title="Thêm lớp học" onCancel={() => setShow(false)}
                footer={[
                    <Button key="btnsubmit" type="primary" htmlType="submit" form="aForm">Lưu lại</Button>
                ]}
                width={800}
            >
                <Form
                    id="aForm"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 17 }}
                    layout="horizontal"
                    // initialValues={}
                    onFinish={handleSubmit}
                >

                    <Form.Item label="Tên lớp" name="name">
                        <Input />
                    </Form.Item>
                    {/* <Form.Item label="Giáo viên" name="employee_id">
                        <Select>
                            <Select.Option value={-1}>Chọn sau</Select.Option>
                            {
                                teachers && get(teachers, "data", []).map((tc: EmployeeType) => {
                                    return (
                                        <Select.Option value={tc.id} key={tc.id}>{tc.name} - {tc.user.phone}</Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item> */}
                    <TeacherSelect
                        placeholder="Chọn giáo viên"
                        fetchOptions={handleSearchTeacher}
                    />
                    <Form.Item label="Số buổi học" name="sessions_num">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Học phí" name="fee_per_session">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Lịch học" name="schedule">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}