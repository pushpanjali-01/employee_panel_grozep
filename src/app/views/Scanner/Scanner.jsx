import React, { useState, useEffect, useRef } from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
import { GrozpSnackbar } from 'app/components/'

const Scanner = () => {
    const barcodeInputRef = useRef(null)
    const { user } = useAuth()
    const [openDialog, setOpenDialog] = useState(true)
    const [orderId, setOrderId] = useState('')
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [barcode, setBarcode] = useState('')
    const [panels, setPanels] = useState([])
    const [orderData, setOrderData] = useState(null)
    const [rows, setRows] = useState([])
    const [data, setData] = useState([])
    const [dataRowsLength, setDataRowsLength] = useState(0)
    const [address, setAddress] = useState('')
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [taskid, settaskid] = useState('')

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleOrderNumberKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            fetchOrderData()
        }
    }

    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleBarcodeScan(e)
        }
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    const fetchOrderData = () => {
        if (orderId !== '') {
            const params = {
                orderid: parseInt(orderId),
                employeeId: user.id,
            }
            url.get('v1/in/tasks/scans/items', { params })
                .then((response) => {
                    if (response.data.status === true) {
                        const orderData = response.data.data

                        if (orderData.order_invoice.order_items.length > 0) {
                            settaskid(orderData.id)
                            setOrderData(orderData.order_invoice)
                            setData(orderData.order_invoice.order_items)
                            setRows([])
                            setDataRowsLength(
                                orderData.order_invoice.order_items.length
                            )
                            setAddress(
                                orderData.order_invoice.delivery_addresses[0]
                                    .location.address
                            )
                            handleDialogClose()
                        } else {
                            handleShowSnackbar('Order ID not Found!', 'error')
                        }
                    } else {
                        handleShowSnackbar('Order ID not Found!', 'error')
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } else {
            handleShowSnackbar('Enter Order number!', 'error')
        }
    }

    const handleBarcodeScan = (e) => {
        e.preventDefault()
        const barcodeInput = barcode.trim()

        if (barcodeInput) {
            let matchFound = false
            let updatedData = []

            for (let i = 0; i < data.length; i++) {
                if (data[i].barcode === barcodeInput) {
                    setRows((prevRows) => [...prevRows, data[i]])
                    matchFound = true
                } else {
                    updatedData.push(data[i])
                }
            }

            if (matchFound) {
                setData(updatedData)
            } else {
                alert('Barcode not Match!')
            }

            setBarcode('')
        }
    }

    const completeOrder = () => {
        const text = 'All items are matched!\nAre you sure to confirm.'
        if (window.confirm(text)) {
            url.put(`v1/in/tasks/scans/items?taskid=${taskid}&status=completed`)
                .then((response) => {
                    alert(
                        `${orderId}, Address: ${address}\nOrder Scan & packed`
                    )
                    handleShowSnackbar('Order Scanned Successfully!', 'success')
                    setOrderId('')
                    settaskid('')
                    setOrderData(null)
                    setRows([])
                    setData([])
                    setOpenDialog(true)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    const openOrderModal = () => {
        setShowOrderModal(true)
    }

    const closeOrderModal = () => {
        setShowOrderModal(false)
    }

    const submitOrder = () => {
        if (orderId) {
            fetchOrderData(orderId)
            closeOrderModal()
        } else {
            alert('Please enter an order ID')
        }
    }

    const handleDialogClose = () => {
        setOpenDialog(false)
    }

    useEffect(() => {
        if (orderData !== null) {
            barcodeInputRef.current.focus()
        }
    }, [orderData])

    return (
        <div>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                disableBackdropClick={true}
            >
                <DialogTitle>Order Validation</DialogTitle>
                <DialogContent>
                    <TextField
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        label="Enter Order Number"
                        onKeyDown={handleOrderNumberKeyDown}
                        autoFocus
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={fetchOrderData}
                        color="primary"
                        variant="contained"
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {orderData && (
                <>
                    <div>
                        <b>
                            Order ID: {orderId}, Address: {address}
                        </b>
                        <br />
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => {
                                setBarcode(e.target.value)
                            }}
                            ref={barcodeInputRef}
                            onKeyDown={handleBarcodeKeyDown}
                            placeholder="Barcode"
                            autoComplete="off"
                        />
                        <Button
                            onClick={handleBarcodeScan}
                            color="primary"
                            variant="contained"
                        >
                            Scan product
                        </Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                flex: 1,
                                border: '1px solid #ccc',
                                padding: '10px',
                            }}
                        >
                            <table
                                style={{
                                    borderCollapse: 'collapse',
                                    width: '100%',
                                }}
                            >
                                {/* Table content for total items */}
                                <thead>
                                    <tr>
                                        <th
                                            colSpan="6"
                                            style={{ textAlign: 'center' }}
                                        >
                                            <h4> Total Items</h4>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>SNO</th>
                                        <th>Barcode</th>
                                        <th>Image</th>
                                        <th>Name &amp; Size</th>
                                        <th>MRP</th>
                                        <th>Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.barcode}</td>
                                            <td>
                                                <img
                                                    src={item.imageUrl}
                                                    width="70"
                                                    alt="Product"
                                                />
                                            </td>
                                            <td>
                                                {item.name} - {item.size}
                                            </td>
                                            <td style={{ color: 'green' }}>
                                                {item.mrp}
                                            </td>
                                            <td style={{ color: 'red' }}>
                                                {item.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                border: '1px solid #ccc',
                                padding: '10px',
                            }}
                        >
                            <table
                                style={{
                                    borderCollapse: 'collapse',
                                    width: '100%',
                                }}
                            >
                                {/* Table content for scanned items */}
                                <thead>
                                    <tr>
                                        <th
                                            colSpan="6"
                                            style={{ textAlign: 'center' }}
                                        >
                                            <h4> Scanned Items</h4>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>SNO</th>
                                        <th>Barcode</th>
                                        <th>Image</th>
                                        <th>Name &amp; Size</th>
                                        <th>MRP</th>
                                        <th>Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.barcode}</td>
                                            <td>
                                                <img
                                                    src={item.imageUrl}
                                                    width="70"
                                                    alt="Product"
                                                />
                                            </td>
                                            <td>
                                                {item.name} - {item.size}
                                            </td>
                                            <td style={{ color: 'green' }}>
                                                {item.mrp}
                                            </td>
                                            <td style={{ color: 'red' }}>
                                                {item.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {dataRowsLength === rows.length && (
                        <Button
                            onClick={completeOrder}
                            color="primary"
                            variant="contained"
                        >
                            Complete Order
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}

export default Scanner
