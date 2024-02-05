import React, { useState } from 'react'
import MaterialTable from 'material-table'
import Alert from '@material-ui/lab/Alert'
import { forwardRef } from 'react'
import Grid from '@material-ui/core/Grid'
import { useEffect } from 'react'
import AddBox from '@material-ui/icons/AddBox'
import Edit from '@material-ui/icons/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { url, media_Url } from 'app/constants'
function App() {
    const [tableData, setTableData] = useState([])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])

    useEffect(() => {
        getdata()
    }, [])
    const getdata = () => {
        url.get('v1/in/categories')
            .then((res) => {
                if (res.data.status === true) {
                    setTableData(res.data.data)
                }
            })
            .catch((error) => {
                console.log('Error')
            })
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
            title: 'Image',
            field: 'image',
            render: (rowData) => (
                <img
                    src={rowData.imageUrl}
                    alt={rowData.name}
                    style={{
                        width: 50,
                        height: 50,
                        border: '1px solid  #d1d1e0',
                        borderRadius: 4,
                    }}
                />
            ),
            editComponent: (props) => (
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => props.onChange(e.target.files[0])}
                />
            ),
        },
        {
            title: 'Name',
            field: 'name',
            validate: (row) => (row.name || '').length !== 0,
        },
        {
            title: 'Description',
            field: 'description',
            render: (rowData) => {
                if (
                    rowData.description !== '' ||
                    rowData.description !== null ||
                    rowData.description !== 'null'
                ) {
                    return rowData.description
                }
                return ''
            },
            validate: (row) => (row.description || '').length !== 0,
        },
    ]

    const onRowAdd = (newData) =>
        new Promise((resolve) => {
            let errorList = []
            if (newData.image === undefined) {
                errorList.push('Please Upload Brand image')
            }
            if (errorList.length < 1) {
                const formData = new FormData()
                formData.append('image', newData.image)
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                }
                media_Url
                    .post('v1/categories/images', formData, config)
                    .then((res) => {
                        const dataToSend = {
                            name: newData.name,
                            description: newData.description,
                            image: res.data.data.image,
                        }
                        let errorList = []
                        if (newData.image === undefined) {
                            errorList.push('Please Upload branch image')
                        }
                        if (errorList.length < 1) {
                            url.post('v1/in/categories', dataToSend)
                                .then((res) => {
                                    getdata()
                                    resolve()
                                    setIserror(false)
                                    setErrorMessages([])
                                })
                                .catch((error) => {
                                    setErrorMessages([
                                        'Cannot add data. Server error!',
                                    ])
                                    setIserror(true)
                                    resolve()
                                })
                        } else {
                            setErrorMessages(errorList)
                            setIserror(true)
                            resolve()
                        }
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
            if (newData.image === '') {
                errorList.push('Please Upload Brand image')
            }
            if (errorList.length < 1) {
                if (newData.image) {
                    const formData = new FormData()
                    formData.append('image', newData.image)
                    const config = {
                        headers: {
                            'content-type': 'multipart/form-data',
                        },
                    }
                    media_Url
                        .post('v1/categories/images', formData, config)
                        .then((res) => {
                            const dataToSend = {
                                name: newData.name,
                                description: newData.description,
                                image: res.data.data.image,
                            }
                            url.put(
                                'v1/in/categories/' + newData.id,
                                dataToSend
                            )
                                .then((res) => {
                                    getdata()
                                    const data = [...tableData]
                                    data[data.indexOf(oldData)] = newData
                                    setTableData(data)
                                    resolve()
                                })
                                .catch((error) => {
                                    setErrorMessages([
                                        'Update failed! Server error',
                                    ])
                                    setIserror(true)
                                    resolve()
                                })
                        })
                } else {
                    const brandimg = oldData.imageUrl.replace(
                        'https://media.grozep.com/images/categories/',
                        ''
                    )
                    const dataToSend = {
                        name: newData.name,
                        description: newData.description,
                        image: brandimg,
                    }
                    url.put('v1/in/categories/' + newData.id, dataToSend)
                        .then((res) => {
                            const data = [...tableData]
                            data[data.indexOf(oldData)] = newData
                            setTableData(data)
                            resolve()
                        })
                        .catch((error) => {
                            setErrorMessages(['Update failed! Server error'])
                            setIserror(true)
                            resolve()
                        })
                }
            } else {
                setErrorMessages(errorList)
                setIserror(true)
                resolve()
            }
        })

    const onRowDelete = (oldData) =>
        new Promise((resolve) => {
            url.delete('v1/in/categories/' + oldData.id)
                .then((res) => {
                    const data = [...tableData]
                    data.splice(data.indexOf(oldData), 1)
                    setTableData(data)
                    resolve()
                })
                .catch((error) => {
                    setErrorMessages(['Delete failed! Server error'])
                    setIserror(true)
                    resolve()
                })
        })

    return (
        <>
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
                            title="Add Category "
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
                                    color: '#5d615e',
                                },
                                rowStyle: {
                                    alignItems: 'center',
                                    textAlign: 'center',
                                },
                                actionsColumnIndex: -1,
                                toolbarButtonAlignment: 'left',
                                paging: true,

                                showFirstLastPageButtons: false,
                                addRowPosition: 'first',
                                stickyHeader: true, // enable sticky headers
                                maxBodyHeight: 'calc(100vh - 300px)', // s
                            }}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default App
