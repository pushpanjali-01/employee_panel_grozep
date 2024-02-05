import { Button, CircularProgress } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { SimpleCard, Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import { GrozpSnackbar } from 'app/components/'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import { formatDateTimeNew } from '../../dateUtils'
import '../dashboard/graph/dashboard.css'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
    '& .breadcrumb': {
        marginBottom: '10px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

const POSList = () => {
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = useState(false)
    const { user } = useAuth()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataToSend = {
                    employeeId: user.id,
                    storeCode: user.storeCode,
                    channel: 'store',
                }
                const response = await url.post(
                    'v1/in/orders/admin',
                    dataToSend
                )
                const responseData = response.data
                if (responseData.status) {
                    if (responseData.data.length <= 0) {
                        setData([])
                        setLoading(false)
                    } else {
                        setData(responseData.data)
                        setLoading(false)
                    }
                } else {
                    handleShowSnackbar('NO any Data', 'error')
                    setData([])
                    setLoading(false)
                }
            } catch (error) {
                console.log('Error:', error)
                setLoading(false)
                setData([])
            }
        }
        fetchData()
    }, [])

    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const totalAmount = item.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)
            let finalAmount =
                totalAmount +
                item.deliveryCharge -
                item.loyaltyPoint -
                item.promoDiscount
            if (finalAmount < 0) {
                finalAmount = 0
            }
            return {
                ...item,
                sno: index + 1,
                amount: finalAmount.toFixed(2),
                orderDateTime: formatDateTimeNew(item.createdAt),
            }
        })
    }

    const tableData = {
        columns: [
            { label: 'Sno', field: 'sno', sort: 'asc' },
            { label: 'Date & Time', field: 'orderDateTime', sort: 'asc' },
            { label: 'OrderNumber', field: 'id', sort: 'asc' },
            { label: 'Payment Mode', field: 'paymentMode', sort: 'asc' },
            { label: 'Coupon Amount', field: 'promoDiscount', sort: 'asc' },
            { label: 'Redeem Amount', field: 'loyaltyPoint', sort: 'asc' },
            { label: 'Amount', field: 'amount', sort: 'asc' },
            { label: 'Phone', field: 'phone', sort: 'asc' },
            { label: 'Status', field: 'status', sort: 'asc' },
        ],
        rows: generateSerialNumbers(data).map((item) => ({
            ...item,
            status: (
                <Button
                    variant="contained"
                    color="success"
                    style={{ backgroundColor: 'green' }}
                >
                    {item.status}
                </Button>
            ),
        })),
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    const handleClose = (reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />

            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Offline Orders' }]} />
                </div>
                {loading ? ( // Conditionally render loading indicator
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="table-responsive">
                        <MDBDataTable
                            checkbox
                            data={tableData}
                            noBottomColumns={true}
                            hover
                            exportToCSV={true}
                            className="custom-table"
                        />
                    </div>
                )}
            </SimpleCard>
        </Container>
    )
}

export default POSList
