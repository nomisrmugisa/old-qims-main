/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';
import FacilityListItem from '../../Facility/ListItem';
import Pagination from '../../Pagination';
import usePagination from '../../hooks/usePagination';

const FacilityList = ({ facilities }) => {
    const {
        currentPage,
        itemsPerPage,
        paginatedItems,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        setItemsPerPage
    } = usePagination(facilities, 10);

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Healthcare Facilities <span className="badge bg-primary">{facilities.length}</span></h2>
                <div className="d-flex align-items-center">
                    <label htmlFor="itemsPerPage" className="me-2 mb-0">Show:</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="form-select form-select-sm"
                        style={{ width: '80px' }}
                    >
                        {[5, 10, 20, 50].map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-md-2 g-4">
                {paginatedItems.length > 0 ? (
                    paginatedItems.map(facility => (
                        <div key={`${facility.newFacilityCode}-${facility.oldFacilityCode}`} className="col">
                            <FacilityListItem facility={facility} />
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">No facilities found</div>
                    </div>
                )}
            </div>

            {paginatedItems.length > 0 && (
                <div className="mt-4 d-flex justify-content-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                </div>
            )}
        </div>
    );
};

export default FacilityList;