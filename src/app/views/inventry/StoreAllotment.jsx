// import React, { useState, useEffect } from 'react'
// import { makeStyles } from '@mui/styles'
// import {
//     Button,
//     Icon,
//     Grid,
//     Autocomplete,
//     CircularProgress,
//     IconButton,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
// } from '@mui/material'
// import useAuth from 'app/hooks/useAuth'
// import { Span } from 'app/components/Typography'
// import { styled } from '@mui/system'
// import { url } from 'app/constants'
// import { SimpleCard } from 'app/components'
// import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
// import RemoveIcon from '@mui/icons-material/Remove'
// import AddIcon from '@mui/icons-material/Add'
// import { GrozpSnackbar, StoreList } from 'app/components/'
// import { debounce } from 'lodash'

// const Container = styled('div')(({ theme }) => ({
//     margin: '30px',
//     [theme.breakpoints.down('sm')]: {
//         margin: '16px',
//     },
//     '& .breadcrumb': {
//         marginBottom: '30px',
//         [theme.breakpoints.down('sm')]: {
//             marginBottom: '16px',
//         },
//     },
// }))

// const useStyles = makeStyles({
//     tableContainer: {
//         border: '1px solid #ddd',
//         borderRadius: '4px',
//         overflow: 'hidden',
//     },
//     table: {
//         width: '100%',
//         borderCollapse: 'collapse',
//     },
//     tableHeader: {
//         backgroundColor: '#f0faf2',
//     },
//     tableCell: {
//         padding: '8px',
//         borderBottom: '1px solid #ddd',
//         textAlign: 'center',
//     },
//     tableCellBold: {
//         fontWeight: 'bold',
//     },
// })

// const TextField = styled(TextValidator)(() => ({
//     width: '100%',
//     marginBottom: '16px',
// }))

// const QuantityControl = styled('div')({
//     display: 'flex',
//     alignItems: 'center',
// })

// const QuantityButton = styled(IconButton)(({ theme }) => ({
//     padding: 0,
//     width: '30px',
//     height: '30px',
// }))

// const QuantityDisplay = styled(Span)({
//     margin: '0 10px',
//     display: 'inline-block',
//     minWidth: '30px', // Add this line to set the minimum width
// })

// const DealerAllotment = () => {
//     const { user } = useAuth()
//     // Initialize cart state with data from local storage
//     const initialCart = localStorage.getItem('cart')
//     const [cart, setCart] = useState(initialCart ? JSON.parse(initialCart) : [])
//     const [searchTerm, setSearchTerm] = useState('')
//     const [searchResults, setSearchResults] = useState([])
//     const [selectedProduct, setSelectedProduct] = useState(null)
//     const [quantity, setQuantity] = useState(1)
//     const [loading, setLoading] = useState(false)
//     const [products, setProducts] = useState([''])
//     const [open, setOpen] = useState(false)
//     const [msg, setMsg] = useState('')
//     const [severity, setSeverity] = useState('success')
//     const [StoreValue, setStoreValue] = useState(null)
//     useEffect(() => {
//         try {
//             url.get('v1/in/inventory')
//                 .then((res) => {
//                     setProducts(res.data.data)
//                 })
//                 .catch((error) => {
//                     console.log('Error')
//                 })
//         } catch {
//             console.log('Error')
//         }
//         localStorage.setItem('cart', JSON.stringify(cart))
//     }, [cart])
//     const handleStoreChange = (event, newValue) => {
//         setStoreValue(newValue)
//     }
//     const generateBillPDF = async (orderData) => {
//         if (orderData) {
//             const printWindow = window.open('', '_blank')
//             if (printWindow) {
//                 const items = orderData.cart
//                 const Storename = orderData.StoreValue
//                 printWindow.document.write(`
//               <html>
//                 <head>
//                   <title>Print Invoice</title>
//                   <style>
//                     /* Add your custom styles for the printable invoice here */
//                     /* For example: */
//                     .invoice-details {
//                       /* styles for the invoice details section */
//                     }

//                     .invoice-details__table {
//                       border-collapse: collapse;
//                       width: 100%;
//                     }

//                     .invoice-details__table th,
//                     .invoice-details__table td {
//                       border: 1px solid black;
//                       padding: 8px;
//                       text-align: left;
//                     }

