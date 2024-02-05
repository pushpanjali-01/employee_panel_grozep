import React, { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { GrozpSnackbar } from 'app/components/'
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

export default function VoucherSelection({ vouchers, onSelectVouchers }) {
    const [selectedVouchers, setSelectedVouchers] = useState([])
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState('success')
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
    const handleVoucherSelection = async (event, value) => {
        const totalAmount = await localStorage.getItem('payamount')
        const total = JSON.parse(totalAmount)
        if (value.length > 0) {
            const voucherAmount = value[value.length - 1].OfferAmount
            if (voucherAmount <= total) {
                setSelectedVouchers(value)
                onSelectVouchers(value)
            } else {
                handleShowSnackbar(
                    'The voucher amount exceeds the total amount!',
                    'error'
                )
            }
        } else {
            setSelectedVouchers([])
            onSelectVouchers([])
            handleShowSnackbar('Voucher removed successfully!')
        }
    }

    return (
        <div>
            <GrozpSnackbar
                open={open}
                handleClose={handleClose}
                msg={msg}
                severity={severity}
            />
            <Autocomplete
                multiple
                id="voucher-selection"
                options={vouchers}
                disableCloseOnSelect
                getOptionLabel={(option) => option.sno}
                renderOption={(props, option, { selected }) => (
                    <li {...props}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.sno} (₹{option.OfferAmount})
                    </li>
                )}
                onChange={handleVoucherSelection}
                value={selectedVouchers}
                renderInput={(params) => (
                    <TextField {...params} label="Select Vouchers" />
                )}
            />
        </div>
    )
}
