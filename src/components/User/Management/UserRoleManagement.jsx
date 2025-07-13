import React, { useState } from 'react';
import { Card, Table, Button, Form, Pagination } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons';

const mockRoles = [
  { name: 'External Examiner', description: 'External examiners for approvals' },
  { name: 'MOH Inspector', description: 'MOH Inspector - Carries out Inspection of facilities on Behalf of MOH' },
  { name: 'Self Registration', description: 'Self Registration' },
  { name: 'Superuser', description: 'Superuser' },
  { name: 'mohstaff', description: 'Ministry of health staff' },
];

const UserRoleManagement = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const filtered = mockRoles.filter(role => role.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page-1)*itemsPerPage, page*itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <Card className="user-management-container">
      <Card.Body>
        <Form className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ maxWidth: 300 }}
          />
        </Form>
        <Table hover>
          <thead>
            <tr>
              <th>Display name</th>
              <th>Description</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((role, idx) => (
              <tr key={role.name+idx}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td><Button variant="light" size="sm"><ThreeDots /></Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center">
          <div></div>
          <Pagination className="mb-0">
            <Pagination.Prev disabled={page===1} onClick={()=>setPage(page-1)} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next disabled={page===totalPages} onClick={()=>setPage(page+1)} />
          </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserRoleManagement; 