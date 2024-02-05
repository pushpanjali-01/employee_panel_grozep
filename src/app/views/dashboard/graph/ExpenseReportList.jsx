import React, { useState, useEffect } from 'react'
import { MDBDataTable } from 'mdbreact'
import moment from 'moment'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import './dashboard.css'
const ExpenseReportList = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            url.get('v1/in/stores-expenses?storeCode=' + user.storeCode)
                .then((res) => {
                    if (res.data.status === true) {
                        setData(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    const tableData = data.map((item, index) => ({
        sno: index + 1,
        remark: item.remark,
        amount: item.amount,
        date: moment(item.createdAt).format('LLL'),
    }))
    const tableHeaders = [
        {
            label: 'S no',
            field: 'sno',
            sort: 'asc',
        },
        {
            label: 'Date',
            field: 'date',
            sort: 'asc',
        },
        {
            label: 'Remark',
            field: 'remark',
            sort: 'asc',
        },
        {
            label: 'Amount',
            field: 'amount',
            sort: 'asc',
        },
    ]

    return (
        <div className="table-responsive">
            <MDBDataTable
                responsive
                striped
                bordered
                hover
                noBottomColumns={true}
                data={{ columns: tableHeaders, rows: tableData }}
                className="custom-table"
            />
        </div>
    )
}

export default ExpenseReportList
