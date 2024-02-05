import React, { useState } from 'react'

const ProductSearch = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [cart, setCart] = useState([])

    // Mock product data
    const products = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 },
        { id: 3, name: 'Product 3', price: 30 },
        // Add more products here...
    ]

    // Handle search term input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value)
    }

    // Handle product add to cart
    const handleAddToCart = (product, quantity) => {
        const item = { ...product, quantity }
        setCart([...cart, item])
    }

    // Handle search form submit
    const handleSearchSubmit = (event) => {
        event.preventDefault()
        // Perform search logic here (e.g., filtering products based on search term)
        const results = products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setSearchResults(results)
    }

    return (
        <div>
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button type="submit">Search</button>
            </form>

            <h2>Search Results:</h2>
            {searchResults.length > 0 ? (
                <ul>
                    {searchResults.map((product) => (
                        <li key={product.id}>
                            {product.name} - ${product.price}
                            <input
                                type="number"
                                min="1"
                                defaultValue="1"
                                onChange={(e) => {
                                    const quantity = parseInt(e.target.value)
                                    handleAddToCart(product, quantity)
                                }}
                            />
                            <button onClick={() => handleAddToCart(product, 1)}>
                                Add to Cart
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found.</p>
            )}

            <h2>Shopping Cart:</h2>
            {cart.length > 0 ? (
                <ul>
                    {cart.map((item) => (
                        <li key={item.id}>
                            {item.name} - ${item.price} x {item.quantity}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    )
}

export default ProductSearch
