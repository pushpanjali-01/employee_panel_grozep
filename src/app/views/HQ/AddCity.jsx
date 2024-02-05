import React, { useState } from 'react'
import MaterialTable from 'material-table'
import { url } from 'app/constants'
import { useEffect } from 'react'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import AddBox from '@material-ui/icons/AddBox'
import Edit from '@material-ui/icons/Edit'
import { forwardRef } from 'react'
import Switch from '@material-ui/core/Switch'
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
function AddCity() {
    const [tableData, setTableData] = useState([])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])

    useEffect(() => {
        getdata()
    }, [])

    const getdata = () => {
        try {
            url.get('/v1/in/cities')
                .then((res) => {
                    setTableData(res.data.data)
                })
                .catch((error) => {
                    console.log('Error')
                })
        } catch {
            console.log('Error')
        }
    }
    const tableIcons = {
        Add: forwardRef(() => <AddBox style={{ color: 'green' }} />),
        Edit: forwardRef(() => <Edit style={{ color: 'orange' }} />),
        // Delete: forwardRef(() => (
        //     <DeleteForeverIcon style={{ color: 'red' }} />
        // )),
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
            title: 'State',
            field: 'state',
            validate: (row) => (row.state || '').length !== 0,
        },
        {
            title: 'Status',
            field: 'status',

            render: (rowData) => (
                <Switch checked={rowData.status} color="primary" disabled />
            ),
            editComponent: ({ value, onChange }) => (
                <Switch
                    checked={value}
                    onChange={(event) => onChange(event.target.checked)}
                    color="primary"
                />
            ),
        },
    ]

    const onRowAdd = (newData) =>
        new Promise((resolve) => {
            let errorList = []

            if (newData.name === undefined) {
                errorList.push('Please Enter City Name')
            }
            if (newData.state === undefined) {
                errorList.push('Please Enter State Name')
            }
            if (errorList.length < 1) {
                const dataToSend = {
                    name: newData.name,
                    status: newData.status,
                    state: newData.state,
                }

                url.post('v1/in/cities', dataToSend)
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
            } else {
                setErrorMessages(errorList)
                setIserror(true)
                resolve()
            }
        })

    const onRowUpdate = (newData, oldData) =>
        new Promise((resolve) => {
            let errorList = []
            if (newData.name === undefined) {
                errorList.push('Please Enter City Name')
            }
            if (errorList.length < 1) {
                url.put('v1/in/cities/' + newData.id, newData)
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
            url.delete('v1/in/cities/' + oldData.id)
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
                        {/* <Grid item xs={3}></Grid> */}
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
                                title="Add City"
                                columns={columns}
                                data={tableData}
                                editable={{
                                    onRowAdd,
                                    onRowUpdate,
                                    // onRowDelete,
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
                                    toolbarButtonAlignment: 'left',
                                }}
                            />
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </>
    )
}

export default AddCity
