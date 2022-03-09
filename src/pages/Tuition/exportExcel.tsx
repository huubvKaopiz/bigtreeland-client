import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

import { CSVLink, CSVDownload } from "react-csv";
import { PeriodTuitionType, StudentType } from 'interface';

interface ExportDataType {
    name: string;
    birthday: string;
    total: string;
    status: string;
}

export default function ExportExcel(props: {
    periodTuition: PeriodTuitionType | null;
    students: StudentType[];
    feesPerStudent: number[];
}): JSX.Element {
    const { periodTuition, students, feesPerStudent } = props;
    const [exportData, setExportData] = useState<ExportDataType[]>([]);

    useEffect(() => {
        if (periodTuition && students && feesPerStudent) {
            const csvData: ExportDataType[] = []
            students.forEach((st) => {
                const tuitionFee = periodTuition.tuition_fees.find((tuition) => tuition.student_id === st.id);
                if (tuitionFee) {
                    const fee = feesPerStudent[tuitionFee.id]! + +tuitionFee.prev_debt - +tuitionFee.fixed_deduction - +tuitionFee.flexible_deduction - +tuitionFee.residual
                    csvData.push({
                        name: st.name,
                        birthday: st.birthday,
                        total: `${fee}`,
                        status: `${tuitionFee.status}`
                    })
                }

            })
            setExportData(csvData)
        }
    }, [periodTuition, students, feesPerStudent])

    return (
        <>
            <CSVLink data={exportData}>
                <Button style={{ background: "#f39c12", color: "#fff" }} icon={<DownloadOutlined />}>Tải excel</Button>
            </CSVLink>
        </>
    )
}