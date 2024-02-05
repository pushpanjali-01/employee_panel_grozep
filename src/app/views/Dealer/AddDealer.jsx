import React, { useState } from 'react'
import MaterialTable from 'material-table'
import { url } from 'app/constants'
import { useEffect } from 'react'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import AddBox from '@material-ui/icons/AddBox'
import Edit from '@material-ui/icons/Edit'
import useAuth from 'app/hooks/useAuth'
import { forwardRef } from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { styled } from '@mui/material'
const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: { margin: '16px' },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
    },
}))
function AddDealer() {
    const { user } = useAuth()
    const [tableData, setTableData] = useState([])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    const [inventoryId, setinventoryId] = useState('')
    useEffect(() => {
        getdata()
    }, [])

    const getdata = async () => {
        try {
            // Fetch the inventory data to get the correct inventoryId
            const inventoryResponse = await url.get(
                `v1/in/inventory?inventoryCode=${user.storeCode}`
            )
            // Check the response of the inventory API
            if (inventoryResponse.data.status === true) {
                const inventoryId = inventoryResponse.data.data[0].id
                setinventoryId(inventoryId)
                // Fetch the dealers based on the inventoryId
                const dealersResponse = await url.get(
                    `v1/in/dealers?inventoryId=${inventoryId}`
                )

                // Check the response of the dealers API
                if (dealersResponse.data.status === true) {
                    setTableData(dealersResponse.data.data)
                } else {
                    // Handle the case where dealers response status is not true
                }
            } else {
                // Handle the case where inventory response status is not true
            }
        } catch (error) {
            console.log('Error:', error)
        }
    }
    const tableIcons = {
        Add: forwardRef(() => <AddBox style={{ color: 'green' }} />),
        Edit: forwardRef(() => <Edit style={{ color: 'orange' }} />),
        Delete: forwardRef(() => (
            <DeleteForeverIcon style={{ color: 'red' }} />
        )),
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
            title: 'Name',
            field: 'name',
            validate: (row) => (row.name || '').length !== 0,
        },
        {
            title: 'Phone',
            field: 'phone',
            validate: (row) => {
                const phoneNumber = (row.phone || '').trim()
                const phoneRegex = /^\d{10}$/ // Assuming a 10-digit phone number format

                return phoneNumber.length !== 0 && phoneRegex.test(phoneNumber)
            },
        },
        {
            title: 'Email',
            field: 'email',
            validate: (row) => {
                const email = (row.email || '').trim()
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation regex

                return email.length !== 0 && emailRegex.test(email)
            },
        },
        {
            title: 'Category',
            field: 'category',
            validate: (row) => (row.category || '').length !== 0,
        },
        {
            title: 'Address',
            field: 'address',
            validate: (row) => (row.address || '').length !== 0,
        },
    ]

    const onRowAdd = (newData) =>
        new Promise((resolve) => {
            const dataToSend = {
                name: newData.name,
                phone: newData.phone,
                email: newData.email,
                category: newData.category,
                address: newData.address,
                inventoryId: inventoryId,
            }

            url.post('v1/in/dealers', dataToSend)
                .then((res) => {
                    setTableData([...tableData, dataToSend])
                    getdata()
                    resolve()
                    setIserror(false)
                    setErrorMessages([])
                })
                .catch((error) => {
                    setErrorMessages(['Cannot add data. Server error!'])
                    setIserror(true)
                    resolve()
                })
        })

    const onRowUpdate = (newData, oldData) =>
        new Promise((resolve) => {
            let errorList = []
            if (newData.name === undefined) {
                errorList.push('Please Enter City Name')
            }
            if (errorList.length < 1) {
                url.put('v1/in/dealers/' + newData.id, newData)
                    .then((res) => {
                        const data = [...tableData]
                        data[data.indexOf(oldData)] = newData
                        setTableData(data)
                        resolve()
                        getdata()
                    })
                    .catch((error) => {
                        setErrorMessages(['Update failed! Server error'])
                        setIserror(true)
                        resolve()
                    })
            } else {
                setErrorMessages(errorList)
                setIserror(true)
                resolve()
            }
        })

    const onRowDelete = (oldData) =>
        new Promise((resolve) => {
            url.delete('v1/in/dealers/' + oldData.id)
                .then((res) => {
                    const data = [...tableData]
                    data.splice(data.indexOf(oldData), 1)
                    setTableData(data)
                    resolve()
                    getdata()
                })
                .catch((error) => {
                    setErrorMessages(['Delete failed! Server error'])
                    setIserror(true)
                    resolve()
                })
        })

    return (
        <>
            <Container>
                <div className="App">
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <div>
                                {iserror && (
                                    <Alert severity="error">
                                        {errorMessages.map((msg, i) => {
                                            return <div key={i}>{msg}</div>
                                        })}
                                    </Alert>
                                )}
                            </div>

                            <MaterialTable
                                title="Add Dealer"
                                columns={columns}
                                data={tableData}
                                editable={{
                                    onRowAdd,
                                    onRowUpdate,
                                    onRowDelete,
                                }}
                                icons={tableIcons}
                                style={{ padding: '0 20px' }}
                                options={{
                                    headerStyle: {
                                        backgroundColor: '#bff2cd',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    },
                                    rowStyle: {
                                        alignItems: 'center',
                                        textAlign: 'center',
                                    },
                                    actionsColumnIndex: -1,
                                    addRowPosition: 'first',
                                    toolbarButtonAlignment: 'left',
                                    pageSize: 10,
                                }}
                            />
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </>
    )
}

export default AddDealer
