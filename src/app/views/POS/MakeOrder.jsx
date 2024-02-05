import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import {
    Button,
    Icon,
    Grid,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import { styled } from '@mui/system'
import { url } from 'app/constants'
import { SimpleCard, Breadcrumb } from 'app/components'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { GrozpSnackbar } from 'app/components/'
import VoucherSelection from './VoucherSelector'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    cartIconButton: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: theme.palette.text.primary,
    },
    cartIcon: {
        marginRight: theme.spacing(1),
    },
    cartItemCount: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        borderRadius: '50%',
        padding: theme.spacing(0.5),
        fontSize: '0.8rem',
    },
    goBackLink: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: theme.palette.text.primary,
    },
    arrowIcon: {
        marginRight: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))
const StyledProgress = styled(CircularProgress)(() => ({
    position: 'absolute',
    top: '6px',
}))
const useStyles = makeStyles({
    tableContainer: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        fontSize: 'smaller',
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f0faf2',
        position: 'sticky',
    },
    tableCell: {
        padding: '5px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '12px',
    },
    tableCellBold: {
        fontWeight: 'bold',
        fontSize: '12-x',
    },
})

const TextFields = styled(TextValidator)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const MakeOrder = () => {
    const { user } = useAuth()
    // Initialize storecart state with data from local storage
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [otploading, setotploading] = useState(false)
    const [buttonisloading, setButtonisLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    const [mobileNumber, setMobileNumber] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selectedQuantities, setSelectedQuantities] = useState({})
    const [voucherdata, setVoucherdata] = useState([])
    const [Redeemdata, setRedeemtData] = useState('')
    const [voucheramount, setVoucherAmount] = useState(0)
    const [RedeemPoint, setRedeemPoint] = useState(0)
    const [payamount, setPayamount] = useState('')
    const [Searchshow, setSearchshow] = useState(true)
    const [username, setusername] = useState('')
    const [newsusername, setnewsusername] = useState('')
    const [VoucherShow, setVoucherShow] = useState(false)
    const [otp, setOTP] = useState('')
    const [isOtpValid, setIsOtpValid] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [userIdset, setuseridset] = useState('')
    const [validloading, setvalidLoading] = useState(false)
    const [voucher, setvoucher] = useState([])
    const [searchInput, setSearchInput] = useState('')
    const [filteredData, setFilteredData] = useState([])
    // const [selectedVouchers, setSelectedVouchers] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const address = {
        label: 'Home',
        receiverName: username,
        phoneAlt: null,
        locality: 'Garhwa',
        nearby: '',
        floorNo: null,
        address: 'Store',
        pinCode: '822114',
        district: 'Palamu Division',
        state: 'Jharkhand',
        latitude: 24.154907200000004,
        longitude: 83.7995663,
        addressId: null,
        isDefault: true,
    }
    // Load selected quantities from local storage on initial render
    useEffect(() => {
        const storedQuantities = localStorage.getItem('selectedQuantities')
        if (storedQuantities) {
            setSelectedQuantities(JSON.parse(storedQuantities))
        }
    }, [])

    useEffect(() => {
        // Update local storage whenever selected quantities change
        localStorage.setItem(
            'selectedQuantities',
            JSON.stringify(selectedQuantities)
        )
    }, [selectedQuantities])

    // product search start
    const handleSearchChange = async () => {
        if (searchTerm) {
            setLoading(true)
            try {
                const response = await url.get(
                    `v1/in/listings-search?storeCode=${user.storeCode}&q=${searchTerm}&page=1`
                )

                if (response.data.status === true) {
                    setSearchResults(response.data.data.suggestions)
                }

                if (response.data.data.suggestions.length <= 0) {
                    setSearchTerm('')
                    handleShowSnackbar(
                        'No Any Result Found, Try again!',
                        'error'
                    )
                }

                setSearchTerm('')
            } catch (error) {
                console.error('Error:', error)
                handleShowSnackbar(
                    'An error occurred, please try again.',
                    'error'
                )
            } finally {
                setLoading(false)
            }
        } else {
            handleShowSnackbar('No Any Product Found, Try again!', 'error')
        }
    }
    // close prodcut search section

    // fetch user data by phone number
    useEffect(() => {
        if (mobileNumber.length === 10) {
            setButtonisLoading(true)
            try {
                const data = {
                    phone: mobileNumber,
                }
                url.post('v1/in/users/details', data)
                    .then((res) => {
                        if (res.data.status == true) {
                            setVoucherdata(res.data.data.voucher)
                            setRedeemtData(res.data.data.redeemPoint)
                            setusername(res.data.data.name)
                            setuseridset(res.data.data.userId)
                            setButtonisLoading(false)
                        } else {
                            setusername('New User')
                            setVoucherdata([])
                            setRedeemtData('')

                            setRedeemPoint(0)
                            setVoucherAmount(0)
                            setButtonisLoading(false)
                        }
                    })
                    .catch((error) => {
                        console.log('Error')
                    })
            } catch {
                console.log('Error')
            }
        }
        setusername('')
        setRedeemtData('')
        setRedeemPoint(0)
        setVoucherAmount(0)
        setVoucherdata([])
        // setButtonisLoading(false)
    }, [mobileNumber])

    // page change
    const handlePageChange = (event, newPage) => {
        setPage(newPage)
    }

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }
    // end page change

    // print bill section start
    const generateBillPDF = (orderId) => {
        url.get(`v1/in/orders/details?id=${orderId}`)
            .then((response) => {
                if (response.data.status === true) {
                    const data = response.data.data
                    const totalQuantity = data.orderItem.reduce(
                        (total, item) => total + item.quantity,
                        0
                    )
                    const returnAmount = data.orderItem.reduce(
                        (total, item) =>
                            total + item.removedQuantity * item.price,
                        0
                    )
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        printWindow.document.write(`
                        <style>
                        /* Add your custom styles for the printable invoice here */
                        /* For example: */
                        table {
                            border-collapse: collapse;
                            border-spacing: 0;
                            width: 100%;
                            border: 1px solid black;
                          }
                          th {
                            font-size: 12px;
                          }
                          
                          
                          th, td {
                            text-align: center;
                            padding: 1px;
                            border: 1px solid black;
                            font-size: 12px;
                          }
                          tbody tr:first-child td {
                            border-top: 1px solid black;
                          }
                          tbody tr:last-child td {
                            border-bottom: 1px solid black;
                          }
                          tr:nth-child(even) {
                            background-color: #f2f2f2;
                          }
                
                          h5, p {
                            font-size: 14px;
                            margin: 0;
                          }
                      </style>
                    </head>
                    <h5>Estimate Bill</h5>
                    <br />
                    <p>Date & Time: ${data.orderDateTime}</p>
                    <p>Order Number:${data.invoiceId}</p>
                    <br/>
                    <p>Name:${data.name}, Mobile:${data.phone}</p>
                    <p>Alternet Mobile:${data.phoneAlt}</p>
                    
                    <p>Total Items: ${totalQuantity}, Total: ₹ ${
                            data.billingInfo.subTotal
                        }</p>
                    <p>Payment Type: ${data.billingInfo.paymentType}</p>
                    <p>Address: ${data.address}</p>
                    <br/>
                    <table>
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Product Name &amp; Size</th>
                          <th>MRP</th>
                          <th>Rate</th>
                          <th>QTY</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${data.orderItem
                            .map(
                                (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td>${item.itemName},${item.size}</td>
                              <td>₹${item.mrp}</td>
                              <td>₹${item.price.toFixed(2)}</td>
                              <td>${item.quantity}</td>
                              <td>₹ ${(
                                  parseFloat(item.price) * item.quantity
                              ).toFixed(2)}</td>
                            </tr>
                          `
                            )
                            .join('')}
                      </tbody>
                    </table>
                    <br />
                    <p>Total Amount: ₹ ${data.billingInfo.itemTotal}</p>
                    <p>SubTotal Amount: ₹ ${data.billingInfo.subTotal}</p>
                    <p>Delivery Charge: ₹ ${data.billingInfo.deliveryCharge}</p>
                    <p>Promo Discount: ₹ ${data.billingInfo.promoDiscount}</p>
                    <p>Loyalty Points: ₹ ${data.billingInfo.loyaltyPoints}</p>
                    <p>Return Amount: ₹ ${returnAmount}</p>
                    <p>Payable Amount: ₹ ${data.billingInfo.grandTotal}</p>
                    <p>Refund Point: ₹ ${data.billingInfo.returnPoint}</p>
                    <br />
                    <br/>
                    <p>You Saved: ₹ ${(
                        data.billingInfo.itemTotal - data.billingInfo.subTotal
                    ).toFixed(2)}</p>
                    <p>Thanks for shopping! 😊</p>
                    `)
                        printWindow.document.close()
                    } else {
                        console.error('Failed to open the print window.')
                    }
                } else {
                    handleShowSnackbar('Order Id Not found !', 'error')
                }
            })
            .catch((error) => {
                handleShowSnackbar('Error fetching data', 'error')
            })
    }
    // end print bill section

    // otp send section start
    const sendOTP = async () => {
        try {
            setotploading(true)
            // Make an API call to send the OTP
            const data = {
                number: mobileNumber,
            }
            await url.post('login/v1/phone', data)
            setotploading(false)
            setOpenDialog(true)
        } catch (error) {
            console.error('Error sending OTP:', error)
        }
    }

    // otp send section end

    // otp verify section start
    const validateOTP = async () => {
        try {
            setvalidLoading(true)
            // Make an API call to validate the OTP
            const data = {
                number: mobileNumber,
                code: parseInt(otp),
            }
            const response = await url.post('login/v1/phone-verification', data)
            if (response.data.status == true) {
                setvalidLoading(false)
                setIsOtpValid(response.data.status)
                handleShowSnackbar('Otp Verified!', 'success')
                handleDialogClose()
            } else {
                setvalidLoading(false)
                handleShowSnackbar('Wrong Otp!', 'error')
            }
            // Update the isOtpValid state based on the API response
        } catch (error) {
            console.error('Error validating OTP:', error)
            setvalidLoading(false)
        }
    }

    // otp verify section end

    // otp section verify dialog start
    const handleDialogClose = () => {
        setOpenDialog(false)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    // otp section verify dialog end

    //  snack bar
    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    // new user creation start
    const createUser = async () => {
        if (newsusername == '' || newsusername == null) {
            handleShowSnackbar('Enter User Name!', 'error')
        } else {
            try {
                // Make an API call to validate the OTP
                const data = {
                    number: mobileNumber,
                    name: newsusername,
                }
                setButtonisLoading(true)
                const response = await url.post('v1/in/users', data)
                if (response.data.status == true) {
                    setusername(response.data.data.userDetails.name)
                    setuseridset(response.data.data.userDetails.userId)
                    handleShowSnackbar(
                        'User Created Successfully  !',
                        'success'
                    )
                    setButtonisLoading(false)
                } else {
                    handleShowSnackbar('already registred!', 'error')
                }
                // Update the isOtpValid state based on the API response
            } catch (error) {
                handleShowSnackbar('Server Error new user!', 'error')
            }
        }
    }
    // End user creation start

    // order palce start
    const placeorder = async () => {
        if (cartData.length <= 0) {
            handleShowSnackbar('Cart Empty!', 'error')
        }
        if (mobileNumber === '') {
            handleShowSnackbar('Enter Mobile number!', 'error')
        } else if (!/^\d{10}$/.test(mobileNumber)) {
            handleShowSnackbar('Invalid Mobile number!', 'error')
        } else {
            try {
                if (RedeemPoint > 0 || voucheramount > 0) {
                    if (isOtpValid) {
                        sendOrder()
                    } else {
                        handleShowSnackbar('First Validate Otp!', 'error')
                    }
                } else {
                    sendOrder()
                }
                // Place order (API call)
            } catch (error) {
                console.error('Error placing order:', error)
            }
        }
    }

    const sendOrder = async () => {
        setButtonisLoading(true)
        let coupan = []
        if (voucher) {
            let id = 1

            // Iterate over the input JSON array and transform each object
            for (const item of voucher) {
                const transformedItem = {
                    id: id++,
                    code: item.sno, // Set "code" to the value of "sno" from the input object
                    origin: 'Teamwork',
                }
                coupan.push(transformedItem)
            }
        }
        const orderData = {
            phone: mobileNumber,
            storecode: user.storeCode,
            orderChannel: 'store',
            loyaltyPoint: parseInt(RedeemPoint),
            coupons: coupan ? coupan : [],
            goodyId: null,
            deliveryCharge: 0,
            promoDiscount: parseInt(voucheramount),
            paymentMode: 'Postpaid',
            userId: parseInt(userIdset),
            address: address,
            items: cartData,
            employeeId: user.id,
        }

        try {
            const response = await url.post('v1/in/stores-orders', orderData)
            if (response.data.status === true) {
                // if (voucheramount > 0 || RedeemPoint > 0) {
                //     const formData = new FormData()
                //     formData.append('mobileNumber', mobileNumber)
                //     formData.append('RedeemPoints', RedeemPoint)
                //     formData.append('OrderId', response.data.data.id)
                //     formData.append('Vouchers', JSON.stringify(voucher))
                //     formData.append('empid', user.domainMail)
                //     axios
                //         .post(
                //             'https://www.buy4earn.com/React_App/GrozepRedeemVoucher.php',
                //             formData
                //         )
                //         .then((response) => {
                //             // Handle the response
                //         })
                //         .catch((error) => {
                //             console.error(error)
                //             // Handle the error
                //         })
                // }
                setButtonisLoading(false)
                handleShowSnackbar('Order placed successfully:', 'success')
                clearstaorge()
                generateBillPDF(response.data.data.id)
            }
        } catch (error) {
            handleShowSnackbar('Error placing order:', 'error')
            setButtonisLoading(false)
        }
    }

    // close palceorder section

    // start filter product
    useEffect(() => {
        const results = searchResults.filter((product) => {
            const nameMatch =
                product.name && product.name.toLowerCase().includes(searchInput)
            const variantIdMatch =
                product.variant.id === parseInt(searchInput, 10)
            const productIdMatch =
                product.productId === parseInt(searchInput, 10)
            const brandMatch =
                product.brand &&
                product.brand.toLowerCase().includes(searchInput)
            const categoryMatch =
                product.category &&
                product.category.toLowerCase().includes(searchInput)
            const subcategoryMatch =
                product.subcategory &&
                product.subcategory.toLowerCase().includes(searchInput)
            const sizeMatch =
                product.subcategory &&
                product.variant.size.toLowerCase().includes(searchInput)

            return (
                nameMatch ||
                variantIdMatch ||
                brandMatch ||
                categoryMatch ||
                subcategoryMatch ||
                productIdMatch ||
                sizeMatch
            )
        })
        setPage(0)
        setFilteredData(results)
    }, [searchResults, searchInput])

    // close filter product

    // add product in cart

    const handleAddToCart = (product) => {
        const productId = product.variant.id
        const currentQuantity = selectedQuantities[productId]
            ? selectedQuantities[productId].quantity
            : 0
        const newQuantity = currentQuantity + 1

        if (newQuantity > product.stock) {
            // Do not add to cart if quantity exceeds stock
            return
        }

        setSelectedQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productId]: {
                quantity: newQuantity,
                name: product.name,
                imageUrl: product.variant.imageURL[0],
                brand: product.brand,
                size: product.variant.size,
                color: product.color,
                category: product.category,
                subcategory: product.subcategory,
                gender: product.gender,
                family: product.family,
                group: product.group,
                class: product.product,
                packaging: product.variant.packaging,
                barcode: product.variant.barcode,
                supplies: product.variant.supplies,
                variantId: product.variant.id,
                productId: product.productId,
            },
        }))
    }

    // remove product from cart
    const handleRemoveFromCart = (productId) => {
        setSelectedQuantities((prevQuantities) => {
            const updatedQuantities = { ...prevQuantities }
            delete updatedQuantities[productId]
            return updatedQuantities
        })
    }
    // remove product from list
    const handelremoves = (productId) => {
        setVoucherShow(false)
        setRedeemPoint(0)
        setvoucher([])
        setVoucherAmount(0)
        setvoucher('')
        const remove = productId.variantId
        setSelectedQuantities((prevQuantities) => {
            const updatedQuantities = { ...prevQuantities }
            delete updatedQuantities[remove]
            return updatedQuantities
        })

        const cartData = Object.values(selectedQuantities)
        if (cartData.length == 1) {
            setMobileNumber('')

            setSearchshow(true)
        }
    }

    const handleDeleteClick = (item) => {
        setItemToDelete(item)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = () => {
        // Call your handelRemoves function here with itemToDelete
        if (itemToDelete) {
            handelremoves(itemToDelete)
        }
        // Close the modal
        setShowDeleteModal(false)
    }

    const handleCancelDelete = () => {
        // Close the modal
        setShowDeleteModal(false)
    }
    const handelremove = (productId) => {
        const removeid = productId.variant.id
        setSelectedQuantities((prevQuantities) => {
            const updatedQuantities = { ...prevQuantities }
            delete updatedQuantities[removeid]
            return updatedQuantities
        })
    }

    const getQuantity = (productId) => {
        return selectedQuantities[productId]
            ? selectedQuantities[productId].quantity
            : ''
    }

    const isProductSelected = (productId) => {
        return !!selectedQuantities[productId]
    }

    const handleQuantityChange = (productId, quantity) => {
        if (Number.isNaN(quantity) || quantity <= 0) {
            // Remove the product from the cart if quantity is NaN or less than or equal to 0
            handleRemoveFromCart(productId)
        } else {
            const product = searchResults.find(
                (item) => item.variant.id === productId
            )
            if (
                product &&
                quantity >
                    product.variant.supplies.reduce(
                        (acc, supply) => acc + supply.quantity,
                        0
                    )
            ) {
                // Do not update the quantity if it exceeds the stock
                quantity = product.variant.supplies.reduce(
                    (acc, supply) => acc + supply.quantity,
                    0
                )
            }

            setSelectedQuantities((prevQuantities) => ({
                ...prevQuantities,
                [productId]: {
                    quantity: quantity,
                    name: product.name,
                    imageUrl: product.variant.imageURL[0],
                    brand: product.brand,
                    size: product.variant.size,
                    color: product.color,
                    category: product.category,
                    subcategory: product.subcategory,
                    gender: product.gender,
                    family: product.family,
                    group: product.group,
                    class: product.product,
                    packaging: product.variant.packaging,
                    barcode: product.variant.barcode,
                    supplies: product.variant.supplies,
                    variantId: product.variant.id,
                    productId: product.productId,
                },
            }))
        }
    }
    const classes = useStyles()

    const handleInputChange = (e) => {
        setSearchInput(e.target.value)
    }

    const pay = () => {
        const final = totalAmounts - RedeemPoint
        const pay = final - voucheramount
        localStorage.setItem('payamount', JSON.stringify(pay))
        return Math.round(pay)
    }

    const handleVouchersSelected = (selectedVouchers) => {
        const vouchersWithoutId = selectedVouchers.map(
            ({ id, ...rest }) => rest
        )
        const amount = selectedVouchers.reduce((total, voucher) => {
            return total + parseInt(voucher.OfferAmount)
        }, 0)
        setVoucherAmount(amount)
        setvoucher(vouchersWithoutId)
    }

    const handleApplyRedeemPoints = (event) => {
        const value = event.target.value
        const pay = totalAmounts - voucheramount
        if (value <= pay) {
            if (value <= Redeemdata - 1) {
                setRedeemPoint(value.replace(/[^0-9]/g, ''))
            } else {
                handleShowSnackbar(
                    'You have only ' + Redeemdata + ' points !',
                    'error'
                )
            }
        } else {
            handleShowSnackbar(
                'You do not reddem more then total Amount! ',
                'error'
            )
        }
    }
    const cartData = Object.values(selectedQuantities)

    const totalAmounts = cartData.reduce((accumulator, item) => {
        const mrp = parseFloat(item.supplies[0].mrp)
        const off = parseFloat(item.supplies[0].off)
        const quantity = item.quantity
        const totalPrice = (mrp - off) * quantity
        return accumulator + totalPrice
    }, 0)

    const clearstaorge = () => {
        setSelectedQuantities({})
        localStorage.removeItem('payamount')
        setSearchshow(true)
        setSearchResults([])
        setMobileNumber('')
        setIsOtpValid(false)
        setOTP('')
        setvoucher([])
        setVoucherShow(false)
    }
    const showcart = () => {
        const cartData = Object.values(selectedQuantities)
        if (cartData.length > 0) {
            setPayamount(totalAmounts)

            setSearchshow(false)
        } else {
            handleShowSnackbar('Add Product In bag!', 'error')
        }
    }
    const handleGoBack = () => {
        // Call your function and set the value to true
        // Replace `yourFunction` with your actual function name and `trueValue` with the desired value
        setIsOtpValid(false)
        setSearchshow(true)
        setvoucher([])
        setRedeemPoint(0)
        setVoucherAmount(0)
    }

    const handleQuantityChangeCart = (productId, newValue, stock) => {
        setVoucherShow(false)
        setRedeemPoint(0)
        setvoucher([])
        setVoucherAmount(0)
        setvoucher('')
        let newQuantity = Math.max(parseInt(newValue) || 1, 1)
        if (newQuantity > stock) {
            newQuantity = stock
        }

        setSelectedQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productId]: {
                ...prevQuantities[productId],
                quantity: newQuantity,
            },
        }))
    }

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            {Searchshow ? (
                <Grid container spacing={4}>
                    <Grid
                        item
                        lg={12}
                        md={12}
                        sm={12}
                        xs={12}
                        style={{ height: '100%' }}
                    >
                        <SimpleCard
                            style={{ height: '100%' }}
                            titleStyle={{
                                color: '#06c167',
                                fontWeight: 'bold',
                                fontSize: '20px',
                            }}
                        >
                            <ValidatorForm
                                onSubmit={() => handleSearchChange()}
                                onError={() => null}
                            >
                                <div className="breadcrumb">
                                    <Breadcrumb
                                        routeSegments={[
                                            { name: 'Product Section' },
                                        ]}
                                    />
                                </div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextFields
                                            label="Search products By name/category/subcategory/productVariantId/brand.."
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            validators={['required']}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSearchChange}
                                            disabled={loading} // Disable the button while loading
                                        >
                                            {loading
                                                ? 'Loading...'
                                                : 'Search Product'}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={showcart}
                                        >
                                            {' '}
                                            <ShoppingCartIcon
                                                className={classes.cartIcon}
                                            />
                                            Go to cart
                                            <span
                                                className={
                                                    classes.cartItemCount
                                                }
                                            >
                                                (
                                                {
                                                    Object.values(
                                                        selectedQuantities
                                                    ).length
                                                }
                                                )
                                            </span>
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            variant="contained"
                                            color="error"
                                        >
                                            ₹{totalAmounts.toFixed(2)}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </ValidatorForm>
                        </SimpleCard>
                        <br />
                        {filteredData.length > 0 ? (
                            <>
                                <TableContainer
                                    component={Paper}
                                    className={classes.tableContainer}
                                >
                                    <input
                                        type="text"
                                        placeholder="Search by name/Product ID/Size"
                                        value={searchInput}
                                        onChange={handleInputChange}
                                    />
                                    <Table className={classes.table}>
                                        <TableHead
                                            className={classes.tableHeader}
                                        >
                                            <TableRow>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Id
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Images
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Brand & Name
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Size
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    MRP
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Discount
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Rate
                                                </TableCell>

                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Stock
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Quantity
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredData
                                                .slice(
                                                    page * rowsPerPage,
                                                    page * rowsPerPage +
                                                        rowsPerPage
                                                )
                                                .map((product, index) => (
                                                    <TableRow
                                                        key={product.variant.id}
                                                    >
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.id}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                <img
                                                                    src={
                                                                        product
                                                                            .variant
                                                                            .imageURL[0]
                                                                    }
                                                                    width="50"
                                                                    height="50"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                {product.brand},
                                                                {product.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {
                                                                product.variant
                                                                    .size
                                                            }
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {
                                                                product.variant
                                                                    .supplies[0]
                                                                    .mrp
                                                            }
                                                        </TableCell>

                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {product.variant.supplies[0].off.toFixed(
                                                                2
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {product.variant
                                                                .supplies[0]
                                                                .mrp -
                                                                product.variant
                                                                    .supplies[0]
                                                                    .off >=
                                                            0
                                                                ? product
                                                                      .variant
                                                                      .supplies[0]
                                                                      .mrp -
                                                                  product
                                                                      .variant
                                                                      .supplies[0]
                                                                      .off
                                                                : `-${
                                                                      product
                                                                          .variant
                                                                          .supplies[0]
                                                                          .off -
                                                                      product
                                                                          .variant
                                                                          .supplies[0]
                                                                          .mrp
                                                                  }`}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.supplies.reduce(
                                                                (acc, supply) =>
                                                                    acc +
                                                                    supply.quantity,
                                                                0
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                {product.variant.supplies.reduce(
                                                                    (
                                                                        totalQuantity,
                                                                        supply
                                                                    ) =>
                                                                        totalQuantity +
                                                                        supply.quantity,
                                                                    0
                                                                ) <= 0 ? (
                                                                    <span
                                                                        style={{
                                                                            color: 'red',
                                                                        }}
                                                                    >
                                                                        Out of
                                                                        Stock
                                                                    </span>
                                                                ) : (
                                                                    <TextField
                                                                        type="number"
                                                                        value={getQuantity(
                                                                            product
                                                                                .variant
                                                                                .id
                                                                        )}
                                                                        label="Quantity"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuantityChange(
                                                                                product
                                                                                    .variant
                                                                                    .id,
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        }
                                                                        inputProps={{
                                                                            min: '0',
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.supplies.reduce(
                                                                (
                                                                    totalQuantity,
                                                                    supply
                                                                ) =>
                                                                    totalQuantity +
                                                                    supply.quantity,
                                                                0
                                                            ) <= 0 ? (
                                                                <span
                                                                    style={{
                                                                        color: 'red',
                                                                    }}
                                                                >
                                                                    Out of Stock
                                                                </span>
                                                            ) : isProductSelected(
                                                                  product
                                                                      .variant
                                                                      .id
                                                              ) ? (
                                                                <Button
                                                                    variant="contained"
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                    }}
                                                                    color="error"
                                                                    onClick={() =>
                                                                        handelremove(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleAddToCart(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    Add
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={
                                        handleRowsPerPageChange
                                    }
                                />
                            </>
                        ) : searchResults.length > 0 ? (
                            <>
                                <TableContainer
                                    component={Paper}
                                    className={classes.tableContainer}
                                >
                                    <input
                                        type="text"
                                        placeholder="Search by name/Product ID/Size"
                                        value={searchInput}
                                        onChange={handleInputChange}
                                    />
                                    <Table className={classes.table}>
                                        <TableHead
                                            className={classes.tableHeader}
                                        >
                                            <TableRow>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Id
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Images
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Brand & Name
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Size
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    MRP
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Discount
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Rate
                                                </TableCell>

                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Stock
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Quantity
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                >
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {searchResults
                                                .slice(
                                                    page * rowsPerPage,
                                                    page * rowsPerPage +
                                                        rowsPerPage
                                                )
                                                .map((product, index) => (
                                                    <TableRow
                                                        key={product.variant.id}
                                                    >
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.id}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                <img
                                                                    src={
                                                                        product
                                                                            .variant
                                                                            .imageURL[0]
                                                                    }
                                                                    width="50"
                                                                    height="50"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                {product.brand},
                                                                {product.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {
                                                                product.variant
                                                                    .size
                                                            }
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {
                                                                product.variant
                                                                    .supplies[0]
                                                                    .mrp
                                                            }
                                                        </TableCell>

                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {parseFloat(
                                                                product.variant
                                                                    .supplies[0]
                                                                    .off
                                                            ).toFixed(2)}
                                                        </TableCell>

                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            ₹
                                                            {product.variant
                                                                .supplies[0]
                                                                .mrp -
                                                                product.variant
                                                                    .supplies[0]
                                                                    .off >=
                                                            0
                                                                ? product
                                                                      .variant
                                                                      .supplies[0]
                                                                      .mrp -
                                                                  product
                                                                      .variant
                                                                      .supplies[0]
                                                                      .off
                                                                : `-${
                                                                      product
                                                                          .variant
                                                                          .supplies[0]
                                                                          .off -
                                                                      product
                                                                          .variant
                                                                          .supplies[0]
                                                                          .mrp
                                                                  }`}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.supplies.reduce(
                                                                (acc, supply) =>
                                                                    acc +
                                                                    supply.quantity,
                                                                0
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            <div>
                                                                {product.variant.supplies.reduce(
                                                                    (
                                                                        totalQuantity,
                                                                        supply
                                                                    ) =>
                                                                        totalQuantity +
                                                                        supply.quantity,
                                                                    0
                                                                ) <= 0 ? (
                                                                    <span
                                                                        style={{
                                                                            color: 'red',
                                                                        }}
                                                                    >
                                                                        Out of
                                                                        Stock
                                                                    </span>
                                                                ) : (
                                                                    <TextField
                                                                        type="number"
                                                                        value={getQuantity(
                                                                            product
                                                                                .variant
                                                                                .id
                                                                        )}
                                                                        label="Quantity"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuantityChange(
                                                                                product
                                                                                    .variant
                                                                                    .id,
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        }
                                                                        inputProps={{
                                                                            min: '0',
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            className={
                                                                classes.tableCell
                                                            }
                                                        >
                                                            {product.variant.supplies.reduce(
                                                                (
                                                                    totalQuantity,
                                                                    supply
                                                                ) =>
                                                                    totalQuantity +
                                                                    supply.quantity,
                                                                0
                                                            ) <= 0 ? (
                                                                <span
                                                                    style={{
                                                                        color: 'red',
                                                                    }}
                                                                >
                                                                    Out of Stock
                                                                </span>
                                                            ) : isProductSelected(
                                                                  product
                                                                      .variant
                                                                      .id
                                                              ) ? (
                                                                <Button
                                                                    variant="contained"
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                    }}
                                                                    color="error"
                                                                    onClick={() =>
                                                                        handelremove(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleAddToCart(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    Add
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25]}
                                    component="div"
                                    count={searchResults.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={
                                        handleRowsPerPageChange
                                    }
                                />
                            </>
                        ) : null}
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    <Grid item lg={8} md={8} sm={8} xs={8}>
                        {/* <div onClick={handleGoBack}> */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGoBack}
                            style={{ marginBottom: '5px' }}
                        >
                            Go Back
                        </Button>
                        <SimpleCard
                            title={'Cart Items'}
                            titleStyle={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#115293',
                            }}
                            style={{ height: '100%' }}
                        >
                            <div
                                style={{
                                    height: '500px',
                                    overflowY: 'scroll',
                                }}
                            >
                                <TableContainer
                                    component={Paper}
                                    className={classes.tableContainer}
                                    style={{
                                        overflowX: 'auto',
                                        maxWidth: '100%',
                                    }}
                                >
                                    <Table
                                        className={classes.table}
                                        style={{ tableLayout: 'fixed' }}
                                    >
                                        <TableHead
                                            className={classes.tableHeader}
                                        >
                                            <TableRow>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '50px' }}
                                                >
                                                    Id
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Image
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '110px' }}
                                                >
                                                    Brand & Name
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Size
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    MRP
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Discount
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Rate
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Stock
                                                </TableCell>
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Quantity
                                                </TableCell>

                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Total
                                                </TableCell>

                                                {/* <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Action
                                                </TableCell> */}
                                                <TableCell
                                                    className={`${classes.tableCell} ${classes.tableCellBold}`}
                                                    style={{ width: '100px' }}
                                                >
                                                    Remove
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(
                                                selectedQuantities
                                            ).map(([productId, item]) => (
                                                <TableRow key={item}>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {item.variantId}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        <img
                                                            src={item.imageUrl}
                                                            alt="Product"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        // style={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        <div>
                                                            {item.brand},
                                                            {item.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {item.size}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {item.supplies[0].mrp}
                                                    </TableCell>

                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {item.supplies[0].off.toFixed(
                                                            2
                                                        )}
                                                    </TableCell>

                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {(item.supplies[0].mrp -
                                                            item.supplies[0]
                                                                .off >=
                                                        0
                                                            ? item.supplies[0]
                                                                  .mrp -
                                                              item.supplies[0]
                                                                  .off
                                                            : -(
                                                                  item
                                                                      .supplies[0]
                                                                      .off -
                                                                  item
                                                                      .supplies[0]
                                                                      .mrp
                                                              )
                                                        ).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {item.supplies.reduce(
                                                            (acc, supply) =>
                                                                acc +
                                                                supply.quantity,
                                                            0
                                                        )}
                                                    </TableCell>

                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        <TextField
                                                            style={{
                                                                flex: 1,
                                                                textAlign:
                                                                    'center',
                                                                width: '100px',
                                                            }}
                                                            type="number"
                                                            value={
                                                                selectedQuantities[
                                                                    productId
                                                                ]?.quantity ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleQuantityChangeCart(
                                                                    productId,
                                                                    e.target
                                                                        .value,
                                                                    item.supplies.reduce(
                                                                        (
                                                                            acc,
                                                                            supply
                                                                        ) =>
                                                                            acc +
                                                                            supply.quantity,
                                                                        0
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {(
                                                            (item.supplies[0]
                                                                .mrp -
                                                                item.supplies[0]
                                                                    .off) *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell
                                                        className={`${classes.tableCell}`}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Icon>delete</Icon>
                                                        </IconButton>
                                                        <Dialog
                                                            open={
                                                                showDeleteModal
                                                            }
                                                            onClose={
                                                                handleCancelDelete
                                                            }
                                                            aria-labelledby="delete-modal-title"
                                                            aria-describedby="delete-modal-description"
                                                        >
                                                            <DialogTitle id="delete-modal-title">
                                                                Confirm Deletion
                                                            </DialogTitle>
                                                            <DialogContent>
                                                                <p id="delete-modal-description">
                                                                    Are you sure
                                                                    you want to
                                                                    delete the
                                                                    product from
                                                                    the cart?
                                                                </p>
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button
                                                                    onClick={
                                                                        handleCancelDelete
                                                                    }
                                                                    color="primary"
                                                                >
                                                                    No
                                                                </Button>
                                                                <Button
                                                                    onClick={
                                                                        handleConfirmDelete
                                                                    }
                                                                    color="secondary"
                                                                >
                                                                    Yes, Delete
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </SimpleCard>
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={12} sx={{ mt: 4 }}>
                        <SimpleCard
                            title={'Invoices'}
                            style={{ height: '40%' }}
                        >
                            <ValidatorForm
                                onSubmit={() => null}
                                onError={() => null}
                            >
                                <span
                                    style={{
                                        color:
                                            username !== '' ? 'green' : 'black',
                                    }}
                                >
                                    {username !== '' ? username : ''}
                                </span>

                                <br />
                                <Grid item>
                                    <TextFields
                                        type="text"
                                        name="mobile"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        inputProps={{
                                            onKeyDown: (e) => {
                                                if (
                                                    !/^\d$/.test(e.key) &&
                                                    e.key !== 'Backspace'
                                                ) {
                                                    e.preventDefault()
                                                }
                                            },
                                        }}
                                        value={mobileNumber || ''}
                                        onChange={(event) => {
                                            const input =
                                                event.target.value.slice(0, 10) // Get the first 10 digits
                                            setMobileNumber(input)
                                        }}
                                        label="Mobile Number"
                                        maxLength={10}
                                        validators={[
                                            'required',
                                            'isNumber',
                                            'minStringLength:10',
                                            'maxStringLength:10',
                                        ]}
                                        errorMessages={[
                                            'This field is required',
                                            'Invalid mobile number',
                                            'Mobile number must be 10 digits',
                                            'Mobile number must be 10 digits',
                                        ]}
                                    />
                                </Grid>

                                {username == 'New User' ? (
                                    <TextFields
                                        type="text"
                                        name="User Name"
                                        id="standard-basic"
                                        value={newsusername || ''}
                                        onChange={(event) => {
                                            setnewsusername(event.target.value)
                                        }}
                                        label="User name"
                                        validators={['required']}
                                    />
                                ) : null}

                                {VoucherShow && voucherdata.length > 0 ? (
                                    <VoucherSelection
                                        vouchers={voucherdata}
                                        onSelectVouchers={
                                            handleVouchersSelected
                                        }
                                        totalAmount={payamount}
                                    />
                                ) : null}
                                {Redeemdata ? null : null}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <p>Sub total Amount:</p>
                                        {Redeemdata > 10 ? (
                                            <p>Available Points:</p>
                                        ) : null}
                                        {Redeemdata ? (
                                            <p>Redeem Points:</p>
                                        ) : null}
                                        {voucherdata.length > 0 ? (
                                            <p>Voucher Amount:</p>
                                        ) : null}

                                        {voucheramount > 0 ||
                                        RedeemPoint > 0 ? (
                                            <p>
                                                Validate Loyality Point Or
                                                voucher:
                                            </p>
                                        ) : null}
                                        <p>Payable Amount:</p>
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                textAlign: 'right',
                                            }}
                                        >
                                            ₹{totalAmounts}
                                        </p>
                                        <p
                                            style={{
                                                textAlign: 'right',
                                            }}
                                        >
                                            {Redeemdata}
                                        </p>

                                        <p
                                            style={{
                                                textAlign: 'right',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {' '}
                                            {Redeemdata > 10 ? (
                                                <input
                                                    type="number"
                                                    name="RedeemPoint"
                                                    id="standard-basic"
                                                    value={RedeemPoint || ''}
                                                    onChange={
                                                        handleApplyRedeemPoints
                                                    }
                                                    label="Redeem Point"
                                                    validators={[
                                                        'required',
                                                        'isNumber',
                                                    ]}
                                                    errorMessages={[
                                                        'This field is required',
                                                        'Invalid mobile number',
                                                    ]}
                                                />
                                            ) : null}
                                        </p>
                                        {voucherdata != '' ||
                                        voucherdata.length != 0 ? (
                                            <p
                                                style={{
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {voucherdata.length > 0 &&
                                                voucheramount == 0 ? (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() =>
                                                            setVoucherShow(true)
                                                        }
                                                    >
                                                        Apply Voucher
                                                    </Button>
                                                ) : (
                                                    `₹ ${voucheramount}`
                                                )}
                                            </p>
                                        ) : null}

                                        {voucheramount > 0 ||
                                        RedeemPoint > 0 ? (
                                            isOtpValid === false ? (
                                                <p
                                                    style={{
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={sendOTP}
                                                        style={{
                                                            textAlign: 'right',
                                                        }}
                                                        disabled={otploading}
                                                    >
                                                        {otploading && (
                                                            <StyledProgress
                                                                size={24}
                                                                className="buttonProgress"
                                                            />
                                                        )}
                                                        Validate
                                                    </Button>
                                                </p>
                                            ) : (
                                                <p
                                                    style={{
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        style={{
                                                            textAlign: 'right',
                                                        }}
                                                    >
                                                        Validated
                                                    </Button>
                                                </p>
                                            )
                                        ) : null}

                                        <p
                                            style={{
                                                textAlign: 'right',
                                            }}
                                        >
                                            ₹ {pay()}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 'auto',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <Grid
                                        container
                                        alignItems="center"
                                        // justify="flex-end"
                                    >
                                        <br />
                                        {username == 'New User' ? (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={createUser}
                                                sx={{ width: '100%' }}
                                                disabled={buttonisloading}
                                            >
                                                {' '}
                                                {buttonisloading && (
                                                    <StyledProgress
                                                        size={24}
                                                        className="buttonProgress"
                                                    />
                                                )}
                                                Create New User
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={placeorder}
                                                sx={{
                                                    width: '100%',
                                                    marginBottom: '20px',
                                                }}
                                                disabled={buttonisloading}
                                            >
                                                {' '}
                                                {buttonisloading && (
                                                    <StyledProgress
                                                        size={24}
                                                        className="buttonProgress"
                                                    />
                                                )}
                                                Place Order
                                            </Button>
                                        )}
                                    </Grid>
                                </div>
                                <Dialog
                                    open={openDialog}
                                    onClose={handleDialogClose}
                                >
                                    <DialogTitle>OTP Verification</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            type="text"
                                            value={otp}
                                            onChange={(e) =>
                                                setOTP(e.target.value)
                                            }
                                            label="Enter OTP"
                                            autoFocus
                                            fullWidth
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={handleDialogClose}
                                            color="error"
                                            variant="contained"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={validateOTP}
                                            color="primary"
                                            variant="contained"
                                            disabled={validloading}
                                        >
                                            {validloading && (
                                                <StyledProgress
                                                    size={24}
                                                    className="buttonProgress"
                                                />
                                            )}
                                            Validate OTP
                                        </Button>
                                        <Button
                                            onClick={sendOTP}
                                            color="primary"
                                        >
                                            Resend OTP
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </ValidatorForm>
                        </SimpleCard>
                    </Grid>
                </Grid>
            )}
        </Container>
    )
}

export default MakeOrder
