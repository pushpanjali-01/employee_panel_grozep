import React, { useEffect, useState } from 'react'
import { url } from 'app/constants'
import { styled } from '@mui/system'
import { Button } from '@mui/material'
import { Card } from 'react-bootstrap'
import './Storestyle.css'
import { GrozpSnackbar } from 'app/components/'
import { CircularProgress } from '@mui/material'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import useAuth from 'app/hooks/useAuth'
import 'jspdf-autotable'
import TextField from '@mui/material/TextField'
const IMG = styled('img')(() => ({
    width: '50%',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const SELECTED_STORE_KEY = 'selectedStoreCode'
const CART_ITEMS_KEY = 'cartItems'
// import del from '../../asserts/images/delete-icon.png'
function StoreAllotment() {
    const { user } = useAuth()
    const [storeCodes, setStoreCodes] = useState([])
    const [selectedStoreCode, setSelectedStoreCode] = useState('')
    const [cartItems, setCartItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchCartItems, setSearchCartItems] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [storeAllotmentResponse, setStoreAllotmentResponse] = useState([])
    const [isStoreAlloted, setIsStoreAlloted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingplace, setIsLoadingplace] = useState(false)
    const [ISLoading, setISLoading] = useState(false)
    const [inputValueSearch, setInputValueSearch] = useState([])
    const [filterQuery, setFilterQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const resultsPerPage = 10 // Number of results per page
    useEffect(() => {
        // Load cart items from local storage
        const storedCartItems = localStorage.getItem(CART_ITEMS_KEY)
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems))
        }
    }, [])
    useEffect(() => {
        const storedCartItems = localStorage.getItem(CART_ITEMS_KEY)
        if (storedCartItems) {
            setSearchCartItems(JSON.parse(storedCartItems))
        }
    }, [])
    useEffect(() => {
        const storedSelectedStoreCode = localStorage.getItem(SELECTED_STORE_KEY)
        if (storedSelectedStoreCode) {
            setSelectedStoreCode(storedSelectedStoreCode)
        }
    }, [])
    useEffect(() => {
        fetchStoreCodes()
    }, [])

    useEffect(() => {
        if (selectedStoreCode) {
            fetchProductData()
            setCartItems([])
        }
    }, [selectedStoreCode])

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
                    setStoreCodes(storeResponse.data.data)
                    setIsLoading(false)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
            setIsLoading(false)
        }
        // try {
        //     setIsLoading(true)

        //     const response = await url.get('v1/in/stores')
        //     setStoreCodes(response.data.data)
        //     setIsLoading(false)
        // } catch (error) {
        //     console.log('Error fetching store codes:', error)
        //     setIsLoading(false)
        // }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }
    const fetchProductData = async () => {
        try {
            setIsLoading(true)
            const response = await url.get(
                `v1/stores/allotments/generate?storecode=${selectedStoreCode}`
            )
            const dataWithOrderQuantity = response.data.data.map((product) => {
                const desiredCapacity =
                    product.maxCapacity - product.minCapacity
                const availableCapacity =
                    product.product_variant.inventory_listings.reduce(
                        (sum, listing) => {
                            const inventoryStocksRemaining =
                                listing.inventory_stocks.reduce(
                                    (stockSum, stock) =>
                                        stockSum + stock.remaining,
                                    0
                                )
                            return sum + inventoryStocksRemaining
                        },
                        0
                    )
                let orderQuantity

                if (desiredCapacity > availableCapacity) {
                    orderQuantity = availableCapacity
                } else if (desiredCapacity < availableCapacity) {
                    orderQuantity = desiredCapacity
                }
                const amount =
                    product.product_variant.inventory_listings.reduce(
                        (acc, listing) => {
                            const remainingQuantity =
                                listing.inventory_stocks.reduce(
                                    (stockSum, stock) =>
                                        stockSum + stock.remaining,
                                    0
                                )
                            const tradePrice =
                                listing.inventory_stocks[0].trade_price // Assuming trade_price is the same for all stocks
                            if (orderQuantity <= remainingQuantity) {
                                return acc + orderQuantity * tradePrice
                            } else {
                                orderQuantity -= remainingQuantity
                                return acc + remainingQuantity * tradePrice
                            }
                        },
                        0
                    )

                return {
                    ...product,
                    orderQuantity: orderQuantity,
                    cartQuantity: 0,
                    selected: false,
                    remainingQuantity: availableCapacity,
                    amount: amount,
                }
            })

            setIsLoading(false)
        } catch (error) {
            console.log('Error fetching product data:', error)
            setIsLoading(false)
        }
    }

    const handleStoreCodeChange = (event) => {
        setSelectedStoreCode(event.target.value)
        localStorage.setItem(SELECTED_STORE_KEY, event.target.value)
        setIsStoreAlloted(false)
        setCartItems([])
        setSearchCartItems([])
        setInputValueSearch([])
        localStorage.removeItem(CART_ITEMS_KEY)
    }
    const searchProducts = async (query) => {
        try {
            setISLoading(true)
            setIsSearching(true)
            setCurrentPage(0)
            const headers = {
                inventorycode: user.storeCode, // Replace with your actual inventory code
            }
            const response = await url.get(`v1/in/inventorysearch?q=${query}`, {
                headers: headers,
            })
            const searchResults = response.data.data
            const searchResultsWithOrderQuantity = searchResults.map(
                (result) => {
                    const inventoryListings = result.inventory_listings
                    const desiredCapacity =
                        inventoryListings[0].maxCapacity -
                        inventoryListings[0].minCapacity
                    const availableCapacity = inventoryListings.reduce(
                        (sum, listing) => {
                            const remaining = listing.inventory_stocks.reduce(
                                (stockSum, stock) => stockSum + stock.remaining,
                                0
                            )
                            return sum + remaining
                        },
                        0
                    )

                    let orderQuantity
                    if (desiredCapacity > availableCapacity) {
                        orderQuantity = availableCapacity
                    } else {
                        orderQuantity = desiredCapacity
                    }

                    // Check if there are inventory stocks and get the retailPrice
                    const hasInventoryStocks = inventoryListings.some(
                        (listing) => listing.inventory_stocks.length > 0
                    )
                    const retailPrice = hasInventoryStocks
                        ? inventoryListings[inventoryListings.length - 1]
                              .inventory_stocks[
                              inventoryListings[inventoryListings.length - 1]
                                  .inventory_stocks.length - 1
                          ].retailPrice
                        : ''
                    const tradePrice = hasInventoryStocks
                        ? inventoryListings[inventoryListings.length - 1]
                              .inventory_stocks[
                              inventoryListings[inventoryListings.length - 1]
                                  .inventory_stocks.length - 1
                          ].tradePrice
                        : ''
                    return {
                        ...result,
                        orderQuantity: orderQuantity,
                        cartQuantity: 0,
                        selected: false,
                        remainingQuantity: availableCapacity,
                        retailPrice: retailPrice,
                        tradePrice: tradePrice, // Add the retailPrice to the result
                    }
                }
            )

            setSearchResults(searchResultsWithOrderQuantity)
            setISLoading(false)
            setSearchQuery('')
        } catch (error) {
            console.log('Error fetching search results:', error)
        } finally {
            // setIsSearching(false);
        }
    }

    const handleSearchInputChange = (result, event) => {
        const enteredQuantity = parseInt(event.target.value, 10)
        const remainingQuantity = result.remainingQuantity

        // If entered quantity is greater than remaining quantity, set it to the remaining quantity
        const updatedQuantity = Math.max(
            0,
            Math.min(enteredQuantity, remainingQuantity)
        )

        setInputValueSearch((prevInputValue) => ({
            ...prevInputValue,
            [result.id]: updatedQuantity,
        }))

        const existingItemIndex = searchCartItems.findIndex(
            (item) => item.id === result.id
        )
        const sortedStocks = result.inventory_listings[0].inventory_stocks

        // Calculate the stock information for the selected quantity
        let stockItems = []
        let remainingCartQuantity = updatedQuantity
        let amount = 0 // Calculate the total amount

        for (const stock of sortedStocks) {
            const remaining = Number(stock.remaining)
            const tradePrice = Number(stock.tradePrice)
            const mrp = Number(stock.retailPrice)
            const rate = Number(stock.tradePrice)
            const stockid = stock.id
            // If the entered quantity is greater than the remaining quantity for this stock,
            // use the remaining quantity of the stock to calculate the amount
            const quantityToUse = Math.min(remainingCartQuantity, remaining)

            if (quantityToUse > 0) {
                const itemAmount = quantityToUse * tradePrice
                amount += itemAmount
                stockItems.push({
                    remaining: quantityToUse,
                    stockId: stockid,
                    tradePrice,
                    mrp,
                    rate,
                    amount: itemAmount,
                })

                remainingCartQuantity -= quantityToUse
                if (remainingCartQuantity <= 0) {
                    break
                }
            }
        }

        if (existingItemIndex !== -1) {
            if (updatedQuantity > 0) {
                const updatedSearchCartItems = [...searchCartItems]
                updatedSearchCartItems[existingItemIndex].cartQuantity =
                    updatedQuantity
                updatedSearchCartItems[existingItemIndex].remainingQuantity =
                    result.remainingQuantity - updatedQuantity
                updatedSearchCartItems[existingItemIndex].stockItems =
                    stockItems // Update the stock information
                updatedSearchCartItems[existingItemIndex].amount = amount // Update the total amount

                setSearchCartItems(updatedSearchCartItems)
                localStorage.setItem(
                    CART_ITEMS_KEY,
                    JSON.stringify(updatedSearchCartItems)
                )
            } else {
                // If the entered quantity is 0 or less, remove the item from the cart
                const updatedSearchCartItems = [...searchCartItems]
                updatedSearchCartItems.splice(existingItemIndex, 1)
                setSearchCartItems(updatedSearchCartItems)
                localStorage.setItem(
                    CART_ITEMS_KEY,
                    JSON.stringify(updatedSearchCartItems)
                )
            }
        } else {
            if (updatedQuantity > 0) {
                setSearchCartItems((prevCartItems) => [
                    ...prevCartItems,
                    {
                        id: result.id,
                        name: result.product.name,
                        brand: result.product.brand,
                        productVariantId:
                            result.inventory_listings[0].productVariantId,
                        barcode: result.barcode,
                        sizeValue: result.product_size.value,
                        sizeUnit: result.product_size.unit,
                        cartQuantity: updatedQuantity,
                        remainingQuantity:
                            result.remainingQuantity - updatedQuantity,
                        amount,
                        stockItems, // Add the stock information
                    },
                ])
            }
        }
    }
    // Function to handle clicking "Remove" button in search data table
    const handleSearchRemoveItemClick = (result) => {
        setInputValueSearch((prevInputValue) => ({
            ...prevInputValue,
            [result.id]: null,
        }))

        const existingItemIndex = searchCartItems.findIndex(
            (item) => item.id === result.id
        )
        if (existingItemIndex !== -1) {
            const updatedSearchCartItems = [...searchCartItems]
            updatedSearchCartItems.splice(existingItemIndex, 1)
            setSearchCartItems(updatedSearchCartItems)
            localStorage.setItem(
                CART_ITEMS_KEY,
                JSON.stringify(updatedSearchCartItems)
            )
        }
    }
    const handleremovecart = (stockId, productId) => {
        const updatedCartItems = searchCartItems
            .map((item) => {
                if (item.id === productId) {
                    const updatedStockItems = item.stockItems.filter(
                        (stockItem) => stockItem.stockId !== stockId
                    )

                    if (updatedStockItems.length === 0) {
                        // Return null to remove the entire product from cart
                        setInputValueSearch((prevInputValue) => ({
                            ...prevInputValue,
                            [item.id]: null,
                        }))
                        return null
                    }

                    return {
                        ...item,
                        stockItems: updatedStockItems,
                    }
                }
                return item
            })
            .filter((item) => item !== null) // Remove items with null (i.e., no stockItems)

        setSearchCartItems(updatedCartItems)
        localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCartItems))
    }
    // Function to handle adding item to search cart
    const handleSearchAddItemClick = (result) => {
        setInputValueSearch((prevInputValue) => ({
            ...prevInputValue,
            [result.id]: 1,
        }))

        const existingItemIndex = searchCartItems.findIndex(
            (item) => item.id === result.id
        )
        if (existingItemIndex !== -1) {
            // Item already exists in cart, do nothing
            return
        }

        // Calculate the sortedStocks variable
        const sortedStocks = result.inventory_listings[0].inventory_stocks

        // Calculate the number of items to add to the cart
        const enteredQuantity = 1
        const remainingQuantity = sortedStocks.reduce(
            (total, stock) => total + stock.remaining,
            0
        )
        const updatedQuantity = Math.min(enteredQuantity, remainingQuantity)

        // Add the items to the cart based on the available stock
        const newCartItems = []
        let remainingCartQuantity = updatedQuantity

        for (const stock of sortedStocks) {
            const availableQuantity = Math.min(
                stock.remaining,
                remainingCartQuantity
            )
            if (availableQuantity > 0) {
                // Calculate stockItems here
                const stockItems = []

                const quantityToUse = Math.min(
                    availableQuantity,
                    stock.remaining
                )

                const amount = quantityToUse * Number(stock.tradePrice)

                stockItems.push({
                    stockId: stock.id,
                    remaining: quantityToUse,
                    tradePrice: Number(stock.tradePrice),
                    mrp: Number(stock.retailPrice),
                    rate: Number(stock.tradePrice),
                    amount,
                })

                newCartItems.push({
                    id: result.id,
                    name: result.product.name,
                    brand: result.product.brand,
                    productVariantId:
                        result.inventory_listings[0].productVariantId,
                    barcode: result.barcode,
                    sizeValue: result.product_size.value,
                    sizeUnit: result.product_size.unit,
                    cartQuantity: availableQuantity,
                    remainingQuantity: stock.remaining - availableQuantity,
                    amount,
                    costPrice: stock.costPrice,
                    sellingPrice: stock.sellingPrice,
                    retailPrice: stock.retailPrice,
                    stockItems, // Add the stock information
                })
                remainingCartQuantity -= availableQuantity
                if (remainingCartQuantity === 0) break
            }
        }

        // Add the new cart items
        setSearchCartItems((prevCartItems) => [
            ...prevCartItems,
            ...newCartItems,
        ])
        const updatedCartItems = [...searchCartItems, ...newCartItems]
        localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCartItems))
    }

    const handlePlaceOrder = async () => {
        setIsLoadingplace(true)
        const allCartItems = [...cartItems, ...searchCartItems]
        const orderItems = await Promise.all(
            allCartItems.map(async (item) => {
                const stockItems = item.stockItems || [] // Default to empty array if stock items not found

                const orderItemsForProduct = stockItems.map((stockItem) => {
                    const stockRemainingQuantity = stockItem.remaining || 0
                    const stockId = stockItem.stockId || null

                    return {
                        quantity: stockRemainingQuantity,
                        productVariantId: item.productVariantId,
                        stockId: stockId,
                        // Add other properties as needed
                    }
                })

                return orderItemsForProduct
            })
        )

        const flattenedOrderItems = orderItems.flat() // Flatten the nested arrays
        const requestData = {
            storecode: selectedStoreCode,
            employeeId: user.id,
            items: flattenedOrderItems,
            inventoryCode: user.storeCode,
        }
        try {
            const response = await url.post('v1/in/allotments', requestData)
            if (response.data.status === true) {
                handleShowSnackbar('Successfully placed order', 'success')
                setIsLoadingplace(false)
                setStoreAllotmentResponse(response.data.data)
                setIsStoreAlloted(true)
                setCartItems([])
                setSearchCartItems([])
                setSelectedStoreCode([])
                setSearchQuery('')
                setSearchResults([])
                setIsSearching(false)
                setInputValueSearch([])
                localStorage.removeItem(CART_ITEMS_KEY)
                localStorage.removeItem(SELECTED_STORE_KEY)
            } else {
                console.log('Order placement failed:', response.data.message)
                setIsLoadingplace(false)
                handleShowSnackbar(response.data.message, '')
            }
        } catch (error) {
            setIsLoadingplace(false)
            console.log('Error placing the order:', error)
        }
    }

    const handlePrintBill = () => {
        url.get(
            `v1/in/allotments-items?storeAllotmentId=${storeAllotmentResponse.allotmentId}`
        )
            .then((response) => {
                if (response.data.status === true) {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        const data = response.data.data

                        printWindow.document.write(`
                <html>
                  <head>
                    <title>Print Store Allotment</title>
                    <style>
                      /* Add your custom styles for the printable invoice here */
                      /* For example: */
                      .invoice-details {
                        /* styles for the invoice details section */
                      }
                      
                      .invoice-details__table {
                        border-collapse: collapse;
                        width: 100%;
                      }
                      
                      .invoice-details__table th,
                      .invoice-details__table td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                      }
                      
                      .invoice-details__table th {
                        background-color: #f2f2f2;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="invoice-details">
                      <h2 class="invoice-details__title">Allotment Details</h2>
                      <div class="invoice-details__section">
                        <strong class="invoice-details__label">Allotemnt ID:</strong>
                        <span class="invoice-details__value">${
                            storeAllotmentResponse.allotmentId
                        }</span>
                      </div>
                      <div class="invoice-details__section">
                        <strong class="invoice-details__label">Date & Time:</strong>
                        <span class="invoice-details__value">${
                            data.createdAt
                        }</span>
                      </div>
                   

                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">StoreCode:</strong>
                      <span class="invoice-details__value">${data.storeCode}(${
                            data.storeName
                        })</span>
                    </div>

                    <div class="invoice-details__section">
                    <strong class="invoice-details__label">Status:</strong>
                    <span class="invoice-details__value">${data.status}</span>
                  </div>
                      <div class="invoice-details__separator" />
                      <h3 class="invoice-details__title">Items (${
                          data.items.length
                      })</h3>
                      <table class="invoice-details__table">
                        <thead>
                          <tr>
                            <th>Sno</th>
                            <th>Vid</th>
                            <th>Item Name</th>
                            <th>Size</th>
                            <th>MRP</th>
                            <th>Rate</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Remove Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${data.items
                              .map(
                                  (item, index) => `
                                <tr>
                                  <td>${index + 1}</td>
                                  <td>${item.productVariantId}</td>
                                  <td>${item.name}</td>
                                  <td>${item.productSize} </td>
                                  <td>${item.retailPrice}</td>
                                  <td>${item.costPrice}</td>
                                  <td>${item.quantity}</td>
                                  <td>${(
                                      item.costPrice * item.quantity
                                  ).toFixed(2)}</td>
                                  <td style="
                                  ${item.removedQty > 0 ? 'color: red;' : ''}
                                  ${
                                      item.removedQty > 0
                                          ? 'background-color: white;'
                                          : ''
                                  }
                                ">
                                  ${item.removedQty}
                                </td>
                                </tr>
                              `
                              )
                              .join('')}
                        </tbody>
                      </table>
                      <div class="invoice-details__separator" />
                      &nbsp;
                      &nbsp;
                      <div class="invoice-details__total">
                        <span class="invoice-details__total-label">Total Amount:</span>
                        <span class="invoice-details__total-value">₹${data.subtotalAmount.toFixed(
                            2
                        )}</span>
                        </div>
                        <div class="invoice-details__total">
                        <span class="invoice-details__total-label">Return Amount:</span>
                        <span class="invoice-details__total-value">₹${
                            data.subtotalAmount - data.totalAmount
                        }</span>
                        <div>
                        <div class="invoice-details__total">
                        <span class="invoice-details__total-label">Payable Amount:</span>
                        <span class="invoice-details__total-value">₹${data.totalAmount.toFixed(
                            2
                        )}</span>
                      </div>
                    </div>
                    <script>
                      window.onafterprint = function() {
                        window.close();
                      };
                    </script>
                  </body>
                </html>
              `)
                        printWindow.document.close()
                    } else {
                        console.error('Failed to open the print window.')
                    }
                } else {
                    handleShowSnackbar('Order ID not found!', 'error')
                }
            })
            .catch((error) => {
                handleShowSnackbar('Error fetching data', 'error')
            })
    }
    const getTotalAmount = () => {
        const allCartItems = [...cartItems, ...searchCartItems]
        const totalAmount = allCartItems.reduce(
            (sum, item) => sum + item.amount,
            0
        )
        return totalAmount
    }
    const filteredResults = searchResults.filter((result) => {
        const lowerCaseFilterQuery = filterQuery.toLowerCase()
        const lowerCaseProductName = result.product.name.toLowerCase()
        const lowerCaseBrand = (result.product.brand || '').toLowerCase() // Make brand value optional
        const lowerCaseSize = (result.product_size?.value || '').toLowerCase()
        const lowerCaseMrp = result.retailPrice.toString().toLowerCase()
        const lowerCaseRate = result.tradePrice.toString().toLowerCase()
        const lowerCaseStock = result.remainingQuantity.toString().toLowerCase()
        const lowerCaseOrderQuantity = result.orderQuantity
            .toString()
            .toLowerCase()
        const lowerCaseId = result.id.toString().toLowerCase() // Include ID

        return (
            lowerCaseProductName.includes(lowerCaseFilterQuery) ||
            lowerCaseBrand.includes(lowerCaseFilterQuery) || // Check brand only if it exists
            lowerCaseSize.includes(lowerCaseFilterQuery) ||
            lowerCaseMrp.includes(lowerCaseFilterQuery) ||
            lowerCaseRate.includes(lowerCaseFilterQuery) ||
            lowerCaseStock.includes(lowerCaseFilterQuery) ||
            lowerCaseOrderQuantity.includes(lowerCaseFilterQuery) ||
            lowerCaseId.includes(lowerCaseFilterQuery) // Check ID
        )
    })

    const displayResults = filterQuery ? filteredResults : searchResults
    return (
        <main>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <section className="store-allotment-section">
                <div className="card-section">
                    <Card className="container-card">
                        <h4>Store Allotment</h4>
                        <Select
                            value={selectedStoreCode}
                            onChange={handleStoreCodeChange}
                            className="store-select"
                            variant="outlined"
                            fullWidth
                            displayEmpty // To display the placeholder even when a value is selected
                        >
                            <MenuItem value="" disabled>
                                <em>Select Store</em>
                            </MenuItem>
                            {storeCodes.map((store) => (
                                <MenuItem key={store.code} value={store.code}>
                                    {store.code} - {store.location.locality}
                                </MenuItem>
                            ))}
                        </Select>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault() // Prevent form submission
                                        setIsSearching(false)
                                        setIsStoreAlloted(false)

                                        if (searchQuery.trim() !== '') {
                                            searchProducts(searchQuery.trim())
                                        } else {
                                            setIsSearching(false)
                                        }
                                    }
                                }}
                                placeholder="Enter your search query..."
                                variant="outlined"
                                fullWidth
                                style={{ height: '40px', marginRight: '10px' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ height: '40px' }}
                                onClick={() => {
                                    setIsSearching(false)
                                    setIsStoreAlloted(false)

                                    if (searchQuery.trim() !== '') {
                                        searchProducts(searchQuery.trim())
                                    } else {
                                        setIsSearching(false)
                                    }
                                }}
                            >
                                Search
                            </Button>
                        </div>

                        <br />

                        {ISLoading ? (
                            <div className="loading-indicator-container">
                                <CircularProgress className="loading-indicator" />
                            </div>
                        ) : isSearching ? (
                            <>
                                <div className="table-container">
                                    <div className="filter-container">
                                        <input
                                            type="text"
                                            value={filterQuery}
                                            onChange={(e) =>
                                                setFilterQuery(e.target.value)
                                            }
                                            placeholder="Filter by name, brand, size, mrp, rate, stock, or order quantity..."
                                        />
                                    </div>
                                    {filterQuery ? (
                                        // Display filtered results
                                        <>
                                            {filteredResults.length > 0 ? (
                                                <table className="table-container">
                                                    <thead>
                                                        <tr>
                                                            <th>Sno</th>
                                                            <th>ID</th>
                                                            <th>Image</th>
                                                            <th>
                                                                Brand & Name{' '}
                                                            </th>
                                                            <th>Size</th>
                                                            {/* <th>
                                                                Order Quantity
                                                            </th> */}
                                                            <th>Mrp</th>
                                                            <th>Rate</th>
                                                            <th>Stock</th>
                                                            <th>Quantity</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {displayResults
                                                            .slice(
                                                                currentPage *
                                                                    resultsPerPage,
                                                                (currentPage +
                                                                    1) *
                                                                    resultsPerPage
                                                            )
                                                            .map(
                                                                (
                                                                    result,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            result.id
                                                                        }
                                                                    >
                                                                        <td>
                                                                            {index +
                                                                                1 +
                                                                                currentPage *
                                                                                    resultsPerPage}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result.id
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            <img
                                                                                src={
                                                                                    result
                                                                                        .images[0]
                                                                                }
                                                                                alt="product-image"
                                                                                className="image-item"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result
                                                                                    .product
                                                                                    .brand
                                                                            }{' '}
                                                                            {
                                                                                result
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {result.product_size &&
                                                                            result
                                                                                .product_size
                                                                                .value
                                                                                ? `${result.product_size.value} ${result.product_size.unit}`
                                                                                : ''}
                                                                        </td>

                                                                        {/* <td>
                                                                            {result.orderQuantity ===
                                                                            0 ? (
                                                                                <span className="out-of-stock">
                                                                                    Out
                                                                                    of
                                                                                    Stock
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    {
                                                                                        result.orderQuantity
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </td> */}

                                                                        <td>
                                                                            {
                                                                                result.retailPrice
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result.tradePrice
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {result.remainingQuantity ===
                                                                            0 ? (
                                                                                <span className="out-of-stock">
                                                                                    Out
                                                                                    of
                                                                                    Stock
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    {
                                                                                        result.remainingQuantity
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {result.remainingQuantity >
                                                                                0 && (
                                                                                <div className="action-buttons">
                                                                                    <div>
                                                                                        <input
                                                                                            type="number"
                                                                                            value={
                                                                                                inputValueSearch[
                                                                                                    result
                                                                                                        .id
                                                                                                ] ||
                                                                                                ''
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleSearchInputChange(
                                                                                                    result,
                                                                                                    e
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>

                                                                        <td>
                                                                            {result.remainingQuantity >
                                                                                0 && (
                                                                                <div className="action-buttons">
                                                                                    <div>
                                                                                        {inputValueSearch[
                                                                                            result
                                                                                                .id
                                                                                        ] ? (
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleSearchRemoveItemClick(
                                                                                                        result
                                                                                                    )
                                                                                                }
                                                                                                className="remove-btn"
                                                                                            >
                                                                                                REMOVE
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleSearchAddItemClick(
                                                                                                        result
                                                                                                    )
                                                                                                }
                                                                                                className="add-btn"
                                                                                            >
                                                                                                ADD
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>
                                                    No Results Found for the
                                                    Filter
                                                </p>
                                            )}
                                            <div className="pagination-container">
                                                <div className="pagination ">
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage === 0
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(0)
                                                        }
                                                        disabled={
                                                            currentPage === 0
                                                        }
                                                    >
                                                        First
                                                    </button>
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage === 0
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                currentPage - 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage === 0
                                                        }
                                                    >
                                                        Previous
                                                    </button>
                                                    {Array.from(
                                                        {
                                                            length: Math.ceil(
                                                                filteredResults.length /
                                                                    resultsPerPage
                                                            ),
                                                        },
                                                        (_, index) => {
                                                            if (
                                                                index >=
                                                                    currentPage -
                                                                        4 &&
                                                                index <=
                                                                    currentPage +
                                                                        5 &&
                                                                index >= 0
                                                            ) {
                                                                return (
                                                                    <button
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={`pagination-button ${
                                                                            currentPage ===
                                                                            index
                                                                                ? 'active'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            setCurrentPage(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        {index +
                                                                            1}
                                                                    </button>
                                                                )
                                                            }
                                                            return null
                                                        }
                                                    )}
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage ===
                                                            Math.ceil(
                                                                filteredResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                currentPage + 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage ===
                                                            Math.ceil(
                                                                filteredResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                        }
                                                    >
                                                        Next
                                                    </button>
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage ===
                                                            Math.ceil(
                                                                filteredResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                Math.ceil(
                                                                    filteredResults.length /
                                                                        resultsPerPage
                                                                ) - 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage ===
                                                            Math.ceil(
                                                                filteredResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                        }
                                                    >
                                                        Last
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Display all results
                                        <>
                                            {searchResults.length > 0 ? (
                                                <table className="table-container">
                                                    <thead>
                                                        <tr>
                                                            <th>Sno</th>
                                                            <th>ID</th>
                                                            <th>Image</th>
                                                            <th>
                                                                Brand & Name{' '}
                                                            </th>
                                                            <th>Size</th>
                                                            {/* <th>
                                                                Order Quantity
                                                            </th> */}
                                                            <th>Mrp</th>
                                                            <th>Rate</th>
                                                            <th>Stock</th>
                                                            <th>Quantity</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {displayResults
                                                            .slice(
                                                                currentPage *
                                                                    resultsPerPage,
                                                                (currentPage +
                                                                    1) *
                                                                    resultsPerPage
                                                            )
                                                            .map(
                                                                (
                                                                    result,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            result.id
                                                                        }
                                                                    >
                                                                        <td>
                                                                            {index +
                                                                                1 +
                                                                                currentPage *
                                                                                    resultsPerPage}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result.id
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            <img
                                                                                src={
                                                                                    result
                                                                                        .images[0]
                                                                                }
                                                                                alt="product-image"
                                                                                className="image-item"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result
                                                                                    .product
                                                                                    .brand
                                                                            }{' '}
                                                                            {
                                                                                result
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {result.product_size &&
                                                                            result
                                                                                .product_size
                                                                                .value
                                                                                ? `${result.product_size.value} ${result.product_size.unit}`
                                                                                : ''}
                                                                        </td>

                                                                        {/* <td>
                                                                            {result.orderQuantity ===
                                                                            0 ? (
                                                                                <span className="out-of-stock">
                                                                                    Out
                                                                                    of
                                                                                    Stock
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    {
                                                                                        result.orderQuantity
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </td> */}

                                                                        <td>
                                                                            {
                                                                                result.retailPrice
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                result.tradePrice
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {result.remainingQuantity ===
                                                                            0 ? (
                                                                                <span className="out-of-stock">
                                                                                    Out
                                                                                    of
                                                                                    Stock
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    {
                                                                                        result.remainingQuantity
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {result.remainingQuantity >
                                                                                0 && (
                                                                                <div className="action-buttons">
                                                                                    <div>
                                                                                        <input
                                                                                            type="number"
                                                                                            value={
                                                                                                inputValueSearch[
                                                                                                    result
                                                                                                        .id
                                                                                                ] ||
                                                                                                ''
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleSearchInputChange(
                                                                                                    result,
                                                                                                    e
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>

                                                                        <td>
                                                                            {result.remainingQuantity >
                                                                                0 && (
                                                                                <div className="action-buttons">
                                                                                    <div>
                                                                                        {inputValueSearch[
                                                                                            result
                                                                                                .id
                                                                                        ] ? (
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleSearchRemoveItemClick(
                                                                                                        result
                                                                                                    )
                                                                                                }
                                                                                                className="remove-btn"
                                                                                            >
                                                                                                REMOVE
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleSearchAddItemClick(
                                                                                                        result
                                                                                                    )
                                                                                                }
                                                                                                className="add-btn"
                                                                                            >
                                                                                                ADD
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>No Results Found</p>
                                            )}
                                            <div className="pagination-container">
                                                <div className="pagination ">
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage === 0
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(0)
                                                        }
                                                        disabled={
                                                            currentPage === 0
                                                        }
                                                    >
                                                        First
                                                    </button>
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage === 0
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                currentPage - 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage === 0
                                                        }
                                                    >
                                                        Previous
                                                    </button>
                                                    {Array.from(
                                                        {
                                                            length: Math.ceil(
                                                                searchResults.length /
                                                                    resultsPerPage
                                                            ),
                                                        },
                                                        (_, index) => {
                                                            if (
                                                                index >=
                                                                    currentPage -
                                                                        4 &&
                                                                index <=
                                                                    currentPage +
                                                                        5 &&
                                                                index >= 0
                                                            ) {
                                                                return (
                                                                    <button
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={`pagination-button ${
                                                                            currentPage ===
                                                                            index
                                                                                ? 'active'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            setCurrentPage(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        {index +
                                                                            1}
                                                                    </button>
                                                                )
                                                            }
                                                            return null
                                                        }
                                                    )}
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage ===
                                                            Math.ceil(
                                                                searchResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                currentPage + 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage ===
                                                            Math.ceil(
                                                                searchResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                        }
                                                    >
                                                        Next
                                                    </button>
                                                    <button
                                                        className={`pagination-button ${
                                                            currentPage ===
                                                            Math.ceil(
                                                                searchResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                Math.ceil(
                                                                    searchResults.length /
                                                                        resultsPerPage
                                                                ) - 1
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage ===
                                                            Math.ceil(
                                                                searchResults.length /
                                                                    resultsPerPage
                                                            ) -
                                                                1
                                                        }
                                                    >
                                                        Last
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </Card>
                    {/* cart data */}
                    <Card className="cart-section">
                        {!isStoreAlloted ? (
                            <div className="cart-header-section">
                                <div className="cart-headings">
                                    <h3>Cart Products</h3>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {isLoading ? ( // Render loading indicator while data is being fetched
                                    <div className="loading-container">
                                        <h1>Loading Data.....</h1>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="export-buttons">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handlePrintBill}
                                                sx={{ width: '100%' }}
                                            >
                                                {' '}
                                                {isLoadingplace && (
                                                    <StyledProgress
                                                        size={24}
                                                        className="buttonProgress"
                                                    />
                                                )}
                                                Print Bill
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="table-container">
                            {cartItems.length > 0 ||
                            searchCartItems.length > 0 ? (
                                <>
                                    <div className="place-order">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handlePlaceOrder}
                                            sx={{ width: '100%' }}
                                            disabled={isLoadingplace}
                                        >
                                            {' '}
                                            {isLoadingplace && (
                                                <StyledProgress
                                                    size={24}
                                                    className="buttonProgress"
                                                />
                                            )}
                                            Place order
                                        </Button>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                {/* <th>Sno</th> */}
                                                <th>ID</th>
                                                <th>Brand & Name </th>
                                                <th>Size</th>
                                                <th>MRP</th>
                                                <th>Rate</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchCartItems.map(
                                                (item, itemIndex) => (
                                                    <React.Fragment
                                                        key={item.id}
                                                    >
                                                        {item.stockItems.map(
                                                            (
                                                                stockItem,
                                                                stockIndex
                                                            ) => (
                                                                <tr
                                                                    key={`${item.id}-${stockIndex}`}
                                                                >
                                                                    {/* <td>
                                                                        {itemIndex *
                                                                            item
                                                                                .stockItems
                                                                                .length +
                                                                            stockIndex +
                                                                            1}
                                                                    </td> */}
                                                                    <td>
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            item.brand
                                                                        }{' '}
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            item.sizeValue
                                                                        }{' '}
                                                                        {
                                                                            item.sizeUnit
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            stockItem.mrp
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            stockItem.rate
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            stockItem.remaining
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {stockItem.amount.toFixed(
                                                                            2
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleremovecart(
                                                                                    stockItem.stockId,
                                                                                    item.id
                                                                                )
                                                                            }
                                                                            // className="remove-btn"
                                                                        >
                                                                            <IMG
                                                                                src="/assets/images/delete.jpg"
                                                                                alt=""
                                                                            />
                                                                            {/* <img src={del} /> */}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </React.Fragment>
                                                )
                                            )}
                                        </tbody>

                                        <tfoot>
                                            <tr>
                                                <td colSpan="6">
                                                    Total Amount:
                                                </td>
                                                <td>
                                                    {getTotalAmount().toFixed(
                                                        2
                                                    )}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </>
                            ) : (
                                <div className="no-items">
                                    <p>Add items to cart...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    )
}
export default StoreAllotment
