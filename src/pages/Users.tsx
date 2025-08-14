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
      <div className="flex items-center justify-center h-64">
        <ArrowClockwise className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando clientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus clientes e informações
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {users.length} clientes</span>
            <span>Mostrando: {filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Clientes</h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
                         <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
               <span className="text-2xl">👥</span>
             </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro cliente.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={openModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                     {user.phoneNumber && (
                             <div className="flex items-center">
                               <Telephone className="w-4 h-4 mr-1" />
                               <span>{user.phoneNumber}</span>
                             </div>
                           )}
                          {user.address && (
                            <div className="flex items-center">
                              <GeoAlt className="w-4 h-4 mr-1" />
                              <span className="truncate">{user.address}</span>
                            </div>
                          )}
                          {user.dateOfBirth && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(user.dateOfBirth)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingUser ? 'Editar Cliente' : 'Novo Cliente'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                                         <input
                       type="tel"
                       value={formData.phoneNumber}
                       onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editingUser ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
