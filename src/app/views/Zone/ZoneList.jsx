import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { styled } from '@mui/material'
import { url } from 'app/constants'
import AddZone from './AddZone'
import { GrozpSnackbar } from 'app/components/'
import useAuth from 'app/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const ZoneList = () => {
    const navigate = useNavigate()
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)
    const [open, setOpen] = React.useState(false)
    const { user } = useAuth()
    useEffect(() => {
        async function fetchList() {
            url.get(`v1/in/deliveries/zones?storecode=${user.storeCode}`)
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
        navigate(`/Zone/edit-zone/${row.getValue('id')}`)
    }

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
    // close Alert fun //
    const handleStatusChange = (event, rowData) => {
        // setUpdateVarient(false)
        const updatedTableData = tableData.map((row) => {
            if (row.id === rowData.id) {
                return { ...row, status: event.target.checked }
            }
            return row
        })
        handleShowSnackbar('Inactive', 'error')
        setTableData(updatedTableData)
    }

    const columns = [
        {
            accessorKey: 'serialNumber',
            header: 'sno',
            enableColumnOrdering: false,
            enableEditing: false,
            enableSorting: false,
            Cell: ({ row }) => <div>{row.index + 1}</div>,
            size: 80,
        },
        {
            accessorKey: 'id',
            header: 'Id',
            enableColumnOrdering: false,
            enableEditing: false, //disable editing on this column
            enableSorting: false,
            size: 100,
        },

        {
            accessorKey: 'label',
            header: 'Zone Code',
        },
        {
            accessorKey: 'radius',
            header: 'Radius',
        },
        {
            accessorKey: 'latitude',
            header: 'Latitude',
        },
        {
            accessorKey: 'longitude',
            header: 'Longitude',
        },

        // {
        //     accessorKey: 'status',
        //     header: 'Status',
        //     Cell: ({ row }) => {
        //         const { original } = row
        //         const status = original.status

        //         return (
        //             <Switch
        //                 checked={status}
        //                 onChange={(event) =>
        //                     handleStatusChange(event, original)
        //                 }
        //                 color="primary"
        //             />
        //         )
        //     },
        // },
    ]

    return (
        <>
            <AddZone
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
                    muiTableHeadCellProps={{
                        align: 'center',
                    }}
                    muiTableBodyCellProps={{
                        align: 'center',
                    }}
                    columns={columns}
                    data={tableData}
                    enableStickyHeader
                    columns={columns}
                    data={tableData}
                    // enableEditing
                    // renderRowActions={({ row, table }) => (
                    //     <Box>
                    //         <Tooltip arrow placement="right" title="Edit">
                    //             <IconButton
                    //                 color="primary"
                    //                 onClick={() => handleEditRow(row)}
                    //             >
                    //                 <Edit />
                    //             </IconButton>
                    //         </Tooltip>
                    //     </Box>
                    // )}
                />
            </Container>
        </>
    )
}

export default ZoneList
