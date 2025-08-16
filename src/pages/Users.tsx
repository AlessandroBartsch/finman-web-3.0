import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Modal, Form, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { 
  Person, 
  Plus, 
  Pencil, 
  Trash, 
  Search,
  FileEarmarkText
} from 'react-bootstrap-icons';
import { userService } from '../services/api';
import type { User as UserType, CreateUserForm, UserSituation } from '../types';
import DocumentManager from '../components/DocumentManager';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    knownByWhom: '',
    situation: 'ACTIVE'
  });
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      setError('Nome e sobrenome são obrigatórios');
      return;
    }

    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
      } else {
        await userService.create(formData);
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: ''
      });
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      knownByWhom: user.knownByWhom || '',
      situation: user.situation,
      deactivatedDate: user.deactivatedDate || '',
      deactivationReason: user.deactivationReason || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await userService.delete(userId);
      loadUsers();
    } catch (err) {
      setError('Erro ao excluir usuário');
    }
  };



  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Person className="me-2" />
          Clientes
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="me-1" />
          Novo Cliente
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        <div className="col-md-4">
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center">
                <Search className="me-2" />
                <Form.Control
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <ListGroup variant="flush">
                  {filteredUsers.map((user) => (
                    <ListGroup.Item
                      key={user.id}
                      action
                      active={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="d-flex align-items-center">
                          <strong>{user.fullName}</strong>
                          <span className={`badge ${user.situation === 'ACTIVE' ? 'bg-success' : 'bg-danger'} ms-2`}>
                            {user.situation === 'ACTIVE' ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>
                        <small className="text-muted">{user.phoneNumber}</small>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.id);
                          }}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-8">
          {selectedUser ? (
            <Tabs defaultActiveKey="info" className="mb-3">
              <Tab eventKey="info" title="Informações">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Informações do Cliente</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Nome:</strong> {selectedUser.firstName}</p>
                        <p><strong>Sobrenome:</strong> {selectedUser.lastName}</p>
                        <p><strong>Telefone:</strong> {selectedUser.phoneNumber}</p>
                        <p><strong>Conhecido de:</strong> {selectedUser.knownByWhom || 'Não informado'}</p>
                        <p><strong>Situação:</strong> 
                          <span className={`badge ${selectedUser.situation === 'ACTIVE' ? 'bg-success' : 'bg-danger'} ms-2`}>
                            {selectedUser.situation === 'ACTIVE' ? 'Ativo' : 'Desativado'}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Endereço:</strong> {selectedUser.address}</p>
                        <p><strong>Data de Nascimento:</strong> {new Date(selectedUser.dateOfBirth).toLocaleDateString()}</p>
                        <p><strong>Cadastrado em:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                        {selectedUser.situation === 'DEACTIVATED' && (
                          <>
                            <p><strong>Desativado em:</strong> {selectedUser.deactivatedDate ? new Date(selectedUser.deactivatedDate).toLocaleDateString() : 'Não informado'}</p>
                            <p><strong>Motivo:</strong> {selectedUser.deactivationReason || 'Não informado'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
              <Tab eventKey="documents" title={
                <span>
                  <FileEarmarkText className="me-1" />
                  Documentos
                </span>
              }>
                <DocumentManager 
                  userId={selectedUser.id} 
                  userName={selectedUser.fullName} 
                />
              </Tab>
            </Tabs>
          ) : (
            <Card>
              <Card.Body className="text-center py-5">
                <Person size={64} className="text-muted mb-3" />
                <h5>Selecione um cliente</h5>
                <p className="text-muted">Escolha um cliente da lista para ver suas informações e documentos</p>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar usuário */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          address: '',
          dateOfBirth: '',
          knownByWhom: '',
          situation: 'ACTIVE'
        });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Cliente' : 'Novo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Digite o nome"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sobrenome *</Form.Label>
              <Form.Control
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Digite o sobrenome"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Digite o endereço completo"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Conhecido de Quem</Form.Label>
              <Form.Control
                type="text"
                value={formData.knownByWhom || ''}
                onChange={(e) => setFormData({ ...formData, knownByWhom: e.target.value })}
                placeholder="Nome da pessoa que indicou este cliente"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Situação</Form.Label>
              <Form.Select
                value={formData.situation || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value as UserSituation })}
              >
                <option value="ACTIVE">Ativo</option>
                <option value="DEACTIVATED">Desativado</option>
              </Form.Select>
            </Form.Group>

            {formData.situation === 'DEACTIVATED' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Desativação</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.deactivatedDate || ''}
                    onChange={(e) => setFormData({ ...formData, deactivatedDate: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Motivo da Desativação</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.deactivationReason || ''}
                    onChange={(e) => setFormData({ ...formData, deactivationReason: e.target.value })}
                    placeholder="Descreva o motivo da desativação"
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingUser ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