//                     .invoice-details__table th {
//                       background-color: #f2f2f2;
//                     }
//                   </style>
//                 </head>
//                 <body>
//                   <div class="invoice-details">
//                     <h2 class="invoice-details__title">Allotmnet Details</h2>
//                     <div class="invoice-details__section">
//                       <strong class="invoice-details__label">Store ID:</strong>
//                       <span class="invoice-details__value">${
//                           Storename.code
//                       }</span>
//                     </div>

//                     <div class="invoice-details__section">
//                       <strong class="invoice-details__label">Address:</strong>
//                       <span class="invoice-details__value">${
//                           Storename.location.locality +
//                           '' +
//                           Storename.location.nearby +
//                           '' +
//                           Storename.location.district +
//                           '' +
//                           Storename.location.pinCode
//                       }</span>
//                     </div>

//                     <table class="invoice-details__table">
//                       <thead>
//                         <tr>
//                           <th>Sno</th>
//                           <th>Item Name</th>
//                           <th>Quantity</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         ${items
//                             .map(
//                                 (item, index) => `
//                               <tr>
//                                 <td>${index + 1}</td>
//                                 <td>${item.name}</td>

//                                 <td>${item.quantity}</td>

//                               </tr>
//                             `
//                             )
//                             .join('')}
//                       </tbody>
//                     </table>
//                     <div class="invoice-details__separator" />
//                     &nbsp;
//                     &nbsp;

//                     <script>
//                       window.onafterprint = function () {
//                         window.close();
//                       };
//                     </script>
//                   </div>
//                 </body>
//               </html>
//             `)
//                 printWindow.document.close()
//             } else {
//                 console.error('Failed to open the print window.')
//             }
//         } else {
//             handleShowSnackbar('Order Id Not found !', 'error')
//         }
//     }

//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return
//         }
//         setOpen(false)
//     }

//     const handleShowSnackbar = (msg, type) => {
//         setOpen(true)
//         setMsg(msg)
//         setSeverity(type)
//     }

//     const placeorder = () => {
//         // Extract the product IDs and quantities from the cart
//         if (cart.length == 0) {
//             handleShowSnackbar('Add Product In bag!', 'error')
//         } else if (!StoreValue) {
//             handleShowSnackbar('Select Store!', 'error')
//         } else {
//             const orderItems = cart.map((item) => ({
//                 productVariantId: item.id,
//                 quantity: item.quantity,
//             }))

//             // Prepare the data to send to the server
//             const orderData = {
//                 storecode: StoreValue.id,
//                 items: orderItems,
//                 employeeId: user.id,
//             }
//             console.log(orderData)
//             // url.post('v1/in/allotments', orderData)
//             //     .then((response) => {
//             //         if (response.data.status == true) {
//             //             generateBillPDF({ StoreValue, cart })
//             //             handleShowSnackbar(
//             //                 'Place Order successfully !',
//             //                 'success'
//             //             )
//             //             setCart([])
//             //             setStoreValue(null)
//             //             localStorage.removeItem('cart')
//             //         } else {
//             //             handleShowSnackbar('Allotment Not Place !', 'error')
//             //         }
//             //     })
//             //     .catch((error) => {
//             //         handleShowSnackbar('Server Error ,Try again!', 'error')
//             //     })
//         }
//     }

//     const handleSearchChange = debounce((event) => {
//         const term = event.target.value.trim().toLowerCase()
//         setSearchTerm(term)
//         setLoading(true)
//         setTimeout(() => {
//             const results = products.filter((product) => {
//                 const nameMatch =
//                     product.name && product.name.toLowerCase().includes(term)
//                 const variantIdMatch =
//                     product.productVariantid === parseInt(term, 10)
//                 const brandMatch =
//                     product.brand && product.brand.toLowerCase().includes(term)
//                 const categoryMatch =
//                     product.category &&
//                     product.category.toLowerCase().includes(term)
//                 const subcategoryMatch =
//                     product.subcategory &&
//                     product.subcategory.toLowerCase().includes(term)

//                 return (
//                     nameMatch ||
//                     variantIdMatch ||
//                     brandMatch ||
//                     categoryMatch ||
//                     subcategoryMatch
//                 )
//             })

//             setSearchResults(results)
//             setLoading(false)
//         }, 500)
//     }, 500)

//     const handleAddToCart = () => {
//         if (selectedProduct) {
//             const isProductAdded = cart.some(
//                 (item) => item.id === selectedProduct.productVariantid
//             )
//             if (isProductAdded) {
//                 handleShowSnackbar('Product already added in cart', 'error')
//             } else {
//                 // Check if quantity exceeds available stock

