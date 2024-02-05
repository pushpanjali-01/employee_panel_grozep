import React, { useState } from 'react'
import MaterialTable from 'material-table'
import Select from '@mui/material/Select'
import Alert from '@material-ui/lab/Alert'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@material-ui/core/Grid'
import { useEffect } from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { forwardRef } from 'react'
import AddBox from '@material-ui/icons/AddBox'
import Edit from '@material-ui/icons/Edit'
import { media_Url, url } from 'app/constants'
function App() {
    const [tableData, setTableData] = useState([])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    const [options, setOptions] = useState([])

    useEffect(() => {
        getdata()
    }, [])

    const getdata = () => {
        url.get('v1/in/categories')
            .then((response) => {
                if (response.data.status === true) {
                    setOptions(response.data.data)
                }
            })
            .catch((error) => console.log(error))
        url.get('v1/in/subcategories')
            .then((response) => {
                if (response.data.status === true) {
                    setTableData(response.data.data)
                }
            })
            .catch((error) => console.log(error))
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
            title: 'Category Name',
            field: 'categoryId',
            validate: (row) => (row.categoryId || '').length !== 0,
            render: (rowData) => {
                const selectedOption = options.find(
                    (option) => option.id === rowData.categoryId
                )
                return selectedOption ? selectedOption.name : ''
            },
            editComponent: (props) => (
                <Select
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value)}
                >
                    {options.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Description',
            field: 'description',
            render: (rowData) =>
                rowData.description,
            validate: (row) => (row.description || '').length !== 0,
        },
    ]

    const onRowAdd = (newData) =>
        new Promise((resolve) => {
            let errorList = []
            if (newData.name === undefined) {
                errorList.push('Please enter Sub Category name')
            }
            if (newData.image === undefined) {
                errorList.push('Please Upload Sub Category image')
            }
            if (newData.categoryId === undefined) {
                errorList.push('Please Select Category Type')
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
                    .post('v1/subcategories/images', formData, config)
                    .then((res) => {
                        const dataToSend = {
                            name: newData.name,
                            categoryId: newData.categoryId,
                            image: res.data.data.image,
                            description: newData.description,
                        }

                        url.post('v1/in/subcategories', dataToSend)
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
                errorList.push('Please Upload Sub Category image')
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
                        .post('v1/subcategories/images', formData, config)
                        .then((res) => {
                            const dataToSend = {
                                name: newData.name,
                                description: newData.description,
                                image: res.data.data.image,
                                categoryId: newData.categoryId.toString(),
                            }
                            url.put(
                                'v1/in/subcategories/' + newData.id,
                                dataToSend
                            )
                                .then((res) => {
                                    console.log(res)
                                    const data = [...tableData]
                                    data[data.indexOf(oldData)] = newData
                                    setTableData(data)
                                    resolve()
                                    getdata()
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
                        'https://media.grozep.com/images/subcategories/',
                        ''
                    )

                    const dataToSend = {
                        name: newData.name,
                        image: brandimg,
                        categoryId: newData.categoryId,
                        description: newData.description,
                    }
                    url.put('v1/in/subcategories/' + newData.id, dataToSend)
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
                }
            } else {
                setErrorMessages(errorList)
                setIserror(true)
                resolve()
            }
        })

    const onRowDelete = (oldData) =>
        new Promise((resolve) => {
            url.delete('v1/in/subcategories/' + oldData.id)
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
                            title="Add SubCategory"
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
                    <Grid item xs={3}></Grid>
                </Grid>
            </div>
        </>
    )
}

export default App
