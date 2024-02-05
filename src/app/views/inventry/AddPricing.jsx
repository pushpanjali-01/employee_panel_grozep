import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import { Delete } from '@mui/icons-material'
import Swal from 'sweetalert2'
import CreatePrice from './CreatePrice'
import CityAutocomplete from '../HQ/CityList'
import { url } from 'app/constants'
const AddListing = (props) => {
    const [cityvalue, setcityvalue] = useState('Garhwa')
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)

    useEffect(() => {
        async function fetchList() {
            url.get(
                'v1/in/pricing?productId=' +
                    props.productId +
                    '&city=' +
                    cityvalue
            )
                .then((response) => {
                    if (response.data.status === true) {
                        setTableData(response.data.data)
                    }
                })
                .catch((error) => console.log(error))
        }
        fetchList()
    }, [cityvalue])

    const handleVariantCreated = useCallback(() => {
        setUpdateVarient((prevState) => !prevState)
    }, [])
    const handlecityChange = (value) => {
        setcityvalue(value)
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
                            url.delete('v1/in/pricing/' + row.getValue('id'))
                                .then((res) => {
                                    //send api delete request here, then refetch or update local table data for re-render
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
            accessorKey: 'mrp',
            header: 'MRP',
        },
        {
            accessorKey: 'off',
            header: 'Discount',
        },

        {
            accessorKey: 'city',
            header: 'City',
        },
        {
            accessorKey: 'productVariantId',
            header: 'Variant Id',
        },
    ]

    return (
        <>
            <CreatePrice
                productId={props.productId}
                updateVarient={updateVarient}
                setUpdateVarient={setUpdateVarient}
                onVariantCreated={handleVariantCreated}
            />
            <br />
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
                enableEditing
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', marginLeft: '4rem' }}>
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
                renderTopToolbarCustomActions={() => (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '1rem',
                            p: '0.5rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button color="success" variant="contained">
                            Price List
                        </Button>
                        <CityAutocomplete
                            defaultValue="Garhwa"
                            onValueChange={handlecityChange}
                        />
                    </Box>
                )}
            />
        </>
    )
}

export default AddListing
