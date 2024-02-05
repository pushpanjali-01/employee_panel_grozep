// import { SimpleCard } from 'app/components'
// import { Button, Grid, Icon, styled, Box } from '@mui/material'
// import { Span } from 'app/components/Typography'
// import { useState } from 'react'
// import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
// import { LogoWithTitle } from 'app/components'
// import { GrozpSnackbar, DatePickPicker } from 'app/components/'
// import moment from 'moment'
// const Container = styled('div')(({ theme }) => ({
//     margin: '30px',
//     [theme.breakpoints.down('sm')]: { margin: '16px' },
//     '& .breadcrumb': {
//         marginBottom: '30px',
//         [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
//     },
// }))
// const TextField = styled(TextValidator)(() => ({
//     width: '100%',
//     marginBottom: '16px',
// }))

// function AddFreeItem(props) {
//     const [state, setState] = useState('')
//     const [open, setOpen] = useState(false)
//     const [msg, setMsg] = useState('')
//     const [severity, setSeverity] = useState('success')
//     const {
//         price,
//         quantity,
//         minAmount,
//         maxLimit,
//         maxAmount,
//         productVariantId,
//     } = state
//     const [startDate, setStartDate] = useState(null)
//     const [endDate, setEndDate] = useState(null)
//     const handleDateChange = (event, dateType) => {
//         const newDate = moment(new Date(event.target.value)).format(
//             'YYYY-MM-DD'
//         )
//         if (dateType === 'start') {
//             setStartDate(newDate)
//         } else if (dateType === 'end') {
//             setEndDate(newDate)
//         }
//     }
//     // Snack Bar
//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return
//         }
//         setOpen(false)
//     }

//     const handleSubmit = (event) => {
//         event.preventDefault()
//         const dataToSend = {
//             price: price,
//             quantity: quantity,
//             minAmount: minAmount,
//             maxAmount: maxAmount,
//             startDate: startDate,
//             endDate: endDate,
//             productVariantId: productVariantId,
//             maxLimit: 20,
//         }

//         // url.post('v1/in/goodies', dataToSend)
//         //     .then((response) => {
//         //         if (response.data.status === true) {
//         //             handleShowSnackbar('Add New Offer Product', 'success')
//         //         }
//         //     })
//         //     .catch((error) => {
//         //         //Error
//         //         handleShowSnackbar(error, 'error')
//         //     })
//         //     .finally(() => {
//         //         setState('')
//         //         setStartDate('')
//         //         setEndDate('')
//         //     })
//     }

//     const handleChange = (event) => {
//         event.persist()
//         setState({
//             ...state,
//             [event.target.name]: event.target.value,
//         })
//     }

//     return (
//         <Container>
//             <LogoWithTitle
//                 src="/assets/Orders/coupon.png"
//                 title="Offer Item "
//             />
//             <GrozpSnackbar
//                 open={open}
//                 handleClose={handleClose}
//                 msg={msg}
//                 severity={severity}
//             />
//             <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
//                 <SimpleCard title="Offer Item ">
//                     <Box overflow="auto">
//                         <Grid container spacing={6}>
//                             <Grid
//                                 item
//                                 lg={6}
//                                 md={6}
//                                 sm={12}
//                                 xs={12}
//                                 sx={{ mt: 2 }}
//                             >
//                                 <TextField
//                                     type="number"
//                                     name="productVariantId"
//                                     id="standard-basic"
//                                     value={productVariantId || ''}
//                                     onChange={handleChange}
//                                     errorMessages={['this field is required']}
//                                     label="Product ID(Ex:123)"
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />
//                                 <TextField
//                                     type="number"
//                                     name="price"
//                                     id="standard-basic"
//                                     value={price || ''}
//                                     onChange={handleChange}
//                                     errorMessages={['this field is required']}
//                                     label="Price(Ex:123)"
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />
//                                 <TextField
//                                     type="number"
//                                     name="quantity"
//                                     id="standard-basic"
//                                     value={quantity || ''}
//                                     onChange={handleChange}
//                                     errorMessages={['this field is required']}
//                                     label="Quantity (Ex:10)"
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />

//                                 <TextField
//                                     type="number"
//                                     name="minAmount"
//                                     id="standard-basic"
//                                     value={minAmount || ''}
//                                     onChange={handleChange}
//                                     errorMessages={['this field is required']}
//                                     label=" Minimum Purchase Amount (Ex:200)"
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />
//                                 <TextField
//                                     type="number"
//                                     name="maxAmount"
//                                     id="standard-basic"
//                                     value={maxAmount || ''}
//                                     onChange={handleChange}
//                                     errorMessages={['this field is required']}
//                                     label="Maximum PurchaseAmount (Ex:2000)"
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />
//                             </Grid>

//                             <Grid
//                                 item
//                                 lg={6}
//                                 md={6}
//                                 sm={12}
//                                 xs={12}
//                                 sx={{ mt: 2 }}
//                             >
//                                 <TextField
//                                     type="number"
//                                     name="maxLimit"
//                                     id="standard-basic"
//                                     value={maxLimit || ''}
//                                     onChange={handleChange}
//                                     label="Max limit For User (Ex:10)"
//                                     errorMessages={['this field is required']}
//                                     validators={[
//                                         'required',
//                                         'minStringLength: 1',
//                                     ]}
//                                     inputProps={{ min: '0' }}
//                                 />
//                                 <h4 style={{ magrinTop: '8px' }}>Start Date</h4>
//                                 <DatePickPicker
//                                     value={startDate}
//                                     onChange={(newDate) =>
//                                         handleDateChange(newDate, 'start')
//                                     }
//                                 />

//                                 <h4 style={{ magrinTop: '8px' }}>End Date</h4>
//                                 <DatePickPicker
//                                     value={endDate}
//                                     onChange={(newDate) =>
//                                         handleDateChange(newDate, 'end')
//                                     }
//                                 />
//                             </Grid>
//                         </Grid>
//                     </Box>
//                 </SimpleCard>
//                 <br />
//                 <Button color="primary" variant="contained" type="submit">
//                     <Icon>send</Icon>
//                     <Span
//                         sx={{
//                             pl: 1,
//                             textTransform: 'capitalize',
//                         }}
//                     >
//                         Submit
//                     </Span>
//                 </Button>
//                 <br />
//             </ValidatorForm>
//         </Container>
//     )
// }

// export default AddFreeItem
