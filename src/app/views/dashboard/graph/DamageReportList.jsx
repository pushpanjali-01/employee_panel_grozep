import React, { useState, useEffect } from 'react'
import { MDBDataTable } from 'mdbreact'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import './dashboard.css'
const DamageReportList = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            url.get('v1/in/stores-damages?storeCode=' + user.storeCode)
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
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        remark: item.remark,
    }))
    const tableHeaders = [
        {
            label: 'S no',
            field: 'sno',
            sort: 'asc',
        },
        {
            label: 'Product ID',
            field: 'productVariantId',
            sort: 'asc',
        },
        {
            label: 'Quantity',
            field: 'quantity',
            sort: 'asc',
        },
        {
            label: 'Remark',
            field: 'remark',
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

export default DamageReportList
