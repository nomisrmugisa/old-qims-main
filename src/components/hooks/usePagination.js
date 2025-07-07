/**
 * Created by fulle on 2025/07/07.
 */
import { useState, useEffect, useCallback } from 'react';

const usePagination = (items = [], defaultItemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Reset to first page when items or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [items, itemsPerPage]);

    const goToPage = useCallback((page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const paginatedItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return {
        currentPage,
        itemsPerPage,
        paginatedItems,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        setItemsPerPage
    };
};

export default usePagination;