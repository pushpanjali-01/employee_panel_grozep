// import React, { useState, useEffect } from 'react'
// import { MDBDataTable } from 'mdbreact'
// import useAuth from 'app/hooks/useAuth'
// import { url } from 'app/constants'

// const DeliveryBoyZoneList = () => {
//     const { user } = useAuth()
//     const [data, setData] = useState([])

//     useEffect(() => {
//         try {
//             url.get(
//                 'v1/in/deliveries/zones/allocations?storecode=' + user.storeCode
//             )
//                 .then((res) => {
//                     if (res.data.status === true) {
//                         setData(res.data.data)
//                     }
//                 })
//                 .catch((error) => {
//                     console.log('Error')
//                 })
//         } catch {
//             console.log('Error')
//         }
//     }, [])

//     const tableData = data.map((item, index) => ({
//         sno: index + 1,
//         Zone: item.label,
//         storecode: item.storecode,
//         status: item.status,
//         domainMail:
//             item.delivery_zone_allocations[0]?.employee.domainMail || '',
//     }))
//     const tableHeaders = [
//         {
//             label: 'S no',
//             field: 'sno',
//             sort: 'asc',
//         },
//         {
//             label: 'Delivery Boy',
//             field: 'domainMail',
//             sort: 'asc',
//         },
//         {
//             label: 'Zone',
//             field: 'Zone',
//             sort: 'asc',
//         },
//         {
//             label: 'Store Code',
//             field: 'storecode',
//             sort: 'asc',
//         },
//     ]

//     return (
//         <div className="table-responsive">
//             <MDBDataTable
//                 responsive
//                 striped
//                 bordered
//                 hover
//                 noBottomColumns={true}
//                 data={{ columns: tableHeaders, rows: tableData }}
//             />
//         </div>
//     )
// }

// export default DeliveryBoyZoneList
