import React, { useState, useEffect } from 'react'
import { SimpleCard, Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import moment from 'moment'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
import '../dashboard/graph/dashboard.css'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
}))

const PackedProcessing = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])
    const [empdata, setempdat] = useState([])
    useEffect(() => {
        try {
            url.get(
                `v1/in/tasks/pending?storecode=${user.storeCode}&task=packed&status=progress`
            )
                .then((res) => {
                    if (res.data.status === true) {
                        setData(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
        try {
            url.get(`v1/in/${user.storeCode}/employees`)
                .then((res) => {
                    if (res.data.status === true) {
                        setempdat(res.data.data)
                    }
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }, [])

    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.email : ''
    }

    const generateSerialNumbers = (data) => {
        return data.map((item, index) => {
            const deliveryAddress = item.delivery_addresses[0] // Assuming there's only one address in the array
            const address = deliveryAddress
                ? deliveryAddress.location.address
                : ''

            const employeeId =
                item.task_records.find((task) => task.taskName === 'prepared')
                    ?.employeeId || ''
            const employeeEmail = getEmployeeEmailById(employeeId)

            const totalAmount = item.order_items.reduce((sum, orderItem) => {
                const price =
                    parseFloat(orderItem.mrp) - parseFloat(orderItem.off)
                const quantity = orderItem.quantity
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
                orderDateTime: moment(item.createdAt).format('LLL'),
                address: address,
                totalAmount: finalAmount.toFixed(2),
                Packager: employeeEmail,
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
                label: 'Address',
                field: 'address',
                sort: 'asc',
            },
            {
                label: 'Status',
                field: 'status',
                sort: 'asc',
            },
            {
                label: 'Packager',
                field: 'Packager',
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
                    <Breadcrumb
                        routeSegments={[{ name: 'Packed Processing' }]}
                    />
                </div>
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

export default PackedProcessing
