import { Grid, Alert } from '@mui/material'
import MaterialTable, { Editable } from 'material-table'
import { useState } from 'react'
import { url } from 'app/constants'
const TopSellingTable = () => {
    const [tableData, setTableData] = useState([
        {
            code: 'JHGRH002',
            radius: 3,
            city: 'garhwa',
            status: 'inactive',
            location: {
                label: 'other',
                locality: 'garhwa',
                pinCode: 887766,
                nearby: 'near railway road',
                district: 'Garhwa',
                state: 'Jharkhand',
                point: {
                    type: 'Point',
                    coordinates: [83.80390719701957, 24.18273152236848],
                },
            },
        },
    ])
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])

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
            title: 'Branch Code',
            field: 'code',
        },
        {
            title: 'Radius',
            field: 'radius',
        },
        {
            title: 'City',
            field: 'city',
        },
        {
            title: 'Status',
            field: 'status',
        },
        {
            title: 'Label',
            field: 'location.label',
        },
        {
            title: 'Locality',
            field: 'location.locality',
        },
        {
            title: 'Pin Code',
            field: 'location.pinCode',
        },
        {
            title: 'Nearby',
            field: 'location.nearby',
        },
        {
            title: 'District',
            field: 'location.district',
        },
        {
            title: 'State',
            field: 'location.state',
        },
        {
            title: 'Type',
            field: 'location.point.type',
        },
        {
            title: 'coordinates',
            field: 'location.point.coordinates',
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
                url.post('/v1/subcategories/images', formData, config).then(
                    (res) => {
                        const dataToSend = {
                            name: newData.name,
                            categoryId: newData.categoryId,
                            image: res.data.data.image,
                        }

                        url.post('/v1/subcategories', dataToSend)
                            .then((res) => {
                                setTableData([...tableData, dataToSend])

                                // getdata()
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
                    }
                )
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
                url.post('/v1/subcategories/images', formData, config).then(
                    (res) => {
                        const dataToSend = {
                            name: newData.name,
                            description: newData.description,
                            image: res.data.data.image,
                        }

                        url.put('/v1/subcategories/' + newData.id, dataToSend)
                            .then((res) => {
                                const data = [...tableData]
                                data[data.indexOf(oldData)] = newData
                                setTableData(data)
                                resolve()
                                // getdata()
                            })
                            .catch((error) => {
                                setErrorMessages([
                                    'Update failed! Server error',
                                ])
                                setIserror(true)
                                resolve()
                            })
                    }
                )
            } else {
                setErrorMessages(errorList)
                setIserror(true)
                resolve()
            }
        })

    const onRowDelete = (oldData) =>
        new Promise((resolve) => {
            url.delete('/v1/subcategories/' + oldData.id)
                .then((res) => {
                    const data = [...tableData]
                    data.splice(data.indexOf(oldData), 1)
                    setTableData(data)
                    resolve()
                    // getdata()
                })
                .catch((error) => {
                    setErrorMessages(['Delete failed! Server error'])
                    setIserror(true)
                    resolve()
                })
        })

    return (
        <>
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
                        title="Add Store"
                        columns={columns}
                        data={tableData}
                        editable={{
                            onRowAdd,
                            onRowUpdate,
                            onRowDelete,
                        }}
                        style={{ padding: '0 10px' }}
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
                <Grid item xs={3}></Grid>
            </Grid>
        </>
    )
}

export default TopSellingTable
