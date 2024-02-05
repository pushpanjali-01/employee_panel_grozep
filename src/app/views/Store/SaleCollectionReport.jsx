import { Button, Icon, Grid, CircularProgress } from '@mui/material'
import { Span } from 'app/components/Typography'
import React, { useState, useEffect } from 'react'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { Breadcrumb, SimpleCard } from 'app/components'
import { CloudDownload } from '@mui/icons-material'
import { IconButton, Box } from '@mui/material'
import { styled } from '@mui/system'
import { MDBDataTable } from 'mdbreact'
import '../dashboard/graph/dashboard.css'
import * as XLSX from 'xlsx'
import { GrozpSnackbar, DatePickPicker, StoreList } from 'app/components/'
import moment from 'moment'
import useAuth from 'app/hooks/useAuth'
import { url } from 'app/constants'

const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
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

const SaleReport = () => {
    const [empdata, setempdat] = useState([])
    const [msg, setMsg] = React.useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const { user } = useAuth()
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [StoreValue, setStoreValue] = useState(null)
    const [orderData, setorderData] = useState([])
    useEffect(() => {
        try {
            const storeCode = StoreValue ? StoreValue.code : user.storeCode

            url.get(`v1/in/${storeCode}/employees`)
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
    }, [StoreValue, user.storeCode])

    const handleStoreChange = (event, newValue) => {
        setStoreValue(newValue)
    }
    const handleSubmit = (event) => {
        if (startDate == null || startDate == '') {
            handleShowSnackbar('Select Date First', 'error')
        }
        if (endDate == '' || endDate == null) {
            handleShowSnackbar('Select Date First', 'error')
        } else {
            setLoading(true)

            try {
                const dataToSend = {
                    start: startDate,
                    end: endDate,
                    storecode: StoreValue ? StoreValue.code : user.storeCode,
                    // status: 'completed',
                }

                url.get('v1/stores/collections', { params: dataToSend })
                    .then((res) => {
                        if (res.data.status == true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('Data not found!', 'error')
                                setLoading(false)
                                setData([])
                            } else {
                                setData(res.data.data)
                                setorderData(res.data.data.orders)
                                setLoading(false)
                            }
                        } else {
                            handleShowSnackbar('Data not found!', 'error')
                            setData([])
                            setLoading(false)
                        }
                    })
                    .catch((error) => {
                        console.log('Error')
                    })
            } catch {
                console.log('Error')
            }
        }
    }

    const exportToExcel = () => {
        const demo = generateSerialNumbers(orderData)
        const exportData = demo.map((row) => ({
            orderid: row.invoiceId,
            date: row.orderDateTime,
            collection_date: row.collectedDateTime,
            promoDiscount: row.promoDiscount,
            loyaltyPoint: row.loyaltyPoints,
            Amount: row.totalAmount,
            Phone: row.phone,
            Packager: row.Packager,
            scanner: row.scanner,
            shipper: row.shipper,
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Delivered Order Data'
        )

        // Create a blob object from the workbook to create the Excel file
        const excelFile = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })
        const file = new Blob([excelFile], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        // Create a download link and trigger the click event to download the file
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = `StoreStock(${user.storeCode}).xlsx`
        a.click()
    }
    const generateSerialNumbers = (orderData) => {
        return orderData.map((item, index) => {
            const employeeEmail =
                item.taskStatus.find((task) => task.taskName === 'prepared')
                    ?.employeeId || ''
            const scannerEmail =
                item.taskStatus.find((task) => task.taskName === 'packed')
                    ?.employeeId || ''
            const shipperEmail =
                item.taskStatus.find((task) => task.taskName === 'delivered')
                    ?.employeeId || ''
            const grandTotal = item.billingInfo.grandTotal
            const loyaltyPoints = item.billingInfo.loyaltyPoints
            const promoDiscount = item.billingInfo.promoDiscount
            let lastTaskName = 'Delivered'

            return {
                ...item,
                sno: index + 1,
                statuss: lastTaskName,
                orderDateTime: item.orderDateTime,
                totalAmount: grandTotal,
                loyaltyPoints: loyaltyPoints,
                promoDiscount: promoDiscount,
                Packager: employeeEmail,
                scanner: scannerEmail,
                shipper: shipperEmail,
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
                label: ' Collection Date & Time',
                field: 'collectedDateTime',
                sort: 'asc',
            },
            {
                label: 'OrderNumber',
                field: 'invoiceId',
                sort: 'asc',
            },
            {
                label: 'Coupon Amount',
                field: 'promoDiscount',
                sort: 'asc',
            },
            {
                label: 'Redeem Amount',
                field: 'loyaltyPoints',
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
                label: 'Packager',
                field: 'Packager',
                sort: 'asc',
            },
            {
                label: 'scanner',
                field: 'scanner',
                sort: 'asc',
            },
            {
                label: 'shipper',
                field: 'shipper',
                sort: 'asc',
            },
            // Add more columns as needed
        ],
        rows: generateSerialNumbers(orderData),
    }

    const handleDateChange = (event, dateType) => {
        const newDate = moment(new Date(event.target.value)).format(
            'YYYY-MM-DD'
        )
        if (dateType === 'start') {
            setStartDate(newDate)
        } else if (dateType === 'end') {
            setEndDate(newDate)
        }
    }
    // Start Alert  fun //
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

    // close Alert fun //
    return (
        <Container>
            <SimpleCard>
                <div className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: 'Sale Report' }]} />
                </div>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                        onClick={exportToExcel}
                        color="primary"
                        aria-label="Export Excel"
                    >
                        <CloudDownload />
                    </IconButton>
                </Box>
                <GrozpSnackbar
                    open={open}
                    handleClose={handleClose}
                    msg={msg}
                    severity={severity}
                />
                <div>
                    <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                        {user.id == 2 ? (
                            <Grid item lg={8} md={8} sm={12} xs={12}>
                                <StoreList
                                    value={StoreValue}
                                    onChange={handleStoreChange}
                                />
                            </Grid>
                        ) : null}

                        <Grid container spacing={6}>
                            <Grid
                                item
                                lg={4}
                                md={4}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <h6 style={{ marginBottom: '8px' }}>
                                    Start Date
                                </h6>

                                <DatePickPicker
                                    setMinDate={false}
                                    setMaxDate={true}
                                    value={startDate}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'start')
                                    }
                                />
                            </Grid>
                            <Grid
                                item
                                lg={4}
                                md={4}
                                sm={12}
                                xs={12}
                                sx={{ mt: 2 }}
                            >
                                <h6 style={{ marginBottom: '8px' }}>
                                    End Date
                                </h6>
                                <DatePickPicker
                                    setMinDate={false}
                                    setMaxDate={true}
                                    value={endDate}
                                    onChange={(newDate) =>
                                        handleDateChange(newDate, 'end')
                                    }
                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={loading}
                        >
                            <Icon>send</Icon>
                            <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                                {loading && (
                                    <StyledProgress
                                        size={24}
                                        className="buttonProgress"
                                    />
                                )}
                                Submit
                            </Span>
                        </Button>
                    </ValidatorForm>
                </div>
            </SimpleCard>
            <br />
            {orderData.length > 0 ? (
                <>
                    <SimpleCard title="Sale Details">
                        <Grid>
                            <h6>
                                Grand Total:{data.grandTotalAmount.toFixed(2)}
                            </h6>
                            <h6>
                                Total Cash Amount:{' '}
                                {data.amountInCash.toFixed(2)}{' '}
                            </h6>
                            <h6>
                                Total Offer Amount:{' '}
                                {data.amountInCoupons.toFixed(2)}{' '}
                            </h6>
                            <h6>
                                Total Redeem Point:{' '}
                                {data.amountInPoints.toFixed(2)}
                            </h6>
                        </Grid>
                    </SimpleCard>

                    <br />
                    <SimpleCard title={`Order Details (${orderData.length})`}>
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
                </>
            ) : null}
        </Container>
    )
}

export default SaleReport