//                 const item = {
//                     id: selectedProduct.productVariantid,
//                     name: selectedProduct.name,
//                     size: selectedProduct.size,
//                     quantity: quantity,
//                     image: selectedProduct.imageURL[0], // Include the image property
//                 }
//                 setCart([...cart, item])
//                 setSelectedProduct(null)
//                 setQuantity(1)
//                 setSearchTerm('')
//             }
//         }
//     }

//     const handleRemoveFromCart = (productVariantid) => {
//         const updatedCart = cart.filter((item) => item.id !== productVariantid)
//         setCart(updatedCart)
//     }

//     const handleQuantityChange = (productVariantid, newQuantity) => {
//         const updatedCart = cart.map((item) => {
//             if (item.id === productVariantid) {
//                 return { ...item, quantity: newQuantity }
//             }
//             return item
//         })
//         setCart(updatedCart)
//     }
//     const classes = useStyles()

//     return (
//         <Container>
//             <GrozpSnackbar
//                 open={open}
//                 handleClose={handleClose}
//                 msg={msg}
//                 severity={severity}
//             />
//             <Grid container spacing={4}>
//                 <Grid
//                     item
//                     lg={7}
//                     md={7}
//                     sm={12}
//                     xs={12}
//                     style={{ height: '100%' }}
//                 >
//                     <SimpleCard
//                         title={'Product Section'}
//                         style={{ height: '100%' }}
//                     >
//                         <ValidatorForm
//                             onSubmit={() => null}
//                             onError={() => null}
//                         >
//                             <Autocomplete
//                                 options={searchResults}
//                                 getOptionLabel={(product) =>
//                                     `${product.brand} - ${product.name} (${product.productVariantId})${product.category}`
//                                 }
//                                 renderOption={(props, product) => (
//                                     <li {...props}>
//                                         <div
//                                             style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                             }}
//                                         >
//                                             <img
//                                                 src={product.imageURL[0]}
//                                                 alt="Product"
//                                                 style={{
//                                                     marginRight: '8px',
//                                                     width: '50px',
//                                                     height: '50px',
//                                                 }}
//                                             />
//                                             {product.brand},{product.name},
//                                             {product.size},{product.category}
//                                         </div>
//                                     </li>
//                                 )}
//                                 onChange={(event, value) =>
//                                     setSelectedProduct(value)
//                                 }
//                                 loading={loading}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Search products By name/categroy/subcateory/productVariantId/brand.."
//                                         onChange={handleSearchChange}
//                                         type="text"
//                                         name="searchTerm"
//                                         id="standard-basic"
//                                         value={searchTerm}
//                                         validators={['required']}
//                                         errorMessages={[
//                                             'this field is required',
//                                         ]}
//                                         InputProps={{
//                                             ...params.InputProps,
//                                             endAdornment: (
//                                                 <>
//                                                     {loading ? (
//                                                         <CircularProgress
//                                                             color="inherit"
//                                                             size={20}
//                                                         />
//                                                     ) : null}
//                                                     {
//                                                         params.InputProps
//                                                             .endAdornment
//                                                     }
//                                                 </>
//                                             ),
//                                         }}
//                                     />
//                                 )}
//                             />

//                             <Grid container spacing={2}>
//                                 <Grid item xs={12} sm={8}>
//                                     <TextField
//                                         label="Quantity"
//                                         type="number"
//                                         value={quantity}
//                                         onChange={(e) => {
//                                             const value = Math.max(
//                                                 1,
//                                                 parseInt(e.target.value)
//                                             )
//                                             setQuantity(value)
//                                         }}
//                                         validators={[
//                                             'required',
//                                             'isNumber',
//                                             'minNumber:1',
//                                         ]}
//                                         errorMessages={[
//                                             'This field is required',
//                                             'Invalid number',
//                                             'Quantity must be at least 1',
//                                         ]}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={4}>
//                                     <Button
//                                         variant="contained"
//                                         color="primary"
//                                         onClick={handleAddToCart}
//                                         disabled={!selectedProduct}
//                                     >
//                                         Add to Bag
//                                     </Button>
//                                 </Grid>
//                             </Grid>
//                         </ValidatorForm>
//                     </SimpleCard>
//                 </Grid>

