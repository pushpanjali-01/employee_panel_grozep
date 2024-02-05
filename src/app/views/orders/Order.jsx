import React, { useState, useEffect } from 'react'
import { SimpleCard, Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import { formatDateTimeNew } from '../../dateUtils'
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

const PreparedOrder = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])
    useEffect(() => {
        try {
            url.get(
                `v1/in/tasks/pending?storecode=${user.storeCode}&task=confirmed&status=completed`
            )
                .then((res) => {
                    if (res.data.status === true) {
                        setData(res.data.data)
                    } else {
                        setData([])
                    }
                })
                .catch(() => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const deliveryAddress = item.delivery_addresses[0] // Assuming there's only one address in the array
            const address = deliveryAddress
                ? deliveryAddress.location.address
                : ''
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
                orderDateTime: formatDateTimeNew(item.createdAt),
                address: address,
                totalAmount: finalAmount.toFixed(2),
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
                label: 'Order Channel',
                field: 'orderChannel',
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
                label: 'Address',
                field: 'address',
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
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Order Queue' }]} />
                </div>
                <p>({data.length} Order)</p>
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
        </Container>
    )
}

export default PreparedOrder
