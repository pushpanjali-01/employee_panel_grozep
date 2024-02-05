import React from 'react'

const DatePickPicker = (props) => {
    const { onChange, setMinDate, setMaxDate } = props

    const date = new Date()
    const month = date.getMonth() + 1
    const currentdate = date.getDate()
    const year = date.getFullYear()
    const today = `${year}-${month}-${currentdate}`
    return (
        <input
            type="date"
            placeholder="Select a date"
            style={{
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 16,
                padding: '12px 12px ',
                width: '100%',
            }}
            onChange={onChange}
            onKeyDown={(e) => e.preventDefault()} // Prevent manual input
            onKeyPress={(e) => e.preventDefault()} // Prevent manual input
            onPaste={(e) => e.preventDefault()} // Prevent paste
            onCut={(e) => e.preventDefault()} // Prevent cut
            {...(setMinDate ? { min: today } : {})}
            {...(setMaxDate ? { max: today } : {})}
            {...props}
        />
    )
}

export default DatePickPicker
