import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { Edit } from '@mui/icons-material'
import { Delete } from '@mui/icons-material'
import { Box, IconButton, Tooltip, styled } from '@mui/material'
import Swal from 'sweetalert2'
import AddFreeItem from './AddFreeItem'
import { url } from 'app/constants'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const CoupanList = (props) => {
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)

    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/goodies')
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

    const handleEditRow = (row) => {
        // Handle the edit action for the row
    }

    const handleDeleteRow = useCallback(
        (row) => {
            if (
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'You want to delete this Product?!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        new Promise((resolve) => {
                            url.delete('v1/coupons/' + row.getValue('id'))
                                .then((res) => {
                                    //send url delete request here, then refetch or update local table data for re-render
                                    tableData.splice(row.index, 1)
                                    setTableData([...tableData])
                                    resolve()
                                    if (res.data.status === true) {
                                        Swal.fire(
                                            'Deleted!',
                                            'Your file has been deleted.',
                                            'success'
                                        )
                                    }
                                })
                                .catch((error) => {
                                    // setErrorMessages(['Delete failed! Server error'])
                                    // setIserror(true)
                                    resolve()
                                })
                                .finally(() => {})
                        })
                    }
                })
            ) {
                return
            }
        },
        [tableData]
    )

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            enableColumnOrdering: false,
            enableEditing: false, //disable editing on this column
            enableSorting: false,
        },

        {
            accessorKey: 'name',
            header: 'Name',
        },

        {
            accessorKey: 'couponType',
            header: 'Coupon Type',
        },
    ]

    return (
        <>
            <AddFreeItem
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
                    muiTableHeadCellProps={{
                        align: 'center',
                    }}
                    muiTableBodyCellProps={{
                        align: 'center',
                    }}
                    enableStickyHeader
                    columns={columns}
                    data={tableData}
                    enableEditing
                    renderRowActions={({ row, table }) => (
                        <Box>
                            <Tooltip arrow placement="right" title="Edit">
                                <IconButton
                                    color="primary"
                                    onClick={() => handleEditRow(row)}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Delete">
                                <IconButton
                                    color="error"
                                    onClick={() => handleDeleteRow(row)}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                />
            </Container>
        </>
    )
}

export default CoupanList
