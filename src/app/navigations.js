export const navigations = [
    //dashboard
    {
        name: 'Dashboard',
        path: '/dashboard/default',
        icon: 'dashboard',
    },


    // cashier role start
// orders
{
    name: 'POS',
    icon:  'store',
    roles: ['Cashier'],

    children: [
        {
            name: 'Make Order',
            iconText: 'SI',
            path: '/pos/make-order',
            roles: ['Cashier'],
        },
        {
            name: 'Offline Orders',
            iconText: 'SI',
            path: '/pos/offline-orders',
            roles: ['Cashier'],
        },
    ],
},
{
    label: 'USER MANAGEMENT',
    type: 'label',
    roles: ['Cashier'],
},
// Users
{
    name: 'Users',
    icon:  'man',
    roles: ['Cashier','QualityAssociate'],

    children: [
        {
            name: 'Add User',
            iconText: 'SI',
            path: '/users/add-user',
            roles: ['Cashier','QualityAssociate'],
        },
        {
            name: 'User All Orders',
            iconText: 'SI',
            path: '/users/user-all-orders',
            roles: ['Cashier','QualityAssociate'],
        },
        {
            name: 'User Order Cancel',
            iconText: 'SI',
            path: '/users/user-order-cancel',
            roles: ['Cashier','QualityAssociate'],
        },
    ],
},
    
// orders
{
    label: 'ORDER MANAGEMENT',
    type: 'label',
    roles: ['Cashier'],
},
{
    name: 'Orders',
    icon: 'layers',
    roles: ['Cashier'],
    children: [
       
        {
            name: 'Order Queue',
            iconText: 'SI',
            path: '/orders/orders',
            roles: ['Cashier'],
           
        },
        {
            name: 'Pending',
            iconText: 'SI',
            path: '/orders/pending-orders',
            roles: ['Cashier'],
        },
        {
            name: 'Prepared ',
            iconText: 'SI',
            path: '/orders/prepared-orders',
            roles: ['Cashier'],
        },
        {
            name: 'Packed',
            iconText: 'SI',
            path: '/orders/packed-orders',
            roles: ['Cashier'],
        },
        {
            name: 'Delivered',
            iconText: 'SI',
            path: '/orders/delivered-orders',
            roles: ['Cashier'],
        },
        {
            name: 'Cancel',
            iconText: 'SI',
            path: '/orders/cancel-orders',
            roles: ['Cashier'],
        },
        {
            name: 'Return',
            iconText: 'SI',
            path: '/orders/return-orders',
            roles: ['Cashier'],
        },
        {
            name: 'All Orders',
            iconText: 'SI',
            path: '/orders/all-orders',
            roles: ['Cashier'],
        },
        // {
        //     name: 'Update Order',
        //     iconText: 'SI',
        //     path: '/orders/order-update',
        //     roles: ['Cashier'],
        // },
        
        {
            name: 'Update Packaging Boy',
            iconText: 'SI',
            path: 'store/update-packaging-boy',
            roles: ['Cashier'],
        },
        {
            name: 'Update Delivery Boy',
            iconText: 'SI',
            path: 'store/update-delivery-boy',
            roles: ['Cashier'],
        },
    
      
    ],
},
// end cashier role


// Quality Associate role



{
    label: 'ORDER MANAGEMENT',
    type: 'label',
    roles: ['QualityAssociate'],
},
{
    name: 'Orders',
    icon: 'layers',
    roles: ['QualityAssociate'],
    children: [

        {
            name: 'Pending',
            iconText: 'SI',
            path: '/orders/pending-orders',
            roles: ['Cashier'],
        },
{
    name: 'Cancel',
    iconText: 'SI',
    path: '/orders/cancel-orders',
    roles: ['QualityAssociate'],
},
{
    name: 'Return',
    iconText: 'SI',
    path: '/orders/return-orders',
    roles: ['QualityAssociate'],
},
      
{
    name: 'Update Packaging Boy',
    iconText: 'SI',
    path: 'store/update-packaging-boy',
    roles: ['QualityAssociate'],
},
{
    name: 'Update Delivery Boy',
    iconText: 'SI',
    path: 'store/update-delivery-boy',
    roles: ['QualityAssociate'],
},
],
},
// end Quality Associate role



// scanner role wise menu
{
    name: 'Scanner',
    iconText: 'SI',
    path: '/Scanner/Scanner',
    roles: ['scanner'],
},
{
    label: 'ORDER MANAGEMENT',
    type: 'label',
    roles: ['scanner'],
},
{
    name: 'Orders',
    icon: 'layers',
    roles: ['scanner'],
    children: [
{
    name: 'Packed Processing ',
    iconText: 'SI',
    path: '/orders/packed-processing',
    roles: ['scanner'],
},
{
    name: 'Prepared',
    iconText: 'SI',
    path: '/orders/prepared-orders',
    roles: ['scanner'],
},
],
},

// end scanner role wise menu

{
    name: 'Order Details',
    icon: 'article',
    path: '/orders/order-details',

},
{
    name: 'Print Invoice',
    path: '/orders/print-bill',
    icon: 'article',

},
// Zone management
// {
//     label: 'ZONE MANAGEMENT',
//     type: 'label',
//     roles: ['Cashier','StoreAdmin'],
// },
// {
//     name: 'Zone',
//     icon: 'approval',
//     roles: ['Cashier','StoreAdmin'],

//     children: [
//         {
//             name: 'Add Zone',
//             iconText: 'SI',
//             path: 'Zone/add-zone',
//             roles: ['Cashier','StoreAdmin'],
//         },
//         {
//             name: 'Zone Selection',
//             iconText: 'SI',
//             path: 'Zone/zone-selector',
//             roles: ['Cashier','StoreAdmin'],
//         },
     
       
//     ],
// },
// Zone management
{
    label: 'REPORT MANAGEMENT',
    type: 'label',
    roles: ['Cashier'],
},
{
    name: 'Report',
    icon: 'report',
    roles: ['Cashier'],

    children: [
        {
            name: 'Add Expense',
            iconText: 'SI',
            path: 'Report/add-expence',
            roles: ['Cashier'],
        },
        {
            name: 'Add Damage Product',
            iconText: 'SI',
            path: 'Report/add-damage',
            roles: ['Cashier'],
        },
     
       
    ],
},
    // product managment
    {
        label: 'PRODUCT MANAGEMENT',
        type: 'label',
        roles: ['Inventry Manager'],
    },

    {
        name: 'Dealer',
        icon: 'view_agenda',
        roles: ['Inventry Manager'],

        children: [
            {
                name: 'Add Dealer',
                path: 'Dealer/add-dealer',
                iconText: 'SI',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Dealer Allotment',
                path: 'Dealer/dealer-allotment',
                iconText: 'SI',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Dealer Allotment List',
                  path: '/Dealer/dealer-allotment-list',
                  iconText: 'SI',
                  roles: ['Inventry Manager'],  
              },
            {
                name: 'Verify Dealer Allotment ' ,
                iconText: 'SI',
                path: 'Dealer/verify-dealer-allotement',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Inventry Stock' ,
                iconText: 'SI',
                path: 'Dealer/inventry-stock',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Store Allotment' ,
                iconText: 'SI',
                path: 'Store/store-allotment',
                roles: ['Inventry Manager'],
            },
            
           
        ],
    },
  
    {
        name: 'Inventory',
        icon: 'view_agenda',
        roles: ['Inventry Manager'],

        children: [
            {
                name: 'Add Inventry Listing',
                iconText: 'SI',
                path: '/inventry/add-inventry-listing',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Category Setup',
                iconText: 'SI',
                path: '/Category/all-category-setup',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Add New Product',
                iconText: 'SI',
                path: '/inventry/new-product',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Product List',
                iconText: 'SI',
                path: '/inventry/product-lists',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Update Product',
                iconText: 'SI',
                path: '/inventry/update-product',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Update Inventry Price',
                iconText: 'SI',
                path: '/Dealer/inventry-price-update',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Update Store Price',
                iconText: 'SI',
                path: 'Store/update-store-price',
                roles: ['Inventry Manager'],
            },
            // {
            //     name: 'Add Listing',
            //     iconText: 'SI',
            //     path: '/inventry/new-listing',
            //     roles: ['Inventry Manager'],
            // },
            // {
            //     name: 'Listing List',
            //     iconText: 'SI',
            //     path: '/inventry/listing-list',
            //     roles: ['Inventry Manager'],
            // },
            {
                name: 'Update Varient',
                iconText: 'SI',
                path: '/inventry/update-varient',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Update Image',
                iconText: 'SI',
                path: '/inventry/update-image',
                roles: ['Inventry Manager'],
            },
            {
                name: 'Store Stock',
                iconText: 'SI',
                path: '/inventry/store-stock',
                roles: ['Inventry Manager'],
            },
            // {
            //     name: 'Update Stock',
            //     iconText: 'SI',
            //     path: '/inventry/update-Stock',
            //     roles: ['Inventry Manager'],
            // }
        ],
    },
        // {
        //     name: 'Store Allotment',
        //     path: '/inventry/store-allotment',
        //     icon: 'man2',
        //     roles: ['Inventry Manager'],
        // },
        {
            name: 'Cash Collect',
            path: 'Store/collect-cashier',
            icon: 'account_balance_wallet',
            roles: ['StoreAdmin'],
        },
        {
            name: 'Collection Report',
            path: 'Store/collection-report',
            icon: 'dvr',
            roles: ['StoreAdmin'],
        },
        {
            name: 'Store Allotment List',
            icon: 'inventory',
            path: 'Store/store-allotement-list',
            roles: ['Cashier','StoreAdmin'],
        },
        {
            name: 'Verify Store Allotment',
            icon: 'inventory',
            path: 'Store/verify-store-allotement',
            roles: ['Cashier','StoreAdmin','QualityAssociate'],
        },
        {
            name: 'Stock',
            icon: 'inventory',
            path: '/inventry/stock',
            roles: ['Cashier','StoreAdmin','QualityAssociate'],
        },
        {
            name: 'Sale Report',
            icon: 'inventory',
            path: 'Store/order-collection-report',
            roles: ['Cashier','StoreAdmin',],
        },
        // {
        //     name: 'Verify Allotment ' ,
        //     icon: 'check',
        //     path: 'store/verify-allotments',
        //     roles: ['storeadmin','sa', 'admin'],
        // },

     
        {
            name: 'Store Allotment List',
            path: '/Dealer/Store-allotment-list',
            icon: 'discount',
            roles: ['Inventry Manager'],
        },
        // {
        //     name: 'Allotment List',
        //     path: 'Store/allotment-list',
        //     icon: 'discount',
        //     roles: ['StoreAdmin'],
        // },
        // {
        //     name: 'Offer Item',
        //     path: 'Dealer/free-item',
        //     icon: 'discount',
        //     roles: ['sa', 'admin','editor'],
        // },
    // Promotation managment
    {
        label: 'PROMOTION MANAGEMENT',
        type: 'label',
        roles: ['Inventry Manager'],
    },
    // {
    //     name: 'Update Stock',
    //     path: 'Store/update-stock',
    //     icon: 'discount',
    //     roles: ['Cashier'],
    // },
    {
        name: 'Coupons',
        path: 'HQ/add-coupon',
        icon: 'discount',
        roles: ['Inventry Manager'],
    },
    // employee Managment
    {
        label: 'EMPLOYEE MANAGEMENT',
        type: 'label',
        roles: ['StoreAdmin'],
    },
    {
        icon: 'man',
        name: 'Employee',
        path: 'HQ/employee-list',
        roles: ['StoreAdmin'],
    },
    {
        label: 'SYSTEM MANAGEMENT',
        type: 'label',
        roles: ['Inventry Manager'],
    },
 
    {
        name: 'City',
        path: 'HQ/add-city',
        icon: 'add_location',
        roles: ['Inventry Manager'],
    },
    {
        name: 'Stores',
        path: 'HQ/store-list',
        icon: 'add_business',
        roles: ['Inventry Manager'],
    },
    
]

