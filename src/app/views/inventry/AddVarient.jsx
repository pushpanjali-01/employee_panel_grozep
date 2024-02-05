import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import Swal from 'sweetalert2'
import CreateVarient from './CreateVarient'
import { url } from 'app/constants'
const AddVarient = (props) => {
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/products/' + props.productId)
                .then(async (response) => {
                    if (response.data.status === true) {
                        const variants = response.data.data.product_variants
                        const sizeIds = new Set(
                            variants.map((variant) => variant.productSizeId)
                        )
                        const colorIds = new Set(
                            variants.map((variant) => variant.productColorId)
                        )
                        // Fetch size details for each unique sizeId
                        const sizeDetailsMap = {}
                        await Promise.all(
                            Array.from(sizeIds).map(async (sizeId) => {
                                const sizeResponse = await url.get(
                                    'v1/in/products-sizes/' + sizeId
                                )
                                if (sizeResponse.data.status === true) {
                                    const sizeDetails = sizeResponse.data.data
                                    sizeDetailsMap[sizeId] = {
                                        unit:
                                            sizeDetails.value +
                                            sizeDetails.unit,
                                    }
                                }
                            })
                        )
                        // Fetch color details for each unique colorId
                        const colorDetailsMap = {}
                        await Promise.all(
                            Array.from(colorIds).map(async (colorId) => {
                                const response = await url.get(
                                    'v1/in/products-colors/' + colorId
                                )
                                if (response.data.status === true) {
                                    const colorDetails = response.data.data
                                    colorDetailsMap[colorId] = {
                                        name: colorDetails.name,
                                    }
                                }
                            })
                        )

                        const variantsWithSizeDetails = variants.map(
                            (variant) => ({
                                ...variant,
                                size:
                                    sizeDetailsMap[variant.productSizeId] ||
                                    null,
                                color:
                                    colorDetailsMap[variant.productColorId] ||
                                    null,
                            })
                        )

                        setTableData(variantsWithSizeDetails)
                    }
                    setIsLoading(false)
                })

                .catch((error) => console.log(error))
        }
        fetchList()
    }, [updateVarient])

    const handleVariantCreated = useCallback(() => {
        setUpdateVarient((prevState) => !prevState)
    }, [])

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
                            url.delete(
                                'v1/in/products-variants/' + row.getValue('id')
                            )
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
            size: 70,
        },

        {
            accessorKey: 'barcode',
            header: 'Barcode ',
            size: 100,
        },
        {
            accessorKey: 'packaging',
            header: 'Packaging ',
            size: 100,
        },
        {
            accessorKey: 'size.unit',
            header: 'Size',
            size: 80,
        },

        {
            accessorKey: 'color.name',
            header: 'Color Name',
            size: 100,
        },
        {
            accessorKey: 'images',
            header: 'Images',
            size: 130,
            Cell: ({ row }) => {
                const [loading, setLoading] = useState(true)

                const handleImageLoad = () => {
                    setLoading(false)
                }

                return (
                    <div style={{ overflow: 'auto' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {row.original.images.map((url) => (
                                <div style={{ position: 'relative' }}>
                                    {loading && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform:
                                                    'translate(-50%, -50%)',
                                            }}
                                        >
                                            Loading...
                                        </div>
                                    )}
                                    <img
                                        alt="avatar"
                                        height={50}
                                        src={url}
                                        loading="lazy"
                                        style={{
                                            borderRadius: '10%',
                                            border: '1px solid #d1d1e0',
                                            marginLeft: '0.5rem',
                                        }}
                                        onLoad={handleImageLoad}
                                    />
                                </div>
                            ))}
                        </Box>
                    </div>
                )
            },
        },
    ]

    return (
        <>
            <CreateVarient
                productId={props.productId}
                updateVarient={updateVarient}
                setUpdateVarient={setUpdateVarient}
                onVariantCreated={handleVariantCreated}
            />
            <br />
            <MaterialReactTable
                state={{ isLoading }}
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
                    <Box sx={{ display: 'flex', gap: '5rem' }}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton>{/* <Edit /> */}</IconButton>
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
                renderTopToolbarCustomActions={() => (
                    <Button color="success" variant="contained">
                        Variant List
                    </Button>
                )}
            />
        </>
    )
}

export default AddVarient
