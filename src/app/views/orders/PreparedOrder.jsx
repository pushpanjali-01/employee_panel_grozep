import React, { useState, useEffect } from 'react'
import { SimpleCard, Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import '../dashboard/graph/dashboard.css'
import { MDBDataTable } from 'mdbreact'
import { formatDateTimeNew } from '../../dateUtils'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'

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
    const [empdata, setempdat] = useState([])
    useEffect(() => {
        try {
            url.get(
                `v1/in/tasks/pending?storecode=${user.storeCode}&task=prepared&status=completed`
            )
                .then((res) => {
                    if (res.data.status === true) {
                        setData(res.data.data)
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
                const quantity = orderItem.quantity - orderItem.removedQty
                return sum + price * quantity
            }, 0)
            let lastTaskName = ''
            if (item.task_records.length > 0) {
                const lastTask = item.task_records[item.task_records.length - 1]
                if (lastTask.status === 'completed') {
                    switch (lastTask.taskName) {
                        case 'confirmed':
                            lastTaskName = 'Queue'
                            break
                        case 'prepared':
                            lastTaskName = 'Order Prepared'
                            break
                        case 'packed':
                            lastTaskName = 'Order Packed'
                            break
                        case 'delivered':
                            lastTaskName = 'Delivered'
                            break
                        case 'collected': // If last task is "collected", consider it as "Delivered"
                            lastTaskName = 'Delivered'
                            break
                        default:
                            lastTaskName = ''
                            break
                    }
                } else if (
                    lastTask.status === 'progress' ||
                    lastTask.status === 'pending'
                ) {
                    if (lastTask.taskName === 'delivered') {
                        lastTaskName = 'Out for Delivery'
                    } else {
                        lastTaskName = `${lastTask.taskName} (Progress)`
                    }
                } else if (lastTask.status === 'cancelled') {
                    lastTaskName = 'cancelled'
                }
            }
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
                statuss: lastTaskName,
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
                field: 'statuss',
                sort: 'asc',
                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
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
                    <Breadcrumb routeSegments={[{ name: 'Prepared Orders' }]} />
                </div>
                <p>({data.length} Orders)</p>
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