//                 <Grid item lg={5} md={5} sm={12} xs={12}>
//                     <SimpleCard
//                         title={'Allotment Bag'}
//                         style={{ height: '100%' }}
//                     >
//                         <ValidatorForm
//                             onSubmit={() => null}
//                             onError={() => null}
//                         >
//                             <Grid container spacing={2} alignItems="center">
//                                 <Grid item lg={8} md={8} sm={12} xs={12}>
//                                     <StoreList
//                                         value={StoreValue}
//                                         onChange={handleStoreChange}
//                                     />
//                                 </Grid>
//                                 <Grid item>
//                                     <Button
//                                         variant="contained"
//                                         color="primary"
//                                         onClick={placeorder}
//                                     >
//                                         Place Order
//                                     </Button>
//                                 </Grid>
//                             </Grid>
//                         </ValidatorForm>
//                         <div style={{ height: '600px', overflowY: 'scroll' }}>
//                             <TableContainer
//                                 component={Paper}
//                                 className={classes.tableContainer}
//                             >
//                                 <Table className={classes.table}>
//                                     <TableHead className={classes.tableHeader}>
//                                         <TableRow>
//                                             <TableCell
//                                                 className={`${classes.tableCell} ${classes.tableCellBold}`}
//                                             >
//                                                 Image
//                                             </TableCell>
//                                             <TableCell
//                                                 className={`${classes.tableCell} ${classes.tableCellBold}`}
//                                             >
//                                                 Product
//                                             </TableCell>
//                                             <TableCell
//                                                 className={`${classes.tableCell} ${classes.tableCellBold}`}
//                                             >
//                                                 Size
//                                             </TableCell>
//                                             <TableCell
//                                                 className={`${classes.tableCell} ${classes.tableCellBold}`}
//                                             >
//                                                 Quantity
//                                             </TableCell>

//                                             <TableCell
//                                                 className={`${classes.tableCell} ${classes.tableCellBold}`}
//                                             >
//                                                 Remove
//                                             </TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {cart.map((item) => (
//                                             <TableRow key={item.id}>
//                                                 <TableCell
//                                                     className={
//                                                         classes.tableCell
//                                                     }
//                                                 >
//                                                     <img
//                                                         src={item.image}
//                                                         alt="Product"
//                                                         style={{
//                                                             width: '50px',
//                                                             height: '50px',
//                                                         }}
//                                                     />
//                                                 </TableCell>
//                                                 <TableCell
//                                                     className={
//                                                         classes.tableCell
//                                                     }
//                                                 >
//                                                     {item.name
//                                                         .split(' ')
//                                                         .slice(0, 3)
//                                                         .join(' ')}
//                                                     {item.name.split(' ')
//                                                         .length > 3 && '...'}
//                                                 </TableCell>

//                                                 <TableCell
//                                                     className={
//                                                         classes.tableCell
//                                                     }
//                                                 >
//                                                     {item.size}
//                                                 </TableCell>

//                                                 <TableCell
//                                                     className={
//                                                         classes.tableCell
//                                                     }
//                                                 >
//                                                     <QuantityControl>
//                                                         <QuantityButton
//                                                             color="secondary"
//                                                             disabled={
//                                                                 item.quantity ===
//                                                                 1
//                                                             } // Disable minus button when quantity is 1
//                                                             onClick={() =>
//                                                                 handleQuantityChange(
//                                                                     item.id,
//                                                                     item.quantity -
//                                                                         1
//                                                                 )
//                                                             }
//                                                         >
//                                                             <RemoveIcon />
//                                                         </QuantityButton>
//                                                         <QuantityDisplay>
//                                                             {item.quantity}
//                                                         </QuantityDisplay>
//                                                         <QuantityButton
//                                                             color="secondary"
//                                                             onClick={() =>
//                                                                 handleQuantityChange(
//                                                                     item.id,
//                                                                     item.quantity +
//                                                                         1
//                                                                 )
//                                                             }
//                                                         >
//                                                             <AddIcon />
//                                                         </QuantityButton>
//                                                     </QuantityControl>
//                                                 </TableCell>

//                                                 <TableCell
//                                                     className={
//                                                         classes.tableCell
//                                                     }
//                                                 >
//                                                     <IconButton
//                                                         color="secondary"
//                                                         onClick={() =>
//                                                             handleRemoveFromCart(
//                                                                 item.id
//                                                             )
//                                                         }
//                                                     >
//                                                         <Icon>delete</Icon>
//                                                     </IconButton>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>
//                         </div>
//                     </SimpleCard>
//                 </Grid>
//             </Grid>
//         </Container>
//     )
// }

// export default DealerAllotment
