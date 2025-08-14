import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash, 
  Telephone, 
  GeoAlt, 
  Calendar,
  X,
  Check,
  ArrowClockwise
} from 'react-bootstrap-icons';
import { userService } from '../services/api';
import type { User as UserType, CreateUserForm } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
      } else {
        await userService.create(formData);
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await userService.delete(userId);
        await fetchUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: ''
    });
    setEditingUser(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phoneNumber && user.phoneNumber.includes(searchTerm))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <ArrowClockwise className="spinner-border text-primary mb-3" size={48} />
          <p className="text-muted">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-2">Clientes</h1>
          <p className="text-muted mb-0">
            Gerencie seus clientes e informações
          </p>
        </div>
        <button
          onClick={openModal}
          className="btn btn-primary"
        >
          <Plus className="me-2" />
          Novo Cliente
        </button>
      </div>

      {/* Search and Stats */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted me-3">Total: {users.length} clientes</span>
              <span className="text-muted">Mostrando: {filteredUsers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Lista de Clientes</h5>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <span className="display-4">👥</span>
            </div>
            <h5>Nenhum cliente encontrado</h5>
            <p className="text-muted">
              {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro cliente.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="btn btn-primary"
              >
                <Plus className="me-2" />
                Adicionar Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredUsers.map((user) => (
              <div key={user.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                      <span className="fw-bold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h6 className="mb-1">{user.firstName} {user.lastName}</h6>
                      <div className="d-flex flex-wrap gap-3 text-muted small">
                        {user.phoneNumber && (
                          <div className="d-flex align-items-center">
                            <Telephone className="me-1" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.address && (
                          <div className="d-flex align-items-center">
                            <GeoAlt className="me-1" />
                            <span>{user.address}</span>
                          </div>
                        )}
                        {user.dateOfBirth && (
                          <div className="d-flex align-items-center">
                            <Calendar className="me-1" />
                            <span>{formatDate(user.dateOfBirth)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-outline-primary btn-sm"
                      title="Editar"
                    >
                      <Pencil />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-outline-danger btn-sm"
                      title="Excluir"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Editar Cliente' : 'Novo Cliente'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sobrenome</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Data de Nascimento</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Check className="me-2" />
                    {editingUser ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
