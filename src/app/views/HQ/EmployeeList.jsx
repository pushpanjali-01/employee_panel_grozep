import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { Button, styled } from '@mui/material'
import { url } from 'app/constants'
import AddEmployee from './AddEmployee'
import useAuth from 'app/hooks/useAuth'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const EmployeeList = (props) => {
    const { user } = useAuth()
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)

    useEffect(() => {
        async function fetchList() {
            url.get(`v1/in/${user.storeCode}/employees`)
                .then((response) => {
                    if (response.data.status === true) {
                        setTableData(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
        }
        fetchList()
    }, [updateVarient])

    const handleVariantCreated = useCallback(() => {
        setUpdateVarient((prevState) => !prevState)
    }, [])

    const columns = [
        {
            accessorKey: 'serialNumber',
            header: '#',
            enableColumnOrdering: false,
            enableEditing: false,
            enableSorting: false,
            Cell: ({ row }) => <div>{row.index + 1}</div>,
            size: 80,
        },
        {
            accessorKey: 'id',
            header: 'Employee Id',
            enableColumnOrdering: false,
            enableEditing: false, //disable editing on this column
            enableSorting: false,
            size: 200,
        },

        {
            accessorKey: 'name',
            header: 'Employee Name',
        },
        {
            accessorKey: 'dob',
            header: 'Date of birth',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'domainMail',
            header: 'Domain Mail',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'aadhaar',
            header: 'Aadhaar',
        },
        {
            accessorKey: 'gender',
            header: 'Gender',
        },
        {
            accessorKey: 'role',
            header: 'Role',
        },

        {
            accessorKey: 'address',
            header: 'Address',
        },
    ]

    return (
        <>
            <AddEmployee
                updateVarient={updateVarient}
                setUpdateVarient={setUpdateVarient}
                onVariantCreated={handleVariantCreated}
            />
            <br />
            <Container>
                <MaterialReactTable
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            muiTableHeadCellProps: {
                                align: 'center',
                            },
                            size: 120,
                        },
                    }}
                    columns={columns}
                    data={tableData}
                    renderTopToolbarCustomActions={() => (
                        <Button color="success" variant="contained">
                            Employee List
                        </Button>
                    )}
                />
            </Container>
        </>
    )
}

export default EmployeeList
