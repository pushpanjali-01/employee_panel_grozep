import React, { useState } from 'react'
import MaterialTable from 'material-table'
import Grid from '@material-ui/core/Grid'
import { useEffect } from 'react'
import PrintIcon from '@mui/icons-material/Print'
import { url } from 'app/constants'
import { styled } from '@mui/material'
import moment from 'moment'
import { IconButton } from '@material-ui/core'
import '../dashboard/graph/dashboard.css'
import { GrozpSnackbar } from 'app/components/'
import useAuth from 'app/hooks/useAuth'
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
    const [options, setOptions] = useState([])
    const [empoption, setempoptions] = useState([])
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')

    useEffect(() => {
        getdata()
    }, [])

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
        url.get(`v1/in/dealers-items?dealerAllotmentId=${rowData.id}`)
            .then((response) => {
                if (response.data.status === true) {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                        const items = response.data.data
                        const formattedDateTime = moment(
                            items[0].createdAt
                        ).format('LLL') // Format the date and time

                        printWindow.document.write(`
                <html>
                  <head>
                    <title>Print Dealer Allotment</title>
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
                        <span class="invoice-details__value">${formattedDateTime}</span>
                      </div>
                      <div class="invoice-details__section">
                        <strong class="invoice-details__label">Dealer Name:</strong>
                        <span class="invoice-details__value">${getEmployeeEmailById(
                            rowData.dealerId
                        )}</span>
                      </div>

                      <div class="invoice-details__section">
                      <strong class="invoice-details__label">Status:</strong>
                      <span class="invoice-details__value">${
                          rowData.status
                      }</span>
                    </div>
                      <div class="invoice-details__separator" />
                      <h3 class="invoice-details__title">Items (${
                          items.length
                      })</h3>
                      <table class="invoice-details__table">
                        <thead>
                          <tr>
                            <th>Sno</th>
                            <th>Item Name</th>
                            <th>Size</th>
                            <th>MRP</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items
                              .map(
                                  (item, index) => `
                                <tr>
                                  <td>${index + 1}</td>
                                  <td>${item.product_variant.product.brand}, ${
                                      item.product_variant.product.name
                                  }</td>
                                  <td>${
                                      item.product_variant.product_size.value
                                  } ${
                                      item.product_variant.product_size.unit
                                  }</td>
                                  <td>
                                  ${
                                      item.product_variant.inventory_listings
                                          .length > 0 &&
                                      item.product_variant.inventory_listings[0]
                                          .inventory_stocks.length > 0
                                          ? item.product_variant
                                                .inventory_listings[0]
                                                .inventory_stocks[0].retailPrice
                                          : 'New'
                                  }
                                </td>
                                  <td>${item.quantity}</td>
                                </tr>
                              `
                              )
                              .join('')}
                        </tbody>
                      </table>
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

    const getEmployeeEmailById = (did) => {
        const employee = options.find((employee) => employee.id === did)
        return employee ? employee.name : ''
    }
    const getdata = async () => {
        // url.get('v1/in/dealers')
        //     .then((response) => {
        //         if (response.data.status === true) {
        //             setOptions(response.data.data)
        //         }
        //     })
        //     .catch((error) => console.log(error))
        // Fetch the inventory data to get the correct inventoryId
        const inventoryResponse = await url.get(
            `v1/in/inventory?inventoryCode=${user.storeCode}`
        )
        // Check the response of the inventory API
        if (inventoryResponse.data.status === true) {
            const inventoryId = inventoryResponse.data.data[0].id
            // Fetch the dealers based on the inventoryId
            const dealersResponse = await url.get(
                `v1/in/dealers?inventoryId=${inventoryId}`
            )

            // Check the response of the dealers API
            if (dealersResponse.data.status === true) {
                setOptions(dealersResponse.data.data)
                url.get(`v1/in/dealers/allotments?inventoryId=${inventoryId}`)
                    .then((response) => {
                        if (response.data.status === true) {
                            setTableData(response.data.data)
                        }
                    })
                    .catch((error) => console.log(error))
                const datatosend = {
                    role: user.role,
                    storeCode: user.storeCode,
                }
                url.post('v1/in/employees/role', datatosend)
                    .then((response) => {
                        if (response.data.status === true) {
                            setempoptions(response.data.data)
                        }
                    })
                    .catch((error) => console.log(error))
            } else {
                // Handle the case where dealers response status is not true
            }
        } else {
            // Handle the case where inventory response status is not true
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
            render: (rowData) => {
                return moment(rowData.createdAt).format('LLL')
            },
        },
        {
            title: 'Allotment Id',
            field: 'id',
            defaultSort: 'desc',
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
            title: 'Dealer',
            field: 'dealerId',
            render: (rowData) => {
                const selectedOption = options.find(
                    (option) => option.id === rowData.dealerId
                )
                return selectedOption ? selectedOption.name : ''
            },
            customFilterAndSearch: (term, rowData) => {
                const selectedOption = options.find(
                    (option) => option.id === rowData.dealerId
                )
                return selectedOption
                    ? selectedOption.name
                          .toLowerCase()
                          .includes(term.toLowerCase())
                    : false
            },
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
                        title="Dealer Allotment list"
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
