import React, { useEffect, useState } from 'react'
import { url } from 'app/constants'
import { Card, Table, Modal, Button } from 'react-bootstrap'
import './verifystyle.css'
import useAuth from 'app/hooks/useAuth'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { Breadcrumb } from 'app/components'

const VerifiedProductsList = () => {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [details, setDetails] = useState([])
    const [reportedItems, setReportedItems] = useState([])
    const [showReportModal, setShowReportModal] = useState(false)
    const [currentProduct, setCurrentProduct] = useState(null)
    const [allotments, setAllotments] = useState([])
    const [selectedAllotmentId, setSelectedAllotmentId] = useState('')
    const [isData, setIsData] = useState(false)
    const [isReportData, setIsReportData] = useState(false)
    const [noDataFound, setNoDataFound] = useState(false)
    const [loading, setloading] = useState(false)
    const [reportData, setReportData] = useState({
        quantity: '',
        reason: '',
    })

    const [
        selectedAllotmentForVerification,
        setSelectedAllotmentForVerification,
    ] = useState('')
    useEffect(() => {
        const fetchAllotments = async () => {
            try {
                const response = await url.get(
                    `v1/in/allotments?storeCode=${user.storeCode}&status=pending`
                )
                if (response.data.status) {
                    const data = response.data.data
                    setAllotments(data)
                    setSelectedAllotmentForVerification('')
                } else {
                    setAllotments([])
                    setSelectedAllotmentForVerification('')
                }
            } catch (error) {
                console.error('Error fetching allotments:', error)
            }
        }

        fetchAllotments()
    }, [selectedAllotmentForVerification])

    useEffect(() => {
        if (selectedAllotmentId !== '') {
            fetchProducts(selectedAllotmentId)
        }
    }, [selectedAllotmentId])

    const fetchProducts = async (allotmentId) => {
        try {
            const response = await url.get(
                `v1/in/allotments-items?storeAllotmentId=${allotmentId}`
            )
            const data = response.data.data

            if (!data || data.items.length === 0) {
                setNoDataFound(true)
                setIsData(false)
            } else {
                setProducts(data.items)
                setDetails(data)
                setIsData(true)
                setNoDataFound(false)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleAllotmentChange = (event) => {
        setSelectedAllotmentId(event.target.value)
        setSelectedAllotmentForVerification('')
        setReportedItems([])
        setProducts([])
    }

    const handleVerify = async () => {
        setloading(true)
        try {
            const damagedItems = reportedItems.map((reportedItem) => ({
                quantity: reportedItem.removedQuantity,
                productVariantId: reportedItem.productVariantId,
                reason: reportedItem.reason,
                storeAllotmentItemId: reportedItem.storeAllotmentItemId,
            }))

            const payload = {
                status: 'completed',
                storeCode: user.storeCode,
                employeeId: user.id,
                damagedItems: damagedItems,
            }
            const response = await url.put(
                `v1/in/allotments/${selectedAllotmentId}`,
                payload
            )

            if (response.data.status === false) {
                alert(response.data.message)
                setIsReportData(false)
                return
            }

            if (response.data.status === true) {
                alert('Verification successful')
                setSelectedAllotmentForVerification(selectedAllotmentId)
                setSelectedAllotmentId('')
                setReportedItems([])
                setProducts([])
                setIsData(false)
                setIsReportData(false)
                setloading(false)
                return
            }
            setReportedItems([])
            setSelectedAllotmentId([])
        } catch (error) {
            console.error('Error verifying products:', error)
            // alert(error);
        }
    }

    const openReportModal = (product) => {
        setCurrentProduct(product)
        setShowReportModal(true)
        setReportData({ quantity: '', reason: '' }) // Clear previous report data
    }

    const closeReportModal = () => {
        setShowReportModal(false)
        setReportData({})
        setCurrentProduct(null)
    }

    const handleRemoveItem = (reportedItem) => {
        const updatedProducts = [...products]
        const productIndex = updatedProducts.findIndex(
            (product) =>
                product.productVariantId === reportedItem.productVariantId
        )

        if (productIndex !== -1) {
            updatedProducts[productIndex].quantity +=
                reportedItem.removedQuantity
            setProducts(updatedProducts)
        }

        setReportedItems((prevReportedItems) =>
            prevReportedItems.filter(
                (item) =>
                    item.productVariantId !== reportedItem.productVariantId
            )
        )
    }

    const handleReport = () => {
        if (!reportData.quantity || reportData.quantity <= 0) {
            alert('Please enter a valid quantity.')
            return
        }

        if (!reportData.reason) {
            alert('Please select a reason.')
            return
        }

        const productInArray = products.find(
            (p) => p.productVariantId === currentProduct.productVariantId
        )

        if (!productInArray) {
            alert('Product not found.')
            return
        }

        if (reportData.quantity > productInArray.quantity) {
            alert(
                'Reported quantity cannot be greater than available quantity.'
            )
            return
        }
        const reportedItem = {
            productVariantId: currentProduct.productVariantId,
            removedQuantity: reportData.quantity,
            reason: reportData.reason,
            name: productInArray.name,
            mrp: productInArray.retailPrice,
            rate: productInArray.sellingPrice,
            quantity: productInArray.quantity,
            storeAllotmentItemId: currentProduct.allotmentItemId,
        }

        setReportedItems((prevReportedItems) => [
            ...prevReportedItems,
            reportedItem,
        ])

        const updatedProducts = [...products]
        const productIndex = updatedProducts.findIndex(
            (p) => p.productVariantId === currentProduct.productVariantId
        )

        if (productIndex !== -1) {
            updatedProducts[productIndex].quantity -= reportData.quantity
            setProducts(updatedProducts)
        }

        setIsReportData(true)
        setShowReportModal(false)
        setReportData({ quantity: '', reason: '' })
    }

    return (
        <main>
            <section className="verified-items-s">
                <div className="product-details-section-allotment">
                    <Card className="inner-card-allotment">
                        <div className="breadcrumb">
                            <Breadcrumb
                                routeSegments={[{ name: 'Store Allotment' }]}
                            />
                        </div>
                        <div className="allotment-select">
                            <FormControl fullWidth>
                                <InputLabel>Select Allotment</InputLabel>
                                <Select
                                    id="allotment"
                                    value={selectedAllotmentId}
                                    onChange={handleAllotmentChange}
                                >
                                    <MenuItem value="">
                                        Select Allotment Id :
                                    </MenuItem>
                                    {allotments.map(
                                        (allotment) =>
                                            selectedAllotmentForVerification !==
                                                allotment.id && (
                                                <MenuItem
                                                    key={allotment.id}
                                                    value={allotment.id}
                                                >
                                                    {allotment.id}
                                                </MenuItem>
                                            )
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        {isData ? (
                            <>
                                <Card className="de-card">
                                    <div className="details-card">
                                        <div className="details-data">
                                            <p
                                                style={{
                                                    color: '#008000',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Date:{' '}
                                            </p>
                                            <p>{details.createdAt}</p>
                                        </div>
                                        <div className="details-data">
                                            <p
                                                style={{
                                                    color: '#008000',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Store Name:{' '}
                                            </p>
                                            <p>{details.storeName}</p>
                                        </div>
                                        <div className="details-data">
                                            <p
                                                style={{
                                                    color: '#008000',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Status:{' '}
                                            </p>
                                            <p>{details.status}</p>
                                        </div>
                                    </div>
                                </Card>
                                <div
                                    className="table-container"
                                    style={{
                                        maxHeight: '800px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <br />

                                    <Table
                                        responsive
                                        className="bordered-table"
                                    >
                                        <thead>
                                            <tr>
                                                <th>sno</th>
                                                <th>Vid</th>
                                                <th>Image</th>
                                                <th>Brand & Name </th>
                                                <th>Size</th>
                                                <th>MRP</th>
                                                <th>Rate</th>
                                                <th>Qty</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product, index) => (
                                                <tr
                                                    key={
                                                        product.productVariantId
                                                    }
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {
                                                            product.productVariantId
                                                        }
                                                    </td>
                                                    <td>
                                                        <img
                                                            src={
                                                                product.imageUrl ||
                                                                ''
                                                            }
                                                            alt={
                                                                product.name ||
                                                                ''
                                                            }
                                                            className="product-img"
                                                        />
                                                    </td>
                                                    <td>
                                                        {product.name || ''}
                                                    </td>
                                                    <td>
                                                        {product.productSize}
                                                    </td>
                                                    <td>
                                                        {product.retailPrice}
                                                    </td>
                                                    <td>
                                                        {product.sellingPrice}
                                                    </td>
                                                    <td>{product.quantity}</td>
                                                    <td>
                                                        {product.quantity >
                                                        0 ? (
                                                            <div className="report-column-section">
                                                                <button
                                                                    onClick={() =>
                                                                        openReportModal(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    Report
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span>
                                                                Out of stock
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <div className="verify-btn">
                                        <button
                                            onClick={handleVerify}
                                            disabled={loading}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                {!noDataFound ? (
                                    <div
                                        className="no-data"
                                        style={{
                                            fontSize: '20px',
                                            color: 'Green',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            marginTop: '15px',
                                        }}
                                    >
                                        <p>Select allotment Id...</p>
                                    </div>
                                ) : (
                                    <div
                                        className="no-data"
                                        style={{
                                            fontSize: '20px',
                                            color: 'red',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            marginTop: '15px',
                                        }}
                                    >
                                        <p>
                                            No data found with the allotment
                                            Id...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
                <div className="product-details-section-verify">
                    <Card
                        className="inner-card-verify"
                        style={{
                            maxHeight: '800px',
                            overflowY: 'auto',
                        }}
                    >
                        <div className="reported-heading">
                            <p
                                style={{
                                    color: '#424964',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                }}
                            >
                                Reported Products
                            </p>
                        </div>
                        {reportedItems.length > 0 && isReportData ? (
                            <div>
                                <Table responsive className="bordered-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>vid</th>
                                            <th>Brand & Name</th>
                                            <th>MRP</th>
                                            <th>Rate</th>
                                            <th>Qty</th>
                                            <th>Rmv Qty</th>
                                            {/* <th>Add Qty</th> */}
                                            <th>Reason</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportedItems.map(
                                            (reportedItem, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {
                                                            reportedItem.productVariantId
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            reportedItem.productVariantId
                                                        }
                                                    </td>
                                                    <td>
                                                        {reportedItem.name ||
                                                            ''}
                                                    </td>
                                                    <td>{reportedItem.mrp}</td>
                                                    <td>{reportedItem.rate}</td>
                                                    <td>
                                                        {reportedItem.quantity}
                                                    </td>
                                                    <td>
                                                        {
                                                            reportedItem.removedQuantity
                                                        }
                                                    </td>
                                                    {/* <td>{reportedItem.updatedQuantity}</td> */}
                                                    <td>
                                                        {reportedItem.reason}
                                                    </td>
                                                    <td>
                                                        <IconButton
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    reportedItem
                                                                )
                                                            }
                                                            className="remove-btn"
                                                            color="error"
                                                            aria-label="remove"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div className="no-data">
                                <p
                                    className="no-data"
                                    style={{
                                        fontSize: '20px',
                                        color: 'Green',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginTop: '15px',
                                    }}
                                >
                                    Report products to verify...
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </section>
            <Modal show={showReportModal} onHide={closeReportModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Report Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div className="quantity-input">
                            <label htmlFor="quantity">Enter Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                id="quantity"
                                value={reportData.quantity}
                                onChange={(e) =>
                                    setReportData({
                                        ...reportData,
                                        quantity: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="reason-input">
                            <label htmlFor="reason">Select Reason:</label>
                            <select
                                id="reason"
                                value={reportData.reason}
                                onChange={(e) =>
                                    setReportData({
                                        ...reportData,
                                        reason: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select Reason</option>
                                <option value="Product damaged while handling">
                                    Product damaged while handling
                                </option>
                                <option value="Product defective">
                                    Product defective
                                </option>
                                <option value="Product expired">
                                    Product expired
                                </option>
                            </select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleReport}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    )
}

export default VerifiedProductsList
