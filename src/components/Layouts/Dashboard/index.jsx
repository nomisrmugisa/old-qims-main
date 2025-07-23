/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Offcanvas } from 'react-bootstrap';
import {
    House,
    Calendar,
    Bell,
    Person,
    Key,
    Building,
    CardChecklist,
    BoxArrowRight
} from 'react-bootstrap-icons';
import StorageService from '../../../services/storage.service';

const DashboardLayout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [authUser, setAuthUser] = useState(null);



    useEffect(() => {

        const getUserData = async() => {
            const userData = await StorageService.getUserData();
            window.console.log(userData);
            setAuthUser(userData);
        };

        getUserData();
    }, []);



    return (
        <div className="dashboard-container">
            <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
                <Container fluid>
                    <Navbar.Brand href="#">
                        <Building className="me-2" />
                        Health Facility Portal
                    </Navbar.Brand>
                    <Navbar.Toggle
                        aria-controls="sidebar-menu"
                        onClick={() => setShowSidebar(true)}
                    />

                    <Nav className="ms-auto">
                        <Nav.Link className="position-relative">
                            <Bell size={20} />
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
                        </Nav.Link>
                        {authUser && (
                            <Nav.Link>
                                <Person size={20} className="me-1" />
                                {authUser.firstName}
                            </Nav.Link>
                        )}

                    </Nav>
                </Container>
            </Navbar>

            <Offcanvas
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                placement="start"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Dashboard Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Link active>
                            <House className="me-2" /> Dashboard
                        </Nav.Link>
                        <Nav.Link>
                            <Calendar className="me-2" /> Inspections
                        </Nav.Link>
                        <Nav.Link>
                            <Building className="me-2" /> Facilities
                        </Nav.Link>
                        <Nav.Link>
                            <CardChecklist className="me-2" /> Applications
                        </Nav.Link>
                        <hr />
                        <Nav.Link>
                            <Person className="me-2" /> Profile
                        </Nav.Link>
                        <Nav.Link>
                            <Key className="me-2" /> Password
                        </Nav.Link>
                        <hr />
                        <Nav.Link>
                            <BoxArrowRight className="me-2" /> Logout
                        </Nav.Link>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

            <Container fluid className="dashboard-content mt-5 pt-4">
                <Row>

                    <Col lg={12}>
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DashboardLayout;