/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Card, Alert, Spinner } from 'react-bootstrap';
import {lookupFacilities} from '../helpers';

import EnrolmentBasic from '../Basic/index';
import EnrolmentAdmin from '../Admin/index';
import EnrolmentSelf from '../Self/index';

const EnrolmentManager = () => {
    const [activeTab, setActiveTab] = useState('user');

    // Reset states when switching tabs
    useEffect(() => {
    }, [activeTab]);



    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <h2 className="mb-0">Facility Enrolment System</h2>
                </Card.Header>

                <Card.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        id="enrolment-tabs"
                        className="mb-4"
                    >
                        <Tab eventKey="user" title="User Enrolment">
                            <EnrolmentBasic />
                        </Tab>

                        <Tab eventKey="admin" title="Admin Enrolment">
                            <EnrolmentAdmin />
                        </Tab>

                        <Tab eventKey="self" title="Self Enrolment">
                            <EnrolmentSelf />
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>


        </Container>
    );
};

export default EnrolmentManager;