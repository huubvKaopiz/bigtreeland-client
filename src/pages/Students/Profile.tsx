import { Button, Tooltip } from 'antd';
import { SnippetsOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';


export default function AcademicProfile(props: { student_id: number }): JSX.Element {
    const {student_id} = props;
    const [show, setShow] = useState(false);
    const loadStatus = useSelector((state:RootState) => state.studentReducer.getStudentStatus);

    return (
        <>
           <Tooltip placement="top" title="Hồ sơ học tập"> <Button icon={<SnippetsOutlined />} type="link"/></Tooltip>
        </>
    )
}