import React, { useState } from 'react'
import MaterialTable from 'material-table'
import Grid from '@material-ui/core/Grid'
import { useEffect } from 'react'
import PrintIcon from '@mui/icons-material/Print'
import { url } from 'app/constants'
import { styled } from '@mui/material'
import { IconButton } from '@material-ui/core'
import { GrozpSnackbar } from 'app/components/'
import useAuth from 'app/hooks/useAuth'
import '../dashboard/graph/dashboard.css'
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

    const handlePrintBill = (rowData) => {
        url.get(`v1/in/allotments-items?storeAllotmentId=${rowData.id}`)
            .then((response) => {
                if (response.data.status === true) {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        const data = response.data.data

                        printWindow.document.write(`
                <html>
                  <head>
                    <title>Print Store Allotment</title>
                    <style>
                      /* Add your custom styles for the printable invoice here */
                      /* For example: */
                      .invoice-details {
                        /* styles for the invoice details section */
                      }
                      
                      .invoice-details__table {
                        border-collapse: collapse;
                        width: 100%;
                      }
                      
                      .invoice-details__table th,
                      .invoice-details__table td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                      }
                      
                      .invoice-details__table th {
                        background-color: #f2f2f2;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="invoice-details">
                      <h2 class="invoice-details__title">Allotment Details</h2>
                      <div class="invoice-details__section">
                        <strong class="invoice-details__label">Allotemnt ID:</strong>
                        <span class="invoice-details__value">${
                            rowData.id
                        }</span>
                      </div>
                      <div class="invoice-details__section">
                        <strong class="invoice-details__label">Date & Time:</strong>
                        <span class="invoice-details__value">${
                            data.createdAt
                        }</span>
                      </div>
                   

                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">StoreCode:</strong>
                      <span class="invoice-details__value">${data.storeCode}(${
                            data.storeName
                        })</span>
                    </div>

                    <div class="invoice-details__section">
                    <strong class="invoice-details__label">Status:</strong>
                    <span class="invoice-details__value">${data.status}</span>
                  </div>
                      <div class="invoice-details__separator" />
                      <h3 class="invoice-details__title">Items (${
                          data.items.length
                      })</h3>
                      <table class="invoice-details__table">
                        <thead>
                          <tr>
                            <th>Sno</th>
                            <th>Vid</th>
                            <th>Item Name</th>
                            <th>Size</th>
                            <th>MRP</th>
                            <th>Rate</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Remove Quantity</th>
                          
                          </tr>
                        </thead>
                        <tbody>
                          ${data.items
                              .map(
                                  (item, index) => `
                                <tr>
                                  <td>${index + 1}</td>
                                  <td>${item.productVariantId}</td>
                                  <td>${item.name}</td>
                                  <td>${item.productSize} </td>
                                  <td>${item.retailPrice}</td>
                                  <td>${item.costPrice}</td>
                                  <td>${item.quantity}</td>
                                  <td>${(
                                      item.costPrice * item.quantity
                                  ).toFixed(2)}</td>
                                  <td style="
                                  ${item.removedQty > 0 ? 'color: red;' : ''}
                                  ${
                                      item.removedQty > 0
                                          ? 'background-color: white;'
                                          : ''
                                  }
                                ">
                                  ${item.removedQty}
                                </td> 
                                </tr>
                              `
                              )
                              .join('')}
                        </tbody>
                      </table>
                      <div class="invoice-details__separator" />
                      &nbsp;
                      &nbsp;
                      <div class="invoice-details__total">
                      <span class="invoice-details__total-label">Total Amount:</span>
                      <span class="invoice-details__total-value">₹${data.subtotalAmount.toFixed(
                          2
                      )}</span>
                      </div>
                      <div class="invoice-details__total">
                      <span class="invoice-details__total-label">Return Amount:</span>
                      <span class="invoice-details__total-value">₹${
                          data.subtotalAmount - data.totalAmount
                      }</span>
                      <div>
                      <div class="invoice-details__total">
                      <span class="invoice-details__total-label">Payable Amount:</span>
                      <span class="invoice-details__total-value">₹${data.totalAmount.toFixed(
                          2
                      )}</span>
                    </div>
                    </div>
                    <script>
                      window.onafterprint = function() {
                        window.close();
                      };
                    </script>
                  </body>
                </html>
              `)
                        printWindow.document.close()
                    } else {
                        console.error('Failed to open the print window.')
                    }
                } else {
                    handleShowSnackbar('Order ID not found!', 'error')
                }
            })
            .catch((error) => {
                handleShowSnackbar('Error fetching data', 'error')
            })
    }

    const getdata = () => {
        const headers = {
            inventorycode: user.storeCode, // Replace with your actual inventory code
        }
        url.get('v1/store/allotments', {
            headers: headers,
        })
            .then((response) => {
                if (response.data.status === true) {
                    setTableData(response.data.data)
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
            title: 'Sr no',
            field: 'tableData.id',
            render: (rowData) => {
                return <p>{rowData.tableData.id + 1}</p>
            },
            editable: 'never',
        },
        {
            title: 'Date',
            field: 'createdAt',
        },
        {
            title: 'Allotment Id',
            field: 'id',
            // defaultSort: 'desc',
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
            title: 'Store Location', // Change to the desired column title
            field: 'storeName',
        },
        {
            title: 'Store Code', // Change to the desired column title
            field: 'storecode',
        },
        {
            title: 'Total Amount', // Change to the desired column title
            field: 'totalAmount',
        },
        {
            title: 'Employee ID',
            field: 'employeeMail',
        },
        {
            title: 'Print Bill',
            render: (rowData) => (
                <IconButton onClick={() => handlePrintBill(rowData)}>
                    <PrintIcon style={{ color: 'green' }} />
                </IconButton>
            ),
            sorting: false,
        },
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
                        title="Store Allotment List"
                        columns={columns}
                        data={tableData}
                        options={{
                            sorting: true,
                            headerStyle: {
                                backgroundColor: '#424964', // Background color for table header
                                color: 'white', // Text color for table header (optional)
                                whiteSpace: 'nowrap',
                            },

                            cellStyle: {
                                whiteSpace: 'nowrap',
                            },
                            pageSize: 10,
                            defaultSort: 'asc',
                        }}
                        components={{
                            Container: (props) => (
                                <div {...props} className="custom-table" />
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default App
