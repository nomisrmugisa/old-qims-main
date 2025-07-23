import React, { useState } from 'react';
import { Card, Table, Button, Form, Pagination } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons';

const mockGroups = [
  { name: 'Admin config module ( Supervision RDQe )', member: false },
  { name: 'Admin config module Create Favorit ( Supervision RDQe )', member: false },
  { name: 'Facility Reviewers', member: false },
  { name: 'KK Clinic_PhyDr0qHN3l', member: false },
  { name: 'MOH Inspectors', member: false },
  { name: 'Test Group', member: true },
];

const UserGroupManagement = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const filtered = mockGroups.filter(group => group.name.toLowerCase().includes(search.toLowerCase()));
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
              <th>Member?</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((group, idx) => (
              <tr key={group.name+idx}>
                <td>{group.name}</td>
                <td>{group.member ? 'Member' : ''}</td>
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

export default UserGroupManagement; 