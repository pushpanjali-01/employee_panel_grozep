import React, { useCallback, useEffect, useState } from 'react'
import MaterialReactTable from 'material-react-table'
import { Box, Button, IconButton, Tooltip, styled } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { LogoWithTitle } from 'app/components'
import { url } from 'app/constants'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))

const ProductLists = () => {
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()

    async function fetchList(page) {
        try {
            const response = await url.get(`v1/in/products?page=${page}`)
            if (response.data.status === true) {
                setTableData(response.data.data)
            }
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchList(currentPage)
    }, [currentPage])

    const handleEditRow = async (row) => {
        navigate(`/inventry/product-details-update/${row.getValue('id')}`)
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
                            url.delete(`v1/in/products/${row.getValue('id')}`)
                                .then((res) => {
                                    tableData.splice(row.index, 1)
                                    setTableData([...tableData])
                                    localStorage.removeItem('productId')
                                    localStorage.removeItem('stage')
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
                                    resolve()
                                })
                        })
                    }
                })
            ) {
                return
            }
        },
        [tableData]
    )

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1)
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1)
        }
    }
    // Pre-process data to convert boolean values to strings
    const processedRows = tableData.map((row) => ({
        ...row,
        isAdult: row.isAdult.toString(),
    }))

    const columns = [
        {
            header: 'S No',
            enableColumnOrdering: false,
            enableEditing: false,
            enableSorting: false,
            Cell: ({ row }) => <span>{row.index + 1}</span>,
        },
        {
            accessorKey: 'id',
            header: 'ID',
            enableColumnOrdering: false,
            enableEditing: false, //disable editing on this column
            enableSorting: false,
        },
        {
            // accessorKey: 'variant.imageURL[0]',
            header: 'Image',
            enableSorting: true,
            Cell: ({ row }) => {
                const [loading, setLoading] = useState(true)

                const handleImageLoad = () => {
                    setLoading(false)
                }

                const imageUrl =
                    row.original.product_variants[0]?.images[0] || null

                return (
                    <div style={{ overflow: 'auto' }}>
                        <Box
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                {loading && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        Loading...
                                    </div>
                                )}
                                <img
                                    alt="avatar"
                                    height={50}
                                    src={imageUrl}
                                    loading="lazy"
                                    style={{
                                        borderRadius: '10%',
                                        border: '1px solid #d1d1e0',
                                    }}
                                    onLoad={handleImageLoad}
                                />
                            </div>
                        </Box>
                    </div>
                ) // Assuming the image URL is available in the 'variant.imageURL[0]' property
                // return <img src={imageUrl} alt="Product Image" />
            },
        },

        {
            accessorKey: 'brand',
            header: 'Brand',
        },
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'category',
            header: 'Category',
        },
        {
            accessorKey: 'subcategory',
            header: 'Subcategory',
        },

        {
            accessorKey: 'hsnCode',
            header: 'HsnCode',
        },
        {
            accessorKey: 'productsize',
            header: 'Sizes',
            Cell: ({ row }) => {
                const product_sizes = row.original.product_sizes // Assuming the supplies data is available in the 'supplies' property
                return (
                    <ul>
                        {product_sizes.map((size) => (
                            <li
                                key={size.id}
                            >{`${size.value}  ${size.unit}`}</li>
                        ))}
                    </ul>
                )
            },
        },
        {
            accessorKey: 'prodctcolour',
            header: 'Colours',
            Cell: ({ row }) => {
                const Colours = row.original.product_colors // Assuming the supplies data is available in the 'supplies' property
                return (
                    <ul>
                        {Colours.map((Colour) => (
                            <li key={Colour.id}>{`${Colour.name}`}</li>
                        ))}
                    </ul>
                )
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
        {
            accessorKey: 'isAdult',
            header: 'isAdult',
        },
    ]

    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/task.png"
                title="Product List"
                num={tableData.length}
            />
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
                data={processedRows}
                enableEditing
                renderRowActions={({ row }) => (
                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton onClick={() => handleEditRow(row)}>
                                <Edit style={{ color: 'orange' }} />
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
                muiTableHeadCellProps={{
                    align: 'center',
                }}
                muiTableBodyCellProps={{
                    align: 'center',
                }}
                renderTopToolbarCustomActions={() => (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Button
                            color="success"
                            onClick={() => navigate('/inventry/new-product')}
                            variant="contained"
                        >
                            + Add New Product
                        </Button>
                        <Box sx={{ display: 'flex' }}>
                            <Button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                variant="outlined"
                            >
                                Previous
                            </Button>
                            <Button onClick={handleNextPage} variant="outlined">
                                Next
                            </Button>
                        </Box>
                    </Box>
                )}
            />
        </Container>
    )
}

export default ProductLists
