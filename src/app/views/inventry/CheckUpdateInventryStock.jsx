import React, { useEffect, useState } from 'react'
import { MDBDataTable } from 'mdbreact'
import useAuth from 'app/hooks/useAuth'
import {
    DatePickPicker,
    GrozpSnackbar,
    SimpleCard,
    Breadcrumb,
} from 'app/components'
import { styled, CircularProgress, Grid, Button, Icon } from '@mui/material'
import { Span } from 'app/components/Typography'
import { url } from 'app/constants'
import { ValidatorForm } from 'react-material-ui-form-validator'
import moment from 'moment'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
const customStyles = {
    pagination: {
        textAlign: 'right',
    },
}
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const CheckUpdateInventryStock = () => {
    const { user } = useAuth()
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState([])
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    useEffect(() => {
        url.get('v1/in/dealers')
            .then((response) => {
                if (response.data.status === true) {
                    setOptions(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }, [])
    // Trigger the effect when the store code or page number changes
    // const getEmployeeEmailById = (did) => {
    //     const employee = options.find((employee) => employee.id === did)
    //     return employee ? employee.name : ''
    // }

    // Convert tableData to the format expected by MDBDataTable
    const tableRows = tableData.map((item, index) => {
        return {
            sno: index + 1,
            date: moment(new Date(item.createdAt)).format('YYYY-MM-DD'),
            id: item.dealer_allotment_item.product_variant?.id || '',
            brand:
                item.dealer_allotment_item.product_variant?.product?.brand ||
                '',
            name:
                item.dealer_allotment_item.product_variant?.product?.name || '',
            size: `${
                item.dealer_allotment_item.product_variant?.product_size
                    ?.value || ''
            } ${
                item.dealer_allotment_item.product_variant?.product_size
                    ?.unit || ''
            }`,
            mrp: item ? item.retailPrice : '',
            rate: item ? item.sellingPrice : '',
            costPrice: item ? item.costPrice : '',
            storePrice: item ? item.tradePrice : '',
            category:
                item.dealer_allotment_item.product_variant?.product?.category ||
                '',
            subcategory:
                item.dealer_allotment_item.product_variant?.product
                    ?.subcategory || '',
            stock: item.quantity,
            createdBy: item ? item.createdBy : '',
            mfgDate: item ? item.mfgDate : '',
            expDate: item ? item.expDate : '',
            dealerId:
                item.dealer_allotment_item.dealer_allotment.dealer?.name || '',
        }
    })
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
    const data = {
        columns: [
            {
                label: 'sno',
                field: 'sno',
                sort: 'asc',
            },
            {
                label: 'Vid',
                field: 'id',
                sort: 'asc',
            },
            {
                label: 'Date',
                field: 'date',
                sort: 'asc',
            },
            {
                label: 'Brand',
                field: 'brand',
            },
            {
                label: 'Name',
                field: 'name',
            },
            {
                label: 'Size',
                field: 'size',
            },
            {
                label: 'MRP',
                field: 'mrp',
            },
            {
                label: 'Rate',
                field: 'rate',
            },
            {
                label: 'Store Price',
                field: 'storePrice',
            },
            {
                label: 'Cost Price',
                field: 'costPrice',
            },

            {
                label: 'Update Qty',
                field: 'stock',
            },
            {
                label: 'Updated By',
                field: 'createdBy',
            },
            {
                label: 'Category',
                field: 'category',
            },
            {
                label: 'Subcategory',
                field: 'subcategory',
            },
            {
                label: 'Mfg Date',
                field: 'mfgDate',
            },
            {
                label: 'Exp Date',
                field: 'expDate',
            },
            {
                label: 'Dealer ',
                field: 'dealerId',
            },
        ],
        rows: tableRows,
    }

    const handleSubmit = async (event) => {
        if (startDate === null || startDate === '') {
            handleShowSnackbar('Select Date First', 'error')
        }
        if (endDate === '' || endDate === null) {
            handleShowSnackbar('Select Date First', 'error')
        } else {
            // setLoading(true)
            try {
                const headers = {
                    inventorycode: user.storeCode, // Replace with your actual inventory code
                }
                await url
                    .get(
                        `v1/in/dealers-stocks?startDate=${startDate}&endDate=${endDate}`,
                        {
                            headers: headers,
                        }
                    )
                    .then((res) => {
                        if (res.data.status === true) {
                            if (res.data.data.length <= 0) {
                                handleShowSnackbar('No record found!', 'error')
                                setIsLoading(false)
                                setTableData([])
                            } else {
                                setTableData(res.data.data)
                                setIsLoading(false)
                            }
                        } else {
                            handleShowSnackbar('No record found!', 'error')
                            setTableData([])
                            setIsLoading(false)
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
    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />

            <SimpleCard>
                <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
                    <div className="breadcrumb">
                        <Breadcrumb
                            routeSegments={[
                                { name: 'Check Inventry Stock Update' },
                            ]}
                        />
                    </div>
                    <Grid container spacing={6}>
                        <Grid item lg={4} md={4} sm={12} xs={12} sx={{ mt: 2 }}>
                            <h6 style={{ marginBottom: '8px' }}>Start Date</h6>

                            <DatePickPicker
                                value={startDate}
                                setMinDate={false}
                                onChange={(newDate) =>
                                    handleDateChange(newDate, 'start')
                                }
                                setMaxDate={true}
                            />
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12} sx={{ mt: 2 }}>
                            <h6 style={{ marginBottom: '8px' }}>End Date</h6>
                            <DatePickPicker
                                setMinDate={false}
                                value={endDate}
                                setMaxDate={true}
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
                        disabled={isLoading}
                    >
                        <Icon>send</Icon>
                        <Span sx={{ pl: 1, textTransform: 'capitalize' }}>
                            {isLoading && (
                                <StyledProgress
                                    size={24}
                                    className="buttonProgress"
                                />
                            )}
                            Submit
                        </Span>
                    </Button>
                </ValidatorForm>
            </SimpleCard>
            <br />
            <SimpleCard>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '250px' }}>
                        <CircularProgress />{' '}
                        {/* Show a circular loading spinner */}
                    </div>
                ) : (
                    <MDBDataTable
                        responsive
                        striped
                        bordered
                        data={data}
                        noBottomColumns={true}
                        hover
                        pagination={false}
                        entries={10} // Show
                        sortable={true}
                        info={false}
                        style={customStyles}
                    />
                )}
            </SimpleCard>
        </Container>
    )
}

export default CheckUpdateInventryStock
