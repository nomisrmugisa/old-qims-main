/**
 * Created by fulle on 2025/07/05.
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import illustration from '../../../assets/MOH-logo-bots.png';
import PasswordChanger from '../../components/User/PasswordChanger';


const ChangePasswordPage = () => {


    return (
        <Container fluid className="password-change-container">
            <Row className="h-100">
                {/* Form Column - Full width on mobile, half on larger screens */}
                <Col xs={12} lg={6} className="form-column d-flex align-items-center justify-content-center">
                    <PasswordChanger />
                </Col>

                {/* Illustration Column - Hidden on mobile, visible on lg+ */}
                <Col lg={6} className="d-none d-lg-flex illustration-column align-items-center justify-content-center">
                    <div className="text-center p-5">
                        <img
                            src={illustration}
                            alt="Registration"
                            className="img-fluid mb-4"
                            style={{ maxHeight: '400px' }}
                        />
                        <h3>Keep your account safe</h3>
                        <p className="text-muted">
                            Change your password in all safety. Avoid using:
                        </p>
                        <ul className="text-start mt-4">
                            <li>Pets or Family member's Birth date(s)</li>
                            <li>Pets or Family members' names</li>
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ChangePasswordPage;