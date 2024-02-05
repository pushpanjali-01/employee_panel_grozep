import React, { useState } from 'react'
import MaterialTable from 'material-table'
import useAuth from 'app/hooks/useAuth'
import Grid from '@material-ui/core/Grid'
import { useEffect } from 'react'
import { url } from 'app/constants'
import { styled } from '@mui/material'
import { GrozpSnackbar } from 'app/components/'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
function App() {
    const { user } = useAuth()

    const [tableData, setTableData] = useState([])
    const [empoption, setempoptions] = useState([])
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
    useEffect(() => {
        getdata()
    }, [])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const handleShowSnackbar = (msg, type) => {
        setOpen(true)
        setMsg(msg)
        setSeverity(type)
    }

    // const handlePrintBill = (rowData) => {
    //     const allotmentId = rowData.id
    //     url.get(`v1/in/allotments-items?storeAllotmentId=${allotmentId}`)
    //         .then((response) => {
    //             if (response.data.status == true) {
    //                 console.log(response.data.data)
    //                 const printWindow = window.open('', '_blank')
    //                 if (printWindow) {
    //                     const data = response.data.data
    //                     printWindow.document.write(`
    //               <html>
    //                 <head>
    //                   <title>Print Invoice Allotment</title>
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
    //                     <h2 class="invoice-details__title">Order Details</h2>
    //                     <div class="invoice-details__section">
    //                       <strong class="invoice-details__label">Allotment ID:</strong>
    //                       <span class="invoice-details__value">${allotmentId}</span>
    //                     </div>
    //                     <div class="invoice-details__section">
    //                       <strong class="invoice-details__label">Date & Time:</strong>
    //                       <span class="invoice-details__value">${moment(data[0].createdAt).format('LLL')}</span>
    //                     </div>
    //                     <h3 class="invoice-details__title">Items (${data.length})</h3>
    //                     <table class="invoice-details__table">
    //                       <thead>
    //                         <tr>
    //                           <th>Sno</th>
    //                           <th>Item Name</th>
    //                           <th>Price</th>
    //                           <th>Quantity</th>
    //                           <th>Subtotal</th>
    //                         </tr>
    //                       </thead>
    //                       <tbody>
    //                         ${data
    //                             .map(
    //                                 (item, index) => `
    //                               <tr>
    //                                 <td>${index + 1}</td>
    //                                 <td>${item.product_variant.product.brand+','+item.product_variant.product.name}</td>
    //                                 <td>₹${item.mrp}</td>
    //                                 <td>${item.quantity}</td>
    //                                 <td>₹${
    //                                     parseFloat(item.mrp) * item.quantity
    //                                 }</td>
    //                               </tr>
    //                             `
    //                             )
    //                             .join('')}
    //                       </tbody>
    //                     </table>
    //                     <div class="invoice-details__separator" />
    //                     &nbsp;
    //                     &nbsp;
    //                     <div class="invoice-details__total">
    //                       <span class="invoice-details__total-label">Total Amount:</span>
    //                       <span class="invoice-details__total-value">₹${orderAmount}</span>
    //                     </div>
    //                     <div class="invoice-details__total">
    //                       <span class="invoice-details__total-label">Delivery Charge:</span>
    //                       <span class="invoice-details__total-value">₹${deliveryCharge}</span>
    //                     </div>
    //                     <div class="invoice-details__total">
    //                       <span class="invoice-details__total-label">Promo Discount:</span>
    //                       <span class="invoice-details__total-value">₹${couponAmount}</span>
    //                     </div>
    //                     <div class="invoice-details__total">
    //                       <span class="invoice-details__total-label">Loyalty Points:</span>
    //                       <span class="invoice-details__total-value">₹${redeemPoint}</span>
    //                     </div>
    //                     <div class="invoice-details__separator" />
    //                     <div class="invoice-details__footer">
    //                       <p>Thank you for shopping with us!</p>
    //                       <p>For any queries, contact customer support at 8448-444-943.</p>
    //                     </div>
    //                     <script>
    //                       window.onafterprint = function () {
    //                         window.close();
    //                       };
    //                     </script>
    //                   </div>
    //                 </body>
    //               </html>
    //             `)
    //                     printWindow.document.close()
    //                 } else {
    //                     handleShowSnackbar('Allotment id not found!', 'error')
    //                 }
    //             } else {
    //                 handleShowSnackbar('Server error!', 'error')
    //             }
    //         })
    //         .catch((error) => {
    //             handleShowSnackbar('Error fetching data', 'error')
    //         })
    // }

    const getdata = () => {
        url.get(`v1/in/allotments?storeCode=${user.storeCode}`)
            .then((response) => {
                if (response.data.status === true) {
                    setTableData(response.data.data)
                }
            })
            .catch((error) => console.log(error))
        url.get('/v1/in/JHGRH001/employees/')
            .then((response) => {
                if (response.data.status === true) {
                    setempoptions(response.data.data)
                }
            })
            .catch((error) => console.log(error))
    }
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'orange'
            case 'ongoing':
                return 'blue'
            case 'completed':
                return 'green'
            case 'cancelled':
                return 'red'
            default:
                return 'inherit'
        }
    }
    const columns = [
        {
            title: 'SL',
            field: 'tableData.id',
            render: (rowData) => {
                return <p>{rowData.tableData.id + 1}</p>
            },
            editable: 'never',
        },
        {
            title: 'Allotment Id',
            field: 'id',
            defaultSort: 'asc',
        },
        {
            title: 'Status',
            field: 'status',
            cellStyle: (rowData) => ({
                textAlign: 'center',
                color: getStatusColor(rowData),
            }),
        },

        {
            title: 'Employee ID',
            field: 'employeeId',
            render: (rowData) => {
                const selectedOption = empoption.find(
                    (empoption) => empoption.id === rowData.employeeId
                )
                return selectedOption ? selectedOption.domainMail : ''
            },
            customFilterAndSearch: (term, rowData) => {
                const selectedOption = empoption.find(
                    (empoption) => empoption.id === rowData.employeeId
                )
                return selectedOption
                    ? selectedOption.domainMail
                          .toLowerCase()
                          .includes(term.toLowerCase())
                    : false
            },
        },
        // {
        //     title: 'Print Bill',
        //     render: (rowData) => (
        //         <IconButton onClick={() => handlePrintBill(rowData)}>
        //             <PrintIcon style={{ color: 'green' }} />
        //         </IconButton>
        //     ),
        //     sorting: false,
        // },
    ]

    return (
        <Container>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <MaterialTable
                        title="Allotment List"
                        columns={columns}
                        data={tableData}
                        options={{
                            sorting: true,
                            headerStyle: {
                                backgroundColor: '#bff2cd',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#5d615e',
                                textAlign: 'center',
                            },
                            cellStyle: {
                                textAlign: 'center',
                            },
                            // Enable sorting for all columns
                            defaultSort: 'asc',
                        }}
                        // components={{
                        //     Header: (props) => (
                        //       <TableHead>
                        //         <TableRow>
                        //           {props.columns.map((column) => (
                        //             <TableCell
                        //               key={column.title}
                        //               className={classes.centeredHeader}
                        //             >
                        //               {column.title}
                        //               {column.sorting !== false && ( // Add this condition to enable sorting
                        //                 <TableSortLabel
                        //                   active={props.orderBy === column.field}
                        //                   direction={props.orderDirection}
                        //                   onClick={() =>
                        //                     props.onOrderChange(column.field, props.orderDirection === 'asc' ? 'desc' : 'asc')
                        //                   }
                        //                 />
                        //               )}
                        //             </TableCell>
                        //           ))}
                        //         </TableRow>
                        //       </TableHead>
                        //     ),
                        //   }}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default App
