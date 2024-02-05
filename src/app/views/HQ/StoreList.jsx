import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import Switch from '@mui/material/Switch'
import { Button, styled } from '@mui/material'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
import AddStore from './AddStore'
import { GrozpSnackbar } from 'app/components/'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const StoreList = () => {
    const { user } = useAuth()
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchStoreCodes = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id

                // Fetch the dealers based on the inventoryId
                const storeResponse = await url.get(
                    `v1/in/stores?inventoryId=${inventoryId}`
                )

                // Check the response of the dealers API
                if (storeResponse.data.status === true) {
                    setTableData(storeResponse.data.data)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }
    useEffect(() => {
        fetchStoreCodes()
    }, [updateVarient])

    const handleVariantCreated = useCallback(() => {
        setUpdateVarient((prevState) => !prevState)
    }, [])

    // const handleDeleteRow = useCallback(
    //     (row) => {
    //         console.log(row.getValue('id'))
    //         if (
    //             Swal.fire({
    //                 title: 'Are you sure?',
    //                 text: 'You want to delete this Product?!',
    //                 icon: 'warning',
    //                 showCancelButton: true,
    //                 confirmButtonColor: '#3085d6',
    //                 cancelButtonColor: '#d33',
    //                 confirmButtonText: 'Yes, delete it!',
    //             }).then((result) => {
    //                 if (result.isConfirmed) {
    //                     new Promise((resolve) => {
    //                         url.delete('v1/coupons/' + row.getValue('id'))
    //                             .then((res) => {
    //                                 //send url delete request here, then refetch or update local table data for re-render
    //                                 tableData.splice(row.index, 1)
    //                                 setTableData([...tableData])
    //                                 resolve()
    //                                 if (res.data.status === true) {
    //                                     Swal.fire(
    //                                         'Deleted!',
    //                                         'Your file has been deleted.',
    //                                         'success'
    //                                     )
    //                                 }
    //                             })
    //                             .catch((error) => {
    //                                 // setErrorMessages(['Delete failed! Server error'])
    //                                 // setIserror(true)
    //                                 resolve()
    //                             })
    //                             .finally(() => {})
    //                     })
    //                 }
    //             })
    //         ) {
    //             return
    //         }
    //     },
    //     [tableData]
    // )
    // Start Alert  fun //
    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleClose = (reason) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false)
    }

    const handleStatusChange = async (event, rowData) => {
        const updatedStatus = event.target.checked ? 'active' : 'inactive'

        // Update the switch state immediately
        const updatedTableData = tableData.map((row) => {
            if (row.id === rowData.id) {
                return { ...row, status: updatedStatus }
            }
            return row
        })

        setTableData(updatedTableData)

        try {
            const response = await url.patch(
                `v1/in/stores-status/${rowData.id}`,
                {
                    code: rowData.code,
                    radius: rowData.radius,
                    status: updatedStatus,
                    city: rowData.location.district,
                    locationId: rowData.location.id,
                    location: {
                        locality: rowData.location.locality,
                        pinCode: rowData.location.pinCode,
                        nearby: rowData.location.nearby,
                        district: rowData.location.district,
                        state: rowData.location.state,
                        latitude: rowData.location.latitude,
                        longitude: rowData.location.longitude,
                    },
                }
            )

            if (response.data.status === true) {
                const statusMessage =
                    updatedStatus === 'active' ? 'active' : 'inActive'
                if (updatedStatus === 'active') {
                    handleShowSnackbar(`${statusMessage}`)
                } else {
                    handleShowSnackbar('inActive', 'error')
                }
            } else {
                handleShowSnackbar('Failed to update status', 'error')
            }
        } catch (error) {
            console.error(error)
            handleShowSnackbar(
                'An error occurred while updating status',
                'error'
            )
        }
    }

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
            header: 'Store Id',
            enableColumnOrdering: false,
            enableEditing: false, //disable editing on this column
            enableSorting: false,
            size: 100,
        },

        {
            accessorKey: 'code',
            header: 'Coupon Code',
        },
        {
            accessorKey: 'radius',
            header: 'Cover Area',
        },

        // {
        //     accessorKey: 'status',
        //     header: 'Status',
        // },
        {
            accessorKey: 'location.locality',
            header: 'Location',
        },
        {
            accessorKey: 'location.pinCode',
            header: 'PinCode',
        },
        {
            accessorKey: 'location.district',
            header: 'District',
        },
        // {
        //     accessorKey: 'status',
        //     header: 'Status',
        //     Cell: ({ row }) => {
        //         const { original } = row;
        //         const status = original.status;

        //         return (
        //             <Switch
        //                 checked={status}
        //                 onChange={(event) => handleStatusChange(event, original)}
        //                 color="primary"
        //             />
        //         );
        //     },
        // },
        {
            accessorKey: 'status',
            header: 'Status',
            Cell: ({ row }) => {
                const { original } = row
                const status = original.status

                return (
                    <Switch
                        checked={status === 'active'} // Use local state to control the switch
                        onChange={(event) =>
                            handleStatusChange(event, original)
                        }
                        color="primary"
                    />
                )
            },
        },
    ]

    return (
        <>
            <AddStore
                updateVarient={updateVarient}
                setUpdateVarient={setUpdateVarient}
                onVariantCreated={handleVariantCreated}
            />
            <br />
            <Container>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <MaterialReactTable
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            muiTableHeadCell: {
                                align: 'center',
                            },
                            size: 120,
                        },
                    }}
                    columns={columns}
                    data={tableData}
                    // enableEditing
                    // renderRowActions={({ row, table }) => (
                    //     <Box sx={{ display: 'flex', marginLeft: '4rem' }}>
                    //         <Tooltip arrow placement="right" title="Delete">
                    //             <IconButton
                    //                 color="error"
                    //                 onClick={() => handleDeleteRow(row)}
                    //             >
                    //                 <Delete />
                    //             </IconButton>
                    //         </Tooltip>
                    //     </Box>
                    // )}
                    renderTopToolbarCustomActions={() => (
                        <Button color="success" variant="contained">
                            Store List
                        </Button>
                    )}
                />
            </Container>
        </>
    )
}

export default StoreList
