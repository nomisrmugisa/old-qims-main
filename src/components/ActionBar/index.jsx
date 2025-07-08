/**
 * Created by fulle on 2025/07/08.
 */
import React from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ActionBar = ({
                       onSubmit,
                       onCancel,
                       onReset,
                       isSubmitting,
                       disableSubmit
                   }) => (
    <div className="d-flex justify-content-between mt-4 border-top pt-3">
        <Button
            variant="outline-danger"
            onClick={onReset}
            disabled={isSubmitting}
            aria-label="Reset form"
        >
            Reset Form
        </Button>

        <ButtonGroup>
            <Button
                variant="outline-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                aria-label="Cancel submission"
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                onClick={onSubmit}
                disabled={disableSubmit || isSubmitting}
                aria-busy={isSubmitting}
                aria-live="polite"
            >
                {isSubmitting ? (
                    <>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                    />
                    Submitting...
                    </>
                ) : 'Submit Final Notes'}
            </Button>
        </ButtonGroup>
    </div>
);

ActionBar.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    disableSubmit: PropTypes.bool
};

ActionBar.defaultProps = {
    isSubmitting: false,
    disableSubmit: false
};

export default ActionBar;