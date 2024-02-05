import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import MaterialReactTable from 'material-react-table'
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Grid,
    styled,
    Radio,
    RadioGroup,
    FormControlLabel,
    CircularProgress,
} from '@mui/material'
import moment from 'moment'
import { Delete, Add } from '@mui/icons-material'
import useAuth from 'app/hooks/useAuth'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import Modal from '@mui/material/Modal'
import Swal from 'sweetalert2'
// import NewListing from './NewListing'
import { GrozpSnackbar, DatePickPicker } from 'app/components/'
import { url } from 'app/constants'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 10,
    p: 4,
}
const TextFields = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const AddListing = (props) => {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [tableData, setTableData] = useState([])
    const [updateVarient, setUpdateVarient] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [open, setOpen] = React.useState(false)
    const [listingId, setlistingId] = useState('')
    const [opensnack, setopensnack] = React.useState(false)
    const handleOpen = () => setOpen(true)

    const [inputFields, setInputFields] = useState({
        mfgDate: '',
        expDate: '',
        batchNo: '',
        sku: '',
        quantity: '',
        mrp: '',
        off: '',
        saleFlag: 'false',
    })
    useEffect(() => {
        async function fetchList() {
            url.get('v1/in/listings')
                .then((response) => {
                    if (response.data.status === true) {
                        const updatedData = response.data.data.map((store) => {
                            const subRows = store.supplies.map((supply) => {
                                const pricing = supply.pricings[0]
                                const mrp = pricing ? pricing.mrp : null
                                const off = pricing ? pricing.off : null
                                const saleFlag = pricing
                                    ? pricing.saleFlag
                                    : null
                                return { ...supply, mrp, off, saleFlag }
                            })
                            return { ...store, subRows }
                        })
                        setTableData(updatedData)
                    }
                    setIsLoading(false)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        fetchList()
    }, [updateVarient])

    const handleShowSnackbar = (msg, type) => {
        setopensnack(true)
        setMsg(msg)
        setSeverity(type)
    }
    const handleClose = () => {
        setInputFields({
            mfgDate: '',
            expDate: '',
            batchNo: '',
            sku: '',
            quantity: '',
            mrp: '',
            off: '',
            saleFlag: 'false',
        })
        setOpen(false)
    }
    const handleClosesnack = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setopensnack(false)
    }
    const handleVariantCreated = useCallback(() => {
        setUpdateVarient((prevState) => !prevState)
    }, [])
    const handleDeleteRow = useCallback(
        (row) => {
            if (
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'You want to delete this Product?!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        new Promise((resolve) => {
                            url.delete('v1/in/listings/' + row.getValue('id'))
                                .then((res) => {
                                    //send api delete request here, then refetch or update local table data for re-render
                                    tableData.splice(row.index, 1)
                                    setTableData([...tableData])
                                    resolve()
                                    if (res.data.status === true) {
                                        Swal.fire(
                                            'Deleted!',
                                            'Your file has been deleted.',
                                            'success'
                                        )
                                    }
                                })
                                .catch((error) => {
                                    // setErrorMessages(['Delete failed! Server error'])
                                    // setIserror(true)
                                    resolve()
                                })
                                .finally(() => {})
                        })
                    }
                })
            ) {
                return
            }
        },
        [tableData]
    )

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                enableColumnOrdering: false,
                enableEditing: false, //disable editing on this column
                enableSorting: false,
            },

            {
                accessorKey: 'storeCode',
                header: 'Store Code',
            },
            {
                accessorKey: 'productVariantId',
                header: 'Variant Id',
            },

            {
                accessorKey: 'isActive',
                header: 'Status',
                Cell: ({ cell }) => (
                    <Box component="span">
                        {cell.getValue()?.toLocaleString?.('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </Box>
                ),
            },
            {
                accessorKey: 'batchNo',
                header: 'Batch Code',
            },
            {
                accessorKey: 'mfgDate',
                header: 'Mfg Date',
            },
            {
                accessorKey: 'expDate',
                header: 'Exp Date',
            },
            {
                accessorKey: 'sku',
                header: 'Sku',
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
            },
            {
                accessorKey: 'mrp',
                header: 'Mrp',
            },

            {
                accessorKey: 'off',
                header: 'Off',
            },
            {
                accessorKey: 'saleFlag',
                header: 'SaleFlag',
                Cell: ({ cell }) => (
                    <Box component="span">
                        {cell.getValue()?.toLocaleString?.('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </Box>
                ),
            },
        ],
        []
    )
    const handleAddRow = (row) => {
        handleOpen()
        setUpdateVarient(false)
        setlistingId(row.original.id)
    }
    const handleChangedetails = (event, fieldName) => {
        setInputFields({
            ...inputFields,
            [fieldName]: event.target.value,
        })
    }
    const handleDateChange = (event, fieldName) => {
        const newDate = moment(new Date(event.target.value)).format(
            'YYYY-MM-DD'
        )
        setInputFields({
            ...inputFields,
            [fieldName]: newDate,
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let errorList = []
        if (inputFields.mfgDate === '') {
            errorList.push(' Select Manufacture Date')
        }
        if (inputFields.expDate === '') {
            errorList.push(' Select Expiry Date')
        }

        if (parseFloat(inputFields.mrp) <= parseFloat(inputFields.off)) {
            errorList.push(' Price Off not more then MRP ')
        }
        if (inputFields.saleFlag === '') {
            errorList.push(' Select Sale Flag')
        }
        if (errorList.length < 1) {
            setLoading(true)
            const dataToSend = {
                mfgDate: inputFields.mfgDate,
                expDate: inputFields.expDate,
                batchNo: inputFields.batchNo,
                sku: inputFields.sku,
                quantity: inputFields.quantity,
                mrp: inputFields.mrp,
                off: inputFields.off,
                saleFlag: String(inputFields.saleFlag),
                listingId: listingId,
                employeeId: user.id,
            }

            url.post('v1/in/listings-supplies', dataToSend)
                .then((response) => {
                    if (response.data.status === true) {
                        handleShowSnackbar(
                            'Add New Listing successfully',
                            'success'
                        )
                        setUpdateVarient(true)
                    }
                })
                .catch((error) => {
                    //Error
                    handleShowSnackbar(error, 'error')
                })
                .finally(() => {
                    setLoading(false)
                    setInputFields({
                        mfgDate: '',
                        expDate: '',
                        batchNo: '',
                        sku: '',
                        quantity: '',
                        mrp: '',
                        off: '',
                        saleFlag: '',
                    })
                    setlistingId('')
                    handleClose()
                })
        } else {
            handleShowSnackbar(errorList, 'error')
            setUpdateVarient(false)
        }
    }
    return (
        <>
            {/* <NewListing
                productId={props.productId}
                updateVarient={updateVarient}
                setUpdateVarient={setUpdateVarient}
                onVariantCreated={handleVariantCreated}
                finsh={props.finsh}
            />
            <br /> */}
            <GrozpSnackbar
                open={opensnack}
                handleClose={handleClosesnack}
                msg={msg}
                severity={severity}
            />
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Fragment>
                        <ValidatorForm
                            onSubmit={handleSubmit}
                            onError={() => null}
                        >
                            <h2>Add Supply</h2>
                            <Grid item xs={4}>
                                <h6 style={{ marginBottom: '8px' }}>
                                    Date Of Manufacture*
                                </h6>
                                <DatePickPicker
                                    setMinDate={false}
                                    value={inputFields.mfgDate}
                                    onChange={(date) =>
                                        handleDateChange(date, 'mfgDate')
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <h4 style={{ marginBottom: '8px' }}>
                                    Date Of Expiry*
                                </h4>
                                <DatePickPicker
                                    value={inputFields.expDate}
                                    setMinDate={true}
                                    onChange={(date) =>
                                        handleDateChange(date, 'expDate')
                                    }
                                />
                            </Grid>
                            <br />
                            <Grid item xs={4}>
                                <TextFields
                                    label="Sku(Ex:A-1)"
                                    onChange={(event) =>
                                        handleChangedetails(event, 'sku')
                                    }
                                    variant="outlined"
                                    type="text"
                                    name="batchNo"
                                    value={inputFields.sku}
                                    required
                                    id="fullWidth"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextFields
                                    label="Quantity(Ex:500)"
                                    onChange={(event) =>
                                        handleChangedetails(event, 'quantity')
                                    }
                                    type="number"
                                    name="quantity"
                                    value={
                                        inputFields.quantity <= 0
                                            ? ''
                                            : inputFields.quantity
                                    }
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextFields
                                    label="MRP(Ex:₹200)*"
                                    onChange={(event) =>
                                        handleChangedetails(event, 'mrp')
                                    }
                                    type="number"
                                    name="mrp"
                                    value={
                                        inputFields.mrp <= 0
                                            ? ''
                                            : inputFields.mrp
                                    }
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextFields
                                    label="Off(Ex:₹10)*"
                                    onChange={(event) =>
                                        handleChangedetails(event, 'off')
                                    }
                                    type="number"
                                    name="off"
                                    value={
                                        inputFields.off <= 0
                                            ? ''
                                            : inputFields.off
                                    }
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextFields
                                    label="Batch No(Ex:3456500)"
                                    onChange={(event) =>
                                        handleChangedetails(event, 'batchNo')
                                    }
                                    type="text"
                                    name="batchNo"
                                    value={inputFields.batchNo}
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <RadioGroup
                                    row
                                    name="saleFlag"
                                    value={inputFields.saleFlag || ''}
                                    onChange={(event) =>
                                        handleChangedetails(event, 'saleFlag')
                                    }
                                >
                                    <p style={{ marginRight: '1rem' }}>
                                        Sale Flag{' '}
                                    </p>

                                    <FormControlLabel
                                        value="true"
                                        label="True"
                                        labelPlacement="end"
                                        control={<Radio color="primary" />}
                                    />
                                    <FormControlLabel
                                        value="false"
                                        label="False"
                                        labelPlacement="end"
                                        control={<Radio color="error" />}
                                    />
                                </RadioGroup>
                            </Grid>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={handleClose}
                                >
                                    close
                                </Button>
                                <span style={{ margin: '0 8px' }}></span>
                                <Button
                                    color="success"
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading && (
                                        <StyledProgress
                                            size={24}
                                            className="buttonProgress"
                                        />
                                    )}
                                    Add
                                </Button>
                            </div>
                        </ValidatorForm>
                    </Fragment>
                </Box>
            </Modal>
            <MaterialReactTable
                state={{ isLoading }}
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            align: 'center',
                        },
                        size: 120,
                    },
                }}
                columns={columns}
                data={tableData}
                enableEditing
                enableExpanding
                subRowsKey="supplies"
                renderRowActions={({ row, table }) => {
                    // Check if row is a top-level row
                    if (row.depth >= 1) {
                        return null // Don't render delete button
                    }

                    return (
                        <Box sx={{ display: 'flex', marginLeft: '1rem' }}>
                            <Tooltip arrow placement="left" title="Add">
                                <IconButton onClick={() => handleAddRow(row)}>
                                    <Add style={{ color: 'green' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Delete">
                                <IconButton
                                    color="error"
                                    onClick={() => handleDeleteRow(row)}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )
                }}
                renderTopToolbarCustomActions={() => (
                    <Button color="success" variant="contained">
                        Listing List
                    </Button>
                )}
            />
        </>
    )
}

export default AddListing
