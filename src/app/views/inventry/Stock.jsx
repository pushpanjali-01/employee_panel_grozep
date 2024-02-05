import React, { useEffect, useState } from 'react'
import { MDBDataTable } from 'mdbreact'
import * as XLSX from 'xlsx'
import { LogoWithTitle } from 'app/components'
import { IconButton } from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { Box, styled, CircularProgress } from '@mui/material'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
import '../dashboard/graph/dashboard.css'
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
    const { user } = useAuth()
    const [StoreValue, setStoreValue] = useState({ code: user.storeCode })
    const [searchQuery, setSearchQuery] = useState('') // Track the search query

    useEffect(() => {
        async function fetchSearchResults() {
            try {
                setIsLoading(true) // Start loading
                const response = await url.get(
                    `v1/in/listingall?storeCode=${StoreValue.code}`
                )
                if (response.data.status === true) {
                    setTableData(response.data.data)
                }

                setIsLoading(false) // Stop loading
            } catch (error) {
                console.log(error)
                setIsLoading(false) // Stop loading in case of error
            }
        }

        fetchSearchResults()
    }, [searchQuery, StoreValue])
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
            Brand: row.brand,
            Name: row.name,
            Size: row.size,
            Barcode: row.barcode,
            Locations: row.locations,
            MRP: row.mrp,
            Rate: row.rate,
            'Cost Price': row.costPrice,
            Capacity: row.capacity,
            Stock: row.stock,
            Requires: row.required,
            Category: row.category,
            Subcategory: row.subcategory,
            hsnCode: row.hsnCode,
            'Mfg Date': row.mfgDate,
            'Exp Date': row.expDate,
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'StoreStock Data')

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
        a.download = `StoreStock(${user.storeCode}).xlsx`
        a.click()
    }
    // Convert tableData to the format expected by MDBDataTable
    const tableRows = tableData.map((item, index) => {
        const totalRemainingStock = item.supplies.reduce(
            (total, supply) => total + (supply.remaining || 0),
            0
        )
        const lastSupplyIndex = item.supplies.length - 1
        const lastSupply =
            lastSupplyIndex >= 0 ? item.supplies[lastSupplyIndex] : null
        return {
            sno: index + 1,
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
                ? `${lastSupply.pricings[0]?.retailPrice || ''}`
                : '',
            rate: lastSupply
                ? `${lastSupply.pricings[0]?.sellingPrice || ''}`
                : '',
            costPrice: lastSupply
                ? `${lastSupply.pricings[0]?.costPrice || ''}`
                : '',
            category: item.product_variant?.product?.category || '',
            subcategory: item.product_variant?.product?.subcategory || '',
            stock: totalRemainingStock,
            hsnCode: item.product_variant?.product?.hsnCode || '',
            mfgDate: lastSupply ? lastSupply.mfgDate : '',
            expDate: lastSupply ? lastSupply.expDate : '',
            capacity: item.maxCapacity,
            required: Math.max(item.maxCapacity - totalRemainingStock, 0),
        }
    })
    const data = {
        columns: [
            {
                label: 'Sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'Vid',
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
                label: 'Capacity',
                field: 'capacity',
            },
            {
                label: 'Stock',
                field: 'stock',
            },
            {
                label: 'Requird',
                field: 'required',
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
                field: 'expDate',
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

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '200px' }}>
                    <CircularProgress /> {/* Show a circular loading spinner */}
                </div>
            ) : (
                <MDBDataTable
                    responsive
                    striped
                    bordered
                    data={data}
                    noBottomColumns={true}
                    hover
                    sortable={true}
                    style={customStyles}
                    className="custom-table"
                />
            )}
        </Container>
    )
}

export default Stock
