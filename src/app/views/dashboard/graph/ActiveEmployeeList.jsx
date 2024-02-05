import React, { useState, useEffect } from 'react'
import { MDBDataTable } from 'mdbreact'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import './dashboard.css'
const DeliveryBoyZoneList = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            url.get(`v1/in/stores-active?storecode=${user.storeCode}`)
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
        id: item.employeeId,
        name: item.employee.name,
        role: item.role,
        email: item.employee.email,
        domainMail: item.employee.domainMail,
        gender: item.employee.gender,
        gender: item.employee.gender,
        address: item.employee.address,
        workingState: item.workingState,
        mobileNumber: item.employee.phone,
    }))
    const tableHeaders = [
        {
            label: 'S no',
            field: 'sno',
            sort: 'asc',
        },
        {
            label: 'Name',
            field: 'name',
            sort: 'asc',
        },
        {
            label: 'Role',
            field: 'role',
            sort: 'asc',
        },
        {
            label: 'Domain Mail',
            field: 'domainMail',
            sort: 'asc',
        },
        {
            label: 'Mobile Number',
            field: 'mobileNumber',
            sort: 'asc',
        },
        {
            label: 'Working State',
            field: 'workingState',
            sort: 'asc',
        },
    ]
    return (
        <MDBDataTable
            responsive
            striped
            bordered
            hover
            noBottomColumns={true}
            data={{ columns: tableHeaders, rows: tableData }}
            className="custom-table"
        />
    )
}

export default DeliveryBoyZoneList
