import React, { useState, useEffect } from 'react'
import { SimpleCard, Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import { formatDateTimeNew } from '../../dateUtils'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'
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
const AllOrder = () => {
    const { user } = useAuth()
    const [data, setData] = useState([])
    const [empdata, setempdat] = useState([])
    useEffect(() => {
        try {
            const dataToSend = {
                storeCode: user.storeCode,
                status: 'pending',
            }
            url.post(`v1/in/orders/all`, dataToSend)
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
        try {
            url.get(`v1/in/${user.storeCode}/employees`)
                .then((res) => {
                    if (res.data.status === true) {
                        setempdat(res.data.data)
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
            // console.log(item)
            const address = item.delivery_addresses[0].location.address
                ? item.delivery_addresses[0].location.address
                : ''
            const employeeId =
                item.task_records.find((task) => task.taskName === 'prepared')
                    ?.employeeId || ''
            const employeesId =
                item.task_records.find((task) => task.taskName === 'packed')
                    ?.employeeId || ''
            const employeessId =
                item.task_records.find((task) => task.taskName === 'delivered')
                    ?.employeeId || ''
            const employeeEmail = getEmployeeEmailById(employeeId)
            const scannerEmail = getEmployeeEmailById(employeesId)
            const shipperEmail = getEmployeeEmailById(employeessId)
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

            return {
                ...item,
                sno: index + 1,
                address: address,
                statuss: lastTaskName,
                orderDateTime: formatDateTimeNew(item.createdAt),
                totalAmount: finalAmount.toFixed(2),
                Packager: employeeEmail,
                scanner: scannerEmail,
                shipper: shipperEmail,
            }
        })
    }

    const getEmployeeEmailById = (employeeId) => {
        const employee = empdata.find((employee) => employee.id === employeeId)
        return employee ? employee.email : ''
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
            },
            {
                label: 'OrderNumber',
                field: 'id',
                sort: 'asc',
            },
            {
                label: 'Payment Mode',
                field: 'paymentMode',
            },
            {
                label: 'Coupon Amount',
                field: 'promoDiscount',
            },
            {
                label: 'Redeem Amount',
                field: 'loyaltyPoint',
            },
            {
                label: 'Amount',
                field: 'totalAmount',
            },
            {
                label: 'Phone',
                field: 'phone',
            },
            {
                label: 'Address',
                field: 'address',
            },
            {
                label: 'Status',
                field: 'statuss',
                sort: 'asc',
                filter: true,
                filterValue: (value, item) => {
                    return item.statuss.props.children === value
                },
            },

            {
                label: 'Packager',
                field: 'Packager',

                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
                sort: 'asc',
            },
            {
                label: 'Scanner',
                field: 'scanner',

                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
                sort: 'asc',
            },
            {
                label: 'Shipper',
                field: 'shipper',
                sort: 'asc',
                style: {
                    backgroundColor: 'yellow', // Change the background color based on the status
                },
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
                        routeSegments={[{ name: 'All Pending Orders' }]}
                    />
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

export default AllOrder
