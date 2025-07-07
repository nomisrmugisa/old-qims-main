/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, onNext, onPrev }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(i)}
                        aria-label={`Go to page ${i}`}
                        aria-current={currentPage === i ? 'page' : null}
                    >
                        {i}
                    </button>
                </li>
            );
        }

        return pages;
    };

    return (
        <nav aria-label="Facility list pagination">
            <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={onPrev}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>

                {renderPageNumbers()}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={onNext}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;