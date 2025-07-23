/**
 * Created by fulle on 2025/07/08.
 */
import React, { useState } from 'react';
import CorrectiveActionPlan from '../../components/CorrectiveActionPlan';
import resolvedFormData from '../../data/resolvedFormData.json';

const CorrectiveActionPlanPage = () => {
    return (
        <div>
            <CorrectiveActionPlan resolvedForm={resolvedFormData} />
        </div>
    );
};

export default CorrectiveActionPlanPage;