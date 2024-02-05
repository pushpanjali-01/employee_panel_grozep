import React, { useEffect, useState } from 'react'
import { MDBDataTable } from 'mdbreact'
import * as XLSX from 'xlsx'
import { LogoWithTitle } from 'app/components'
import { IconButton } from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { Box, styled, CircularProgress } from '@mui/material'
import { url } from 'app/constants'
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

const InventryStock = () => {
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [options, setOptions] = useState([])
    const [page, setPage] = useState(1) // Track the current page number
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('') // Track the search query
    const [searchResults, setSearchResults] = useState([])

    const getdata = async () => {
        // url.get('v1/in/dealers')
        //     .then((response) => {
        //         if (response.data.status === true) {
        //             setOptions(response.data.data)
        //         }
        //     })
        //     .catch((error) => console.log(error))
        // Fetch the inventory data to get the correct inventoryId
        const inventoryResponse = await url.get(
            `v1/in/inventory?inventoryCode=${user.storeCode}`
        )
        // Check the response of the inventory API
        if (inventoryResponse.data.status === true) {
            const inventoryId = inventoryResponse.data.data[0].id
            // Fetch the dealers based on the inventoryId
            const dealersResponse = await url.get(
                `v1/in/dealers?inventoryId=${inventoryId}`
            )

            // Check the response of the dealers API
            if (dealersResponse.data.status === true) {
                setOptions(dealersResponse.data.data)
            } else {
                // Handle the case where dealers response status is not true
            }
        } else {
            // Handle the case where inventory response status is not true
        }
    }
    useEffect(() => {
        getdata()
        // url.get('v1/in/dealers')
        //     .then((response) => {
        //         if (response.data.status === true) {
        //             setOptions(response.data.data)
        //         }
        //     })
        //     .catch((error) => console.log(error))
        // Function to fetch data from the API based on the search query
        async function fetchSearchResults() {
            try {
                const response = await url.get(
                    `v1/in/inventory-internal?inventoryCode=${user.storeCode}`
                )

                if (response.data.status === true) {
                    // setSearchResults(response.data.data)
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

            fetchList()
        }
    }, [searchQuery, page])
    async function fetchList() {
        try {
            const response = await url.get(
                `v1/in/inventory-internal?inventoryCode=${user.storeCode}`
            )
            if (response.data.status === true) {
                setTableData(response.data.data)
            }
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }
    // Trigger the effect when the store code or page number changes
    const getEmployeeEmailById = (did) => {
        const employee = options.find((employee) => employee.id === did)
        return employee ? employee.name : ''
    }

    const exportToExcel = () => {
        const combinedData = []
        tableData.forEach((item) => {
            let zeroAdded = false
            item.inventory_stocks.forEach((stock) => {
                const stockInfo = {
                    inventoryCode: item.inventoryCode,
                    id: item.product_variant.product.id,
                    productVariantId: item.productVariantId,
                    maxCapacity: item.maxCapacity,
                    dealerId: getEmployeeEmailById(item.dealerId),
                    isActive: item.isActive,
                    brand: item.product_variant.product.brand,
                    name: item.product_variant.product.name,
                    size: `${item.product_variant.product_size.value}${item.product_variant.product_size.unit}`,
                    barcode: item.product_variant.barcode,
                    category: item.product_variant.product.category,
                    subcategory: item.product_variant.product.subcategory,
                    hsnCode: item.product_variant.product.hsnCode,
                    status: item.isActive,
                    batchNo: stock.batchNo,
                    sku: stock.sku,
                    quantity: stock.remaining,
                    costPrice: stock.costPrice,
                    sellingPrice: stock.sellingPrice,
                    retailPrice: stock.retailPrice,
                    storePrice: stock.tradePrice,
                    mfgDate: stock.mfgDate,
                    expDate: stock.expDate,
                }
                if (stock.remaining === 0 && !zeroAdded) {
                    combinedData.push(stockInfo)
                    zeroAdded = true // Set the flag to true after adding a zero-remaining stock
                } else if (stock.remaining > 0) {
                    combinedData.push(stockInfo)
                }
            })
        })

        const exportData = combinedData.map((row) => ({
            'Product Id': row.id,
            'Varient Id': row.productVariantId,
            Brand: row.brand,
            Name: row.name,
            Size: row.size,
            Barcode: row.barcode,
            Locations: row.sku,
            MRP: row.retailPrice,
            Rate: row.sellingPrice,
            StorePrice: row.storePrice,
            'Cost Price': row.costPrice,
            Stock: row.quantity,
            Category: row.category,
            Subcategory: row.subcategory,
            hsnCode: row.hsnCode,
            'Mfg Date': row.mfgDate,
            'Exp Date': row.expDate,
            dealerId: row.dealerId,
            inventoryCode: row.inventoryCode,
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
    ).map((item, index) => {
        const totalRemainingStock = item.inventory_stocks.reduce(
            (total, supply) => total + (supply.remaining || 0),
            0
        )
        const lastSupplyIndex = item.inventory_stocks.length - 1
        const lastSupply =
            lastSupplyIndex >= 0 ? item.inventory_stocks[lastSupplyIndex] : null
        const required = Math.max(item.maxCapacity - totalRemainingStock, 0)
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
            mrp: lastSupply ? lastSupply.retailPrice : '',
            rate: lastSupply ? lastSupply.sellingPrice : '',
            costPrice: lastSupply ? lastSupply.costPrice : '',
            storePrice: lastSupply ? lastSupply.tradePrice : '',
            category: item.product_variant?.product?.category || '',
            subcategory: item.product_variant?.product?.subcategory || '',
            stock: totalRemainingStock,
            capacity: item.maxCapacity,
            required: required,
            hsnCode: item.product_variant?.product?.hsnCode || '',
            mfgDate: lastSupply ? lastSupply.mfgDate : '',
            expDate: lastSupply ? lastSupply.expDate : '',
            dealerId: getEmployeeEmailById(item.dealerId),
        }
    })

    const data = {
        columns: [
            {
                label: 'sno',
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
                label: 'Store Price',
                field: 'storePrice',
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
                label: 'Required',
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
            {
                label: 'Dealer ',
                field: 'dealerId',
            },
        ],
        rows: tableRows,
    }

    return (
        <Container>
            <LogoWithTitle
                src="/assets/Orders/task.png"
                title="Inventry Stock"
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
                <div style={{ textAlign: 'center', padding: '250px' }}>
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
                    pagination={false}
                    entries={30} // Show
                    sortable={true}
                    info={false}
                    style={customStyles}
                />
            )}
        </Container>
    )
}

export default InventryStock
