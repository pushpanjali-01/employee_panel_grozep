import React, { useEffect, useState } from 'react'
import { MDBDataTable } from 'mdbreact'
import * as XLSX from 'xlsx'
import { LogoWithTitle } from 'app/components'
import { IconButton } from '@mui/material'
import { CloudDownload, InsertDriveFile } from '@mui/icons-material'
import { Box, Button, styled, TextField } from '@mui/material'
import { url } from 'app/constants'
import { useNavigate } from 'react-router-dom'
import useAuth from 'app/hooks/useAuth'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const customStyles = {
    pagination: {
        textAlign: 'right',
    },
}

const Stock = () => {
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1) // Track the current page number
    const navigate = useNavigate()
    const { user } = useAuth()
    const [StoreValue, setStoreValue] = useState({ code: user.storeCode })
    const [searchQuery, setSearchQuery] = useState('') // Track the search query
    const [searchResults, setSearchResults] = useState([])
    const handleStoreChange = (event, newValue) => {
        setStoreValue(newValue)
        setPage(1) // Reset the page number when the store code changes
    }
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value)
    }
    useEffect(() => {
        // Function to fetch data from the API based on the search query
        async function fetchSearchResults() {
            try {
                if (searchQuery.trim() === '') {
                    setSearchResults(null)
                    return
                }

                const response = await url.get(
                    `v1/in/search-listings?storeCode=${StoreValue.code}&q=${searchQuery}&page=${page}`
                )
                if (response.data.status === true) {
                    setSearchResults(response.data.data)
                }
                // Check if the response status is not successful (e.g., 4xx or 5xx status codes)

                // const data = await response.json()

                // / Update the search results state with the fetched data
            } catch (error) {
                console.log(error)
                // setSearchResults(null) // Clear the search results state in case of an error
            }
        }

        // If search query is not empty, fetch the search results
        if (searchQuery.trim() !== '') {
            fetchSearchResults()
        } else {
            // If search query is empty, fetch the default API data
            async function fetchList() {
                try {
                    const response = await url.get(
                        `v1/in/listings/stores?storeCode=${StoreValue.code}&page=${page}`
                    )
                    if (response.data.status === true) {
                        setTableData(response.data.data)
                    }
                } catch (error) {
                    console.log(error)
                }
                setIsLoading(false)
            }
            fetchList()
        }
    }, [searchQuery, StoreValue, page])
    // Trigger the effect when the store code or page number changes

    const handleNextPage = () => {
        setPage((prevPage) => prevPage + 1) // Increment the page number
    }

    const handlePreviousPage = () => {
        setPage((prevPage) => Math.max(prevPage - 1, 1)) // Decrement the page number, but not below 1
    }
    const exportToExcel = () => {
        const exportData = tableRows.map((row) => ({
            'Varient Id': row.id,
            Image: row.image.props.src || '',
            Brand: row.brand,
            Name: row.name,
            Size: row.size,
            Barcode: row.barcode,
            Locations: row.locations,
            MRP: row.mrp,
            Rate: row.rate,
            'Cost Price': row.costPrice,
            Stock: row.stock,
            Category: row.category,
            Subcategory: row.subcategory,
            hsnCode: row.hsnCode,
            'Mfg Date': row.mfgDate,
            'Exp Date': row.expDate,
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Data')

        // Create a blob object from the workbook to create the Excel file
        const excelFile = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })
        const file = new Blob([excelFile], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        // Create a download link and trigger the click event to download the file
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = 'inventory_data.xlsx'
        a.click()
    }
    // Convert tableData to the format expected by MDBDataTable
    const tableRows = (
        searchQuery.trim() !== '' ? searchResults : tableData
    ).map((item) => {
        const totalRemainingStock = item.supplies.reduce(
            (total, supply) => total + (supply.remaining || 0),
            0
        )
        const lastSupplyIndex = item.supplies.length - 1
        const lastSupply =
            lastSupplyIndex >= 0 ? item.supplies[lastSupplyIndex] : null

        return {
            id: item.product_variant?.id || '',
            image: (
                <img
                    src={item.product_variant?.images[0] || ''}
                    alt="Product"
                    height="50"
                />
            ),
            brand: item.product_variant?.product?.brand || '',
            name: item.product_variant?.product?.name || '',
            size: `${item.product_variant?.product_size?.value || ''} ${
                item.product_variant?.product_size?.unit || ''
            }`,
            locations: lastSupply ? lastSupply.sku : '',
            barcode: item.product_variant?.barcode || '',
            mrp: lastSupply
                ? `₹${lastSupply.pricings[0]?.retailPrice || ''}`
                : '',
            rate: lastSupply
                ? `₹${lastSupply.pricings[0]?.sellingPrice || ''}`
                : '',
            costPrice: lastSupply
                ? `₹${lastSupply.pricings[0]?.costPrice || ''}`
                : '',
            category: item.product_variant?.product?.category || '',
            subcategory: item.product_variant?.product?.subcategory || '',
            stock: totalRemainingStock,
            hsnCode: item.product_variant?.product?.hsnCode || '',
            mfgDate: lastSupply ? lastSupply.mfgDate : '',
            expDate: lastSupply ? lastSupply.expDate : '',
        }
    })

    const data = {
        columns: [
            {
                label: 'Varient Id',
                field: 'id',
                sort: 'asc',
            },
            {
                label: 'Image',
                field: 'image',
            },
            {
                label: 'Brand',
                field: 'brand',
            },
            {
                label: 'Name',
                field: 'name',
            },
            {
                label: 'Size',
                field: 'size',
            },

            {
                label: 'Barcode',
                field: 'barcode',
            },
            {
                label: 'Locations',
                field: 'locations',
            },
            {
                label: 'MRP',
                field: 'mrp',
            },
            {
                label: 'Rate',
                field: 'rate',
            },
            {
                label: 'Cost Price',
                field: 'costPrice',
            },
            {
                label: 'Stock',
                field: 'stock',
            },
            {
                label: 'Category',
                field: 'category',
            },
            {
                label: 'Subcategory',
                field: 'subcategory',
            },

            {
                label: 'hsnCode',
                field: 'hsnCode',
            },
            {
                label: 'Mfg Date',
                field: 'mfgDate',
            },
            {
                label: 'Exp Date',
                field: 'expiryDate',
            },
        ],
        rows: tableRows,
    }

    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/task.png"
                title="Stock"
                num={tableData.length}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                    onClick={exportToExcel}
                    color="primary"
                    aria-label="Export Excel"
                >
                    <CloudDownload />
                </IconButton>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
                <TextField
                    label="Search Product"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ width: '100%' }}
                />
            </Box>
            <MDBDataTable
                responsive
                striped
                bordered
                data={data}
                noBottomColumns={true}
                hover
                pagination={false}
                entries={30} // Sho
                sortable={true}
                info={false}
                style={customStyles}
            />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '16px',
                }}
            >
                <Button disabled={page === 1} onClick={handlePreviousPage}>
                    Previous Page
                </Button>
                <Button onClick={handleNextPage}>Next Page</Button>
            </Box>
        </Container>
    )
}

export default Stock
