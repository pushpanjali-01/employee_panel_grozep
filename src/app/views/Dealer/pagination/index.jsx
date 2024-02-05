import React from 'react'
import './style.css'

function Pagination({
    productsPerPage,
    totalProducts,
    currentPage,
    paginate,
    handlePreviousClick,
    handleNextClick,
    handleFirstClick,
    handleLastClick,
}) {
    const pageNumbers = Math.ceil(totalProducts / productsPerPage)
    const maxVisibleButtons = 4

    const getVisibleButtons = () => {
        const visibleButtons = []
        let startPage
        let endPage

        if (pageNumbers <= maxVisibleButtons) {
            startPage = 1
            endPage = pageNumbers
        } else {
            const middleButtonOffset = Math.floor(maxVisibleButtons / 2)
            if (currentPage <= middleButtonOffset + 1) {
                startPage = 1
                endPage = maxVisibleButtons
            } else if (currentPage >= pageNumbers - middleButtonOffset) {
                startPage = pageNumbers - maxVisibleButtons + 1
                endPage = pageNumbers
            } else {
                startPage = currentPage - middleButtonOffset
                endPage = currentPage + middleButtonOffset
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            visibleButtons.push(i)
        }

        return visibleButtons
    }

    return (
        <div className="pagination">
            <button
                onClick={handleFirstClick}
                disabled={currentPage === 1}
                className="pagination-buttons"
            >
                <img
                    src="/assets/images/double-left-arrow.png"
                    className="pagination-icons"
                />
            </button>
            <button
                onClick={handlePreviousClick}
                disabled={currentPage === 1}
                className="pagination-buttons"
            >
                <img
                    src="/assets/images/left1.png"
                    className="pagination-icons"
                />
            </button>
            {getVisibleButtons().map((number) => (
                <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={handleNextClick}
                disabled={currentPage === pageNumbers}
                className="pagination-buttons"
            >
                <img
                    src="/assets/images/right1.svg"
                    className="pagination-icons"
                />
            </button>
            <button
                onClick={handleLastClick}
                disabled={currentPage === pageNumbers}
                className="pagination-buttons"
            >
                <img
                    src="/assets/images/right-double-arrow.svg"
                    className="pagination-icons"
                />
            </button>
        </div>
    )
}

export default Pagination
