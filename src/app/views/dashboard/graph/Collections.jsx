import React, { useState, useEffect, Fragment } from 'react'
import { SimpleCard } from 'app/components'
import { MDBDataTable } from 'mdbreact'
import { url } from 'app/constants'
import useAuth from 'app/hooks/useAuth'
import { formatDateTimeNew } from '../../.././dateUtils'
import './dashboard.css'
// style

// end style
const Collections = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])
    useEffect(() => {
        try {
            const dataToSend = {
                employeeId: user.id,
                storeCode: user.storeCode,
            }

            url.post('v1/in/orders/admin', dataToSend)
                .then((res) => {
                    if (res.data.status == true) {
                        if (res.data.data.length <= 0) {
                            setData([])
                        } else {
                            setData(res.data.data)
                        }
                    } else {
                        setData([])
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    const calculateTotalAmount = () => {
        let subtotal = 0

        data.forEach((order) => {
            const totalAmount = order.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)

            let finalAmount =
                totalAmount +
                order.deliveryCharge -
                order.loyaltyPoint -
                order.promoDiscount

            // Set finalAmount to zero if it's negative
            if (finalAmount < 0) {
                finalAmount = 0
            }

            subtotal += finalAmount
        })

        return subtotal.toFixed(2)
    }

    const calculateVoucherAmount = () => {
        let totalVoucherAmount = 0
        data.forEach((order) => {
            totalVoucherAmount += order.promoDiscount || 0
        })
        return totalVoucherAmount
    }

    const calculateRedeemPoints = () => {
        let totalRedeemPoints = 0
        data.forEach((order) => {
            totalRedeemPoints += order.loyaltyPoint || 0
        })
        return totalRedeemPoints
    }
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
                totalAmount: finalAmount.toFixed(2),
                orderDateTime: formatDateTimeNew(item.createdAt),
            }
        })
    }
    const tableData = {
        columns: [
            {
                label: 'Sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'Date & Time',
                field: 'orderDateTime',
                sort: 'asc',
            },
            {
                label: 'OrderNumber',
                field: 'id',
                sort: 'asc',
            },
            {
                label: 'Payment Mode',
                field: 'paymentMode',
                sort: 'asc',
            },
            {
                label: 'Coupon Amount',
                field: 'promoDiscount',
                sort: 'asc',
            },
            {
                label: 'Redeem Amount',
                field: 'loyaltyPoint',
                sort: 'asc',
            },
            {
                label: 'Amount',
                field: 'totalAmount',
                sort: 'asc',
            },
            {
                label: 'Phone',
                field: 'phone',
                sort: 'asc',
            },

            {
                label: 'Status',
                field: 'status',
                sort: 'asc',
            },

            // Add more columns as needed
        ],
        rows: generateSerialNumbers(data),
    }

    return (
        <Fragment>
            <div>
                {/* collection table */}
                <SimpleCard title="Collection Details">
                    <div className="table-responsive">
                        <MDBDataTable
                            checkbox
                            data={tableData}
                            noBottomColumns={true}
                            hover
                            className="custom-table"
                        />
                    </div>
                </SimpleCard>

                {/* emplyoee */}
                <br />
                {/* expense table */}
                <SimpleCard>
                    <h4>Total Collection</h4>
                    <br />
                    <p>Total Cash Amount: {calculateTotalAmount()}</p>
                    <p>Total Voucher Amount: {calculateVoucherAmount()}</p>
                    <p>Total Redeem Points: {calculateRedeemPoints()}</p>
                </SimpleCard>
            </div>
        </Fragment>
    )
}

export default Collections
