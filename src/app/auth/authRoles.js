export const authRoles = {
    sa: ['superadmin'], // Only Super admin has access
    admin: ['sa', 'admin'], // Only sa & admin has access
    editor: ['sa', 'admin', 'editor'], // Only sa & admin & editor has access
    guest: ['StoreAdmin', 'Cashier', 'scanner','QualityAssociate'], // Everyone has access
    StoreAdmin:['StoreAdmin'],
    productmanager:['Inventry Manager'],
    StoreCashier:['Cashier','StoreAdmin'],
    scanner:['scanner'],
    Cashier:['Cashier']
}
