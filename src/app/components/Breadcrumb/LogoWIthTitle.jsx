import React from 'react'
import { styled } from '@mui/material'

const IMG = styled('img')(() => ({
    width: '2%',

    '@media (min-width: 300px)': {
        width: '6%',
    },
    '@media (min-width: 600px)': {
        width: '4%',
    },

    '@media (min-width: 960px)': {
        width: '2%',
    },
}))
const H4 = styled('h4')(({ theme }) => ({
    fontSize: '1.3rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginLeft: '0.5rem',
    color: theme.palette.text.primary,
}))
const radiusFactor = 0.5
const LogoWithTitle = ({ src, title, num }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <IMG
                src={src}
                alt=""
                style={{ alignSelf: 'center' }}
                sx={{ mb: 1 }}
            />
            <H4>{title}</H4>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px  #a7acb5',
                    backgroundColor: '#e6ebeb',
                    borderRadius: `calc(${radiusFactor * 100}% * 0.5)`,
                    width: 'auto',
                    height: 'auto',
                    marginLeft: '0.5rem',
                    padding: 2,
                }}
            >
                <h7
                    style={{
                        margin: 0,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                    }}
                >
                    {num}
                </h7>
            </div>
        </div>
    )
}

export default LogoWithTitle
