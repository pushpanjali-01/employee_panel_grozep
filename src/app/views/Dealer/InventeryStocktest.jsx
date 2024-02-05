import React, { useEffect, useState } from 'react'
import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Pagination from './pagination'
import './style.css'
import { url } from 'app/constants'
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
}))
const InventryStock = () => {
    const [stocks, setStocks] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [stocksPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState(stocks)
    const [sortOrder, setSortOrder] = useState('asc')
    const [sortColumn, setSortColumn] = useState('')
    const [loading, setLoading] = useState(true)
    const fetchStocks = async () => {
        try {
            const response = await url.get('v1/in/inventory-internal')
            const data = response.data

            if (data.status === true) {
                setStocks(data.data)
                setLoading(false)
            } else {
                setStocks([])
            }
        } catch (error) {
            console.error('Error fetching stocks:', error)
        }
    }

    // Use useEffect to fetch the stocks data when the component mounts (empty dependency array)
    useEffect(() => {
        fetchStocks()
    }, [])

    const indexOfLastStock = currentPage * stocksPerPage
    const indexOfFirstStock = indexOfLastStock - stocksPerPage
    const handleSearchChange = (event) => {
        const query = event.target.value
        setSearchQuery(query)

        const filteredResults = stocks.filter((stock) => {
            const { id, product_variant } = stock
            const { product } = product_variant

            const searchValue = query.toLowerCase()
            const barcodeValue = product_variant.barcode
                ? product_variant.barcode.toLowerCase()
                : ''
            const nameValue = product.name ? product.name.toLowerCase() : ''
            const brandValue = product.brand ? product.brand.toLowerCase() : ''
            const idValue = String(id).toLowerCase()

            return (
                barcodeValue.includes(searchValue) ||
                nameValue.includes(searchValue) ||
                brandValue.includes(searchValue) ||
                idValue.includes(searchValue)
            )
        })

        setSearchResults(filteredResults)
        setCurrentPage(1)
    }

    const handleSortClick = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortOrder('asc')
        }

        let sortedData
        if (searchQuery) {
            sortedData = [...searchResults].sort((a, b) => {
                const aValue = getFieldByPath(a, column)
                const bValue = getFieldByPath(b, column)

                if (aValue !== undefined && bValue !== undefined) {
                    if (sortOrder === 'asc') {
                        return aValue
                            .toString()
                            .localeCompare(bValue.toString())
                    } else {
                        return bValue
                            .toString()
                            .localeCompare(aValue.toString())
                    }
                }

                return 0
            })
            setSearchResults(sortedData)
        } else {
            sortedData = [...stocks].sort((a, b) => {
                const aValue = getFieldByPath(a, column)
                const bValue = getFieldByPath(b, column)

                if (aValue !== undefined && bValue !== undefined) {
                    if (sortOrder === 'asc') {
                        return aValue
                            .toString()
                            .localeCompare(bValue.toString())
                    } else {
                        return bValue
                            .toString()
                            .localeCompare(aValue.toString())
                    }
                }

                return 0
            })
            setStocks(sortedData)
        }
    }

    const getFieldByPath = (obj, path) => {
        const keys = path.split('.')
        let value = obj
        for (const key of keys) {
            if (value && key in value) {
                value = value[key]
            } else {
                return undefined
            }
        }
        return value
    }

    const currentStocks = searchQuery
        ? searchResults.slice(indexOfFirstStock, indexOfLastStock)
        : stocks.slice(indexOfFirstStock, indexOfLastStock)
    const handleFirstClick = () => {
        setCurrentPage(1)
    }

    const handlePreviousClick = () => {
        setCurrentPage((prevPage) => prevPage - 1)
    }

    const handleNextClick = () => {
        setCurrentPage((prevPage) => prevPage + 1)
    }

    const handleLastClick = () => {
        const totalPages = Math.ceil(
            (searchQuery ? searchResults.length : stocks.length) / stocksPerPage
        )
        setCurrentPage(totalPages)
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const exportAsPDF = () => {
        const doc = new jsPDF()
        const tableData = currentStocks.map((stock) => [
            stock.id,
            stock.productVariantId,
            stock.product_variant.product.brand,
            stock.product_variant.product.name,
            stock.inventory_stocks[0].quantity,
            stock.product_variant.barcode,
            stock.product_variant.product.category,
            stock.product_variant.product.subcategory,
            stock.product_variant.product.hsnCode,
            stock.inventory_stocks[0].mfgDate,
            stock.inventory_stocks[0].expDate,
        ])

        doc.autoTable({
            head: [
                [
                    'ID',
                    'Variant ID',
                    'Brand',
                    'Name',
                    'Quantity',
                    'Barcode',
                    'Category',
                    'Subcategory',
                    'HSN Code',
                    'Mfg Date',
                    'Exp Date',
                ],
            ],
            body: tableData,
            styles: {
                cellPadding: 0.5,
                fontSize: 8,
                valign: 'middle',
                halign: 'center',
                lineColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: '#f5f5f5',
                textColor: '#000',
                fontSize: 9,
                fontStyle: 'bold',
                lineColor: [0, 0, 0],
            },
            alternateRowStyles: {
                fillColor: '#f9f9f9',
            },
        })

        doc.save('dealer_allotment_stock.pdf')
    }

    const exportAsExcel = () => {
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(
            currentStocks.map((stock) => ({
                ID: stock.id,
                'Variant ID': stock.productVariantId,
                Brand: stock.product_variant.product.brand,
                Name: stock.product_variant.product.name,
                Quantity: stock.inventory_stocks[0].quantity,
                Barcode: stock.product_variant.barcode,
                Category: stock.product_variant.product.category,
                Subcategory: stock.product_variant.product.subcategory,
                'HSN Code': stock.product_variant.product.hsnCode,
                'Mfg Date': stock.inventory_stocks[0].mfgDate,
                'Exp Date': stock.inventory_stocks[0].expDate,
            }))
        )

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Dealer Allotment Stock'
        )
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })
        const excelData = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        saveAs(excelData, 'dealer_allotment_stock.xlsx')
    }

    return (
        <main>
            {loading ? (
                <StyledProgress /> // Show loading indicator if data is being fetched
            ) : (
                <section className="dealer-stock-section">
                    <div>
                        <h5>Inventory Stocks</h5>
                        <div className="header">
                            <div className="search-input-container">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    // onKeyDown={handleSearchKeyPress}
                                    // onKeyUp={handleSearchKeyUp}
                                />
                                {/* <button
                                    onClick={handleSearchClick}
                                    className="search-btn"
                                >
                                    Search
                                </button> */}
                            </div>
                            <div className="export-buttons">
                                <button
                                    onClick={exportAsPDF}
                                    className="export-btn"
                                >
                                    Export as PDF
                                </button>
                                <button
                                    onClick={exportAsExcel}
                                    className="export-btn"
                                >
                                    Export as Excel
                                </button>
                            </div>
                        </div>
                        <div className="table-container">
                            {searchQuery && searchResults.length > 0 ? (
                                <table className="product-table">
                                    <thead className="table-header">
                                        <tr>
                                            <th
                                                onClick={() =>
                                                    handleSortClick('id')
                                                }
                                            >
                                                Sno
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'productVariantId'
                                                    )
                                                }
                                            >
                                                Vrid
                                            </th>
                                            <th>Image</th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.name'
                                                    )
                                                }
                                            >
                                                Brand & Name
                                            </th>
                                            <th>Size</th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].retailPrice'
                                                    )
                                                }
                                            >
                                                MRP
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].sellingPrice'
                                                    )
                                                }
                                            >
                                                Rate
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].tradePrice'
                                                    )
                                                }
                                            >
                                                Store Price
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].costPrice'
                                                    )
                                                }
                                            >
                                                CP
                                            </th>
                                            <th>Capacity</th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].quantity'
                                                    )
                                                }
                                            >
                                                Stock
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].quantity'
                                                    )
                                                }
                                            >
                                                Requird
                                            </th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.category'
                                                    )
                                                }
                                            >
                                                Category
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.subcategory'
                                                    )
                                                }
                                            >
                                                Subcategory
                                            </th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].mfgDate'
                                                    )
                                                }
                                            >
                                                Mfg Date
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].expDate'
                                                    )
                                                }
                                            >
                                                Exp Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((stock, index) => (
                                            <tr key={stock.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {stock.productVariantId}
                                                </td>
                                                <td>
                                                    <img
                                                        src={
                                                            stock
                                                                .product_variant
                                                                .images[0]
                                                        }
                                                        alt="product-image"
                                                        className="image-item"
                                                    />
                                                </td>
                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.brand
                                                    }{' '}
                                                    {
                                                        stock.product_variant
                                                            .product.name
                                                    }
                                                </td>
                                                <td>
                                                    {stock.product_variant
                                                        .product_size.value +
                                                        stock.product_variant
                                                            .product_size.unit}
                                                </td>

                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .retailPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .sellingPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .tradePrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .costPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>{stock.maxCapacity}</td>
                                                <td>
                                                    {/* {
                                                   stock.inventory_stocks[0]
                                                       .remaining
                                               } */}
                                                    {stock.inventory_stocks.reduce(
                                                        (acc, supply) =>
                                                            acc +
                                                            supply.remaining,
                                                        0
                                                    )}
                                                </td>
                                                <td>
                                                    {stock.maxCapacity -
                                                        stock.inventory_stocks.reduce(
                                                            (acc, supply) =>
                                                                acc +
                                                                supply.remaining,
                                                            0
                                                        )}
                                                </td>

                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.category
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.subcategory
                                                    }
                                                </td>
                                                <td>
                                                    {stock
                                                        .inventory_stocks[0] &&
                                                    stock.inventory_stocks[0]
                                                        .mfgDate
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .mfgDate
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock
                                                        .inventory_stocks[0] &&
                                                    stock.inventory_stocks[0]
                                                        .expDate
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .expDate
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : stocks ? (
                                <table className="product-table">
                                    <thead className="table-header">
                                        <tr>
                                            <th
                                                onClick={() =>
                                                    handleSortClick('id')
                                                }
                                            >
                                                Sno
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'productVariantId'
                                                    )
                                                }
                                            >
                                                Vrid
                                            </th>
                                            <th>Image</th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.name'
                                                    )
                                                }
                                            >
                                                Brand & Name
                                            </th>
                                            <th>Size</th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].retailPrice'
                                                    )
                                                }
                                            >
                                                MRP
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].sellingPrice'
                                                    )
                                                }
                                            >
                                                Rate
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].tradePrice'
                                                    )
                                                }
                                            >
                                                Store Price
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].costPrice'
                                                    )
                                                }
                                            >
                                                CP
                                            </th>
                                            <th>Capacity</th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].quantity'
                                                    )
                                                }
                                            >
                                                Stock
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].quantity'
                                                    )
                                                }
                                            >
                                                Requird
                                            </th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.category'
                                                    )
                                                }
                                            >
                                                Category
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'product_variant.product.subcategory'
                                                    )
                                                }
                                            >
                                                Subcategory
                                            </th>

                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].mfgDate'
                                                    )
                                                }
                                            >
                                                Mfg Date
                                            </th>
                                            <th
                                                onClick={() =>
                                                    handleSortClick(
                                                        'inventory_stocks[0].expDate'
                                                    )
                                                }
                                            >
                                                Exp Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentStocks.map((stock, index) => (
                                            <tr key={stock.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {stock.productVariantId}
                                                </td>
                                                <td>
                                                    <img
                                                        src={
                                                            stock
                                                                .product_variant
                                                                .images[0]
                                                        }
                                                        alt="product-image"
                                                        className="image-item"
                                                    />
                                                </td>
                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.brand
                                                    }{' '}
                                                    {
                                                        stock.product_variant
                                                            .product.name
                                                    }
                                                </td>
                                                <td>
                                                    {stock.product_variant
                                                        .product_size.value +
                                                        stock.product_variant
                                                            .product_size.unit}
                                                </td>

                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .retailPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .sellingPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .tradePrice
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock.inventory_stocks[0]
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .costPrice
                                                        : 'N/A'}
                                                </td>
                                                <td>{stock.maxCapacity}</td>
                                                <td>
                                                    {/* {
                                                        stock.inventory_stocks[0]
                                                            .remaining
                                                    } */}
                                                    {stock.inventory_stocks.reduce(
                                                        (acc, supply) =>
                                                            acc +
                                                            supply.remaining,
                                                        0
                                                    )}
                                                </td>
                                                <td>
                                                    {stock.maxCapacity -
                                                        stock.inventory_stocks.reduce(
                                                            (acc, supply) =>
                                                                acc +
                                                                supply.remaining,
                                                            0
                                                        )}
                                                </td>

                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.category
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        stock.product_variant
                                                            .product.subcategory
                                                    }
                                                </td>
                                                <td>
                                                    {stock
                                                        .inventory_stocks[0] &&
                                                    stock.inventory_stocks[0]
                                                        .mfgDate
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .mfgDate
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {stock
                                                        .inventory_stocks[0] &&
                                                    stock.inventory_stocks[0]
                                                        .expDate
                                                        ? stock
                                                              .inventory_stocks[0]
                                                              .expDate
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                // If 'stocks' is false or undefined, display a message or handle it as needed
                                <div>No stock data available.</div>
                            )}
                        </div>
                        <div className="pagination-container">
                            <Pagination
                                currentPage={currentPage}
                                productsPerPage={stocksPerPage}
                                totalProducts={
                                    searchQuery
                                        ? searchResults.length
                                        : stocks.length
                                }
                                paginate={paginate}
                                handleFirstClick={handleFirstClick}
                                handlePreviousClick={handlePreviousClick}
                                handleNextClick={handleNextClick}
                                handleLastClick={handleLastClick}
                            />
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}

export default InventryStock
