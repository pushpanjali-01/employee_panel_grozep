import React, { useState } from 'react'
import MaterialTable from 'material-table'
import { useEffect } from 'react'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { forwardRef } from 'react'
import AddBox from '@material-ui/icons/AddBox'
import Edit from '@material-ui/icons/Edit'
import { url, media_Url } from 'app/constants'
// import { getBrandList, deletebrand } from 'app/redux/actions/EcommerceActions'

// import { useSelector, useDispatch } from 'react-redux'
function AddBrand() {
    const [tableData, setTableData] = useState([])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    // const tableData = useSelector((state) => state.ecommerce.brandList) // Replace with the actual slice of state you want to retrieve
    // const dispatch = useDispatch()
    useEffect(() => {
        getdata()
    }, [])
    // useEffect(() => {
    //     dispatch(getBrandList())
    //     // dispatch(deletebrand('256'))
    //     // Dispatch the Redux action
    // }, [dispatch])

    const getdata = () => {
        try {
            url.get('v1/in/brands')
                .then((res) => {
                    if (res.data.status === true) {
                        setTableData(res.data.data)
                    }
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
    ]

    const onRowAdd = (newData, resolve) =>
        new Promise((resolve) => {
            let errorList = []
            if (newData.image === undefined) {
                errorList.push('Please Upload Brand Image')
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
                    .post('v1/brands/images', formData, config)
                    .then((res) => {
                        const dataToSend = {
                            name: newData.name,
                            image: res.data.data.image,
                        }

                        url.post('v1/in/brands', dataToSend)
                            .then((res) => {
                                getdata()
                                resolve()
                                setIserror(false)
                                setErrorMessages([])
                                // dispatch(getBrandList())
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
            if (newData.name === '') {
                errorList.push('Please enter Brand name')
            }
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
                        .post('v1/brands/images', formData, config)
                        .then((res) => {
                            const dataToSend = {
                                name: newData.name,
                                image: res.data.data.image,
                            }
                            url.put('v1/in/brands/' + newData.id, dataToSend)
                                .then((res) => {
                                    getdata()

                                    // dispatch(getBrandList())
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
                        'https://media.grozep.com/images/brands/',
                        ''
                    )
                    const dataToSend = {
                        name: newData.name,
                        image: brandimg,
                    }
                    url.put('v1/in/brands/' + newData.id, dataToSend)
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
            url.delete('v1/in/brands/' + oldData.id)
                .then((res) => {
                    const data = [...tableData]
                    // dispatch(getBrandList())
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
                            title="Add Brands"
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
                                maxBodyHeight: 'calc(100vh - 300px)', // set a ma
                            }}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default AddBrand
