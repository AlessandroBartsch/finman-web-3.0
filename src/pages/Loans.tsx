import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Modal, 
  Form, 
  Alert, 
  Spinner,
  Table,
  Tabs,
  Tab,
  Row,
  Col
} from 'react-bootstrap';
import { 
  Plus, 
  Eye, 
  Pencil, 
  Trash, 
  CheckCircle, 
  XCircle,
  CurrencyDollar,
  Calendar,
  Clock,
  FileText,
  People
} from 'react-bootstrap-icons';
import { loanService, installmentService, userService } from '../services/api';
import type { 
  Loan, 
  CreateLoanForm, 
  UpdateLoanForm, 
  LoanInstallment,
  User,
  LoanStatus,
  PaymentFrequency,
  PaymentType
} from '../types';

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [installments, setInstallments] = useState<LoanInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  const [createForm, setCreateForm] = useState<CreateLoanForm>({
    userId: 0,
    loanAmount: 0,
    interestRate: 0,
    termValue: 1,
    paymentFrequency: 'MONTHLY',
    paymentType: 'FIXED_INSTALLMENTS',
    startDate: ''
  });

  const [editForm, setEditForm] = useState<UpdateLoanForm>({
    status: 'PENDING'
  });

  const statusLabels = {
    PENDING: { label: 'Pendente', variant: 'warning' },
    APPROVED: { label: 'Aprovado', variant: 'info' },
    ACTIVE: { label: 'Ativo', variant: 'success' },
    PAID: { label: 'Pago', variant: 'success' },
    DEFAULTED: { label: 'Inadimplente', variant: 'danger' },
    REJECTED: { label: 'Rejeitado', variant: 'danger' },
    CANCELLED: { label: 'Cancelado', variant: 'secondary' }
  } as const;

  const frequencyLabels = {
    DAILY: 'Diário',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    ALTERNATE_DAYS: 'Dias Alternados'
  } as const;

  const paymentTypeLabels = {
    FIXED_INSTALLMENTS: 'Parcelas Fixas',
    INTEREST_ONLY: 'Só Juros',
    FLEXIBLE: 'Flexível'
  } as const;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansResponse, usersResponse] = await Promise.all([
        loanService.getAll(),
        userService.getAll()
      ]);
      
      setLoans(loansResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInstallments = async (loanId: number) => {
    try {
      const response = await installmentService.getByLoan(loanId);
      setInstallments(response.data);
    } catch (err) {
      setError('Erro ao carregar parcelas');
    }
  };

  const handleCreateLoan = async () => {
    try {
      await loanService.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        userId: 0,
        loanAmount: 0,
        interestRate: 0,
        termValue: 1,
        paymentFrequency: 'MONTHLY',
        paymentType: 'FIXED_INSTALLMENTS',
        startDate: ''
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar empréstimo');
    }
  };

  const handleUpdateLoan = async () => {
    if (!selectedLoan) return;
    
    try {
      await loanService.update(selectedLoan.id, editForm);
      setShowEditModal(false);
      setSelectedLoan(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar empréstimo');
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    try {
      console.log('Aprovando empréstimo:', loanId);
      // Usando ID 1 como aprovador (pode ser alterado para um sistema de autenticação)
      const response = await loanService.approve(loanId, 1);
      console.log('Resposta da aprovação:', response);
      loadData();
    } catch (err: any) {
      console.error('Erro ao aprovar empréstimo:', err);
      setError(err.response?.data?.message || 'Erro ao aprovar empréstimo');
    }
  };

  const handleDisburseLoan = async (loanId: number) => {
    try {
      await loanService.disburse(loanId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao liberar empréstimo');
    }
  };

  const handleCancelLoan = async (loanId: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar este empréstimo?')) {
      return;
    }
    
    try {
      await loanService.cancel(loanId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cancelar empréstimo');
    }
  };

  const handleRevertLoan = async (loanId: number) => {
    if (!window.confirm('Tem certeza que deseja voltar este empréstimo para pendente?')) {
      return;
    }
    
    try {
      await loanService.revert(loanId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao reverter empréstimo');
    }
  };

  const handleDeleteLoan = async (loanId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este empréstimo?')) {
      return;
    }
    
    try {
      await loanService.delete(loanId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir empréstimo');
    }
  };

  const handleViewInstallments = async (loan: Loan) => {
    setSelectedLoan(loan);
    await loadInstallments(loan.id);
    setShowInstallmentsModal(true);
  };

  const handleSimulateInstallments = async (loan: Loan) => {
    try {
      setSelectedLoan(loan);
      const response = await loanService.simulateInstallments(loan.id);
      setInstallments(response.data);
      setShowSimulationModal(true);
    } catch (err) {
      setError('Erro ao simular parcelas');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Tratar a data como LocalDate (sem timezone)
    // Dividir a string da data em partes para evitar conversão de timezone
    const [year, month, day] = dateString.split('T')[0].split('-');
    
    // Retornar no formato brasileiro (dd/mm/yyyy)
    return `${day}/${month}/${year}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Cliente não encontrado';
  };

  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'all') return true;
    return loan.status === activeTab;
  });

  return (
    <div className="h-100">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-2">Empréstimos</h1>
        <p className="text-muted mb-0">
          Gerenciamento completo de empréstimos e parcelas
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Actions */}
      <div className="mb-4">
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="me-2" />
          Novo Empréstimo
        </Button>
      </div>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k || 'all')}
        className="mb-4"
      >
        <Tab eventKey="all" title="Todos">
          <div className="d-flex align-items-center mb-2">
            <FileText className="me-2" />
            <span className="text-muted">Todos os empréstimos</span>
          </div>
        </Tab>
        <Tab eventKey="PENDING" title="Pendentes">
          <div className="d-flex align-items-center mb-2">
            <Clock className="me-2" />
            <span className="text-muted">Aguardando aprovação</span>
          </div>
        </Tab>
        <Tab eventKey="APPROVED" title="Aprovados">
          <div className="d-flex align-items-center mb-2">
            <CheckCircle className="me-2" />
            <span className="text-muted">Aprovados para liberação</span>
          </div>
        </Tab>
        <Tab eventKey="ACTIVE" title="Ativos">
          <div className="d-flex align-items-center mb-2">
            <CurrencyDollar className="me-2" />
            <span className="text-muted">Empréstimos ativos</span>
          </div>
        </Tab>
        <Tab eventKey="PAID" title="Pagos">
          <div className="d-flex align-items-center mb-2">
            <CheckCircle className="me-2" />
            <span className="text-muted">Empréstimos quitados</span>
          </div>
        </Tab>
      </Tabs>

      {/* Loans Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : filteredLoans.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FileText size={48} className="text-muted mb-3" />
            <h5>Nenhum empréstimo encontrado</h5>
            <p className="text-muted">
              {activeTab === 'all' 
                ? 'Não há empréstimos cadastrados no sistema.'
                : `Não há empréstimos com status "${statusLabels[activeTab as LoanStatus]?.label}".`
              }
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Juros</th>
                  <th>Prazo</th>
                  <th>Tipo Pagamento</th>
                  <th>Status</th>
                  <th>Saldo Devedor</th>
                  <th>Data Início</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                                              <div className="d-flex align-items-center">
                        <People className="me-2 text-muted" />
                        {getUserName(loan.userId)}
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(loan.loanAmount)}</strong>
                    </td>
                    <td>{formatPercentage(loan.interestRate)}</td>
                    <td>
                      {loan.termValue} {loan.termValue === 1 ? 'vez' : 'vezes'} 
                      ({frequencyLabels[loan.paymentFrequency]})
                    </td>
                    <td>
                      <Badge bg="outline-secondary" className="text-dark">
                        {paymentTypeLabels[loan.paymentType || 'FIXED_INSTALLMENTS']}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={statusLabels[loan.status].variant}>
                        {statusLabels[loan.status].label}
                      </Badge>
                    </td>
                    <td>
                      <span className={loan.outstandingBalance > 0 ? 'text-danger' : 'text-success'}>
                        {formatCurrency(loan.outstandingBalance)}
                      </span>
                    </td>
                    <td>{formatDate(loan.startDate)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={async () => {
                            setSelectedLoan(loan);
                            await loadInstallments(loan.id);
                            setShowViewModal(true);
                          }}
                          title="Visualizar empréstimo"
                        >
                          <Eye />
                        </Button>
                        {loan.status !== 'PENDING' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewInstallments(loan)}
                            title="Ver parcelas"
                          >
                            <FileText />
                          </Button>
                        )}
                        {loan.status === 'PENDING' && (
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleSimulateInstallments(loan)}
                            title="Simular parcelas"
                          >
                            <Calendar />
                          </Button>
                        )}
                        {loan.status === 'PENDING' && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setEditForm({
                                userId: loan.userId,
                                loanAmount: loan.loanAmount,
                                interestRate: loan.interestRate,
                                termValue: loan.termValue,
                                paymentFrequency: loan.paymentFrequency,
                                paymentType: loan.paymentType || 'FIXED_INSTALLMENTS',
                                startDate: loan.startDate,
                                status: loan.status
                              });
                              setShowEditModal(true);
                            }}
                            title="Editar"
                          >
                            <Pencil />
                          </Button>
                        )}
                        {loan.status === 'PENDING' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleApproveLoan(loan.id)}
                            title="Aprovar"
                          >
                            <CheckCircle />
                          </Button>
                        )}
                        {loan.status === 'APPROVED' && (
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleDisburseLoan(loan.id)}
                            title="Liberar"
                          >
                            <CurrencyDollar />
                          </Button>
                        )}
                        {loan.status === 'PENDING' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelLoan(loan.id)}
                            title="Cancelar"
                          >
                            <XCircle />
                          </Button>
                        )}
                        {loan.status === 'APPROVED' && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleRevertLoan(loan.id)}
                            title="Voltar"
                          >
                            <XCircle />
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteLoan(loan.id)}
                          title="Excluir"
                        >
                          <Trash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Create Loan Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Novo Empréstimo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    value={createForm.userId}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      userId: parseInt(e.target.value) 
                    }))}
                  >
                    <option value={0}>Selecione um cliente</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor do Empréstimo</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={createForm.loanAmount || ''}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      loanAmount: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Taxa de Juros (%/mês)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={createForm.interestRate ? createForm.interestRate * 100 : ''}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      interestRate: (parseFloat(e.target.value) || 0) / 100 
                    }))}
                    placeholder="0,00"
                  />
                  <Form.Text className="text-muted">
                    Taxa mensal de juros sobre o saldo devedor
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prazo</Form.Label>
                  <Form.Control
                    type="number"
                    value={createForm.termValue === 1 ? '' : createForm.termValue}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      termValue: parseInt(e.target.value) || 1 
                    }))}
                    placeholder="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequência de Pagamento</Form.Label>
                  <Form.Select
                    value={createForm.paymentFrequency}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      paymentFrequency: e.target.value as PaymentFrequency 
                    }))}
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="DAILY">Diário</option>
                    <option value="ALTERNATE_DAYS">Dias Alternados</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      startDate: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Pagamento</Form.Label>
                  <Form.Select
                    value={createForm.paymentType}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      paymentType: e.target.value as PaymentType 
                    }))}
                  >
                    <option value="FIXED_INSTALLMENTS">Parcelas Fixas (Principal + Juros)</option>
                    <option value="INTEREST_ONLY">Só Juros Mensais (Principal no Final)</option>
                    <option value="FLEXIBLE">Flexível (Pagamento Personalizado)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {createForm.paymentType === 'FIXED_INSTALLMENTS' && 
                      'Parcelas iguais com amortização do principal + juros mensais'}
                    {createForm.paymentType === 'INTEREST_ONLY' && 
                      'Paga apenas os juros mensais, o principal é quitado no final'}
                    {createForm.paymentType === 'FLEXIBLE' && 
                      'Permite pagamentos variados conforme acordo com o cliente'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateLoan}>
            Criar Empréstimo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Loan Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Empréstimo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    value={editForm.userId || selectedLoan?.userId || 0}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      userId: parseInt(e.target.value) 
                    }))}
                  >
                    <option value={0}>Selecione um cliente</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor do Empréstimo</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={editForm.loanAmount || selectedLoan?.loanAmount || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      loanAmount: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Taxa de Juros (%/mês)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={editForm.interestRate ? editForm.interestRate * 100 : selectedLoan?.interestRate ? selectedLoan.interestRate * 100 : ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      interestRate: (parseFloat(e.target.value) || 0) / 100 
                    }))}
                    placeholder="0,00"
                  />
                  <Form.Text className="text-muted">
                    Taxa mensal de juros sobre o saldo devedor
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prazo</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.termValue || selectedLoan?.termValue || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      termValue: parseInt(e.target.value) || 1 
                    }))}
                    placeholder="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequência de Pagamento</Form.Label>
                  <Form.Select
                    value={editForm.paymentFrequency || selectedLoan?.paymentFrequency || 'MONTHLY'}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      paymentFrequency: e.target.value as PaymentFrequency 
                    }))}
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="DAILY">Diário</option>
                    <option value="ALTERNATE_DAYS">Dias Alternados</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.startDate || selectedLoan?.startDate || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      startDate: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Pagamento</Form.Label>
                  <Form.Select
                    value={editForm.paymentType || selectedLoan?.paymentType || 'FIXED_INSTALLMENTS'}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      paymentType: e.target.value as PaymentType 
                    }))}
                  >
                    <option value="FIXED_INSTALLMENTS">Parcelas Fixas (Principal + Juros)</option>
                    <option value="INTEREST_ONLY">Só Juros Mensais (Principal no Final)</option>
                    <option value="FLEXIBLE">Flexível (Pagamento Personalizado)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {editForm.paymentType === 'FIXED_INSTALLMENTS' && 
                      'Parcelas iguais com amortização do principal + juros mensais'}
                    {editForm.paymentType === 'INTEREST_ONLY' && 
                      'Paga apenas os juros mensais, o principal é quitado no final'}
                    {editForm.paymentType === 'FLEXIBLE' && 
                      'Permite pagamentos variados conforme acordo com o cliente'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={editForm.status || selectedLoan?.status || 'PENDING'}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      status: e.target.value as LoanStatus 
                    }))}
                  >
                    {Object.entries(statusLabels).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateLoan}>
            Atualizar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Loan Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalhes do Empréstimo - {selectedLoan && getUserName(selectedLoan.userId)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLoan && (
            <>
              {/* Informações do Empréstimo */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <CurrencyDollar className="me-2" />
                    Informações do Empréstimo
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Cliente:</strong>
                        <p className="text-muted mb-0">{getUserName(selectedLoan.userId)}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Valor do Empréstimo:</strong>
                        <p className="text-muted mb-0">{formatCurrency(selectedLoan.loanAmount)}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Taxa de Juros:</strong>
                        <p className="text-muted mb-0">{formatPercentage(selectedLoan.interestRate)}/mês</p>
                      </div>
                      <div className="mb-3">
                        <strong>Prazo:</strong>
                        <p className="text-muted mb-0">
                          {selectedLoan.termValue} {selectedLoan.termValue === 1 ? 'vez' : 'vezes'} 
                          ({frequencyLabels[selectedLoan.paymentFrequency]})
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong>Saldo Devedor:</strong>
                        <p className={`mb-0 ${selectedLoan.outstandingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                          {formatCurrency(selectedLoan.outstandingBalance)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong>Total Pago:</strong>
                        <p className="text-muted mb-0">{formatCurrency(selectedLoan.totalPaidAmount)}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Tipo de Pagamento:</strong>
                        <p className="text-muted mb-0">
                          <Badge bg="outline-secondary" className="text-dark">
                            {paymentTypeLabels[selectedLoan.paymentType || 'FIXED_INSTALLMENTS']}
                          </Badge>
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong>Status:</strong>
                        <p className="text-muted mb-0">
                          <Badge bg={statusLabels[selectedLoan.status].variant}>
                            {statusLabels[selectedLoan.status].label}
                          </Badge>
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong>Data de Início:</strong>
                        <p className="text-muted mb-0">{formatDate(selectedLoan.startDate)}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Data de Fim:</strong>
                        <p className="text-muted mb-0">{formatDate(selectedLoan.endDate)}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Total de Juros:</strong>
                        <p className="text-success mb-0">
                          {formatCurrency(selectedLoan.totalInterest || 0)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong>Valor Total do Empréstimo:</strong>
                        <p className="text-info mb-0">
                          {formatCurrency(selectedLoan.totalLoanValue || selectedLoan.loanAmount)}
                        </p>
                      </div>
                    </Col>
                  </Row>
                  {selectedLoan.disbursementDate && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <strong>Data de Liberação:</strong>
                          <p className="text-muted mb-0">{formatDate(selectedLoan.disbursementDate)}</p>
                        </div>
                      </Col>
                    </Row>
                  )}
                  

                </Card.Body>
              </Card>

              {/* Parcelas */}
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <FileText className="me-2" />
                    Parcelas do Empréstimo
                  </h5>
                </Card.Header>
                <Card.Body>
                  {installments.length === 0 ? (
                    <div className="text-center py-4">
                      <FileText size={48} className="text-muted mb-3" />
                      <p>Nenhuma parcela encontrada para este empréstimo.</p>
                    </div>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Parcela</th>
                          <th>Vencimento</th>
                          <th>Principal</th>
                          <th>Juros</th>
                          <th>Total</th>
                          <th>Pago</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((installment) => (
                          <tr key={installment.id}>
                            <td>{installment.installmentNumber}</td>
                            <td>{formatDate(installment.dueDate)}</td>
                            <td>{formatCurrency(installment.principalAmount)}</td>
                            <td>{formatCurrency(installment.interestAmount)}</td>
                            <td>{formatCurrency(installment.totalDueAmount)}</td>
                            <td>{formatCurrency(installment.paidAmount)}</td>
                            <td>
                              <Badge bg={installment.isPaid ? 'success' : installment.overdue ? 'danger' : 'warning'}>
                                {installment.isPaid ? 'Pago' : installment.overdue ? 'Vencido' : 'Pendente'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Installments Modal */}
      <Modal show={showInstallmentsModal} onHide={() => setShowInstallmentsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Parcelas do Empréstimo - {selectedLoan && getUserName(selectedLoan.userId)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {installments.length === 0 ? (
            <div className="text-center py-4">
              <FileText size={48} className="text-muted mb-3" />
              <p>Nenhuma parcela encontrada para este empréstimo.</p>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Principal</th>
                  <th>Juros</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((installment) => (
                  <tr key={installment.id}>
                    <td>{installment.installmentNumber}</td>
                    <td>{formatDate(installment.dueDate)}</td>
                    <td>{formatCurrency(installment.principalAmount)}</td>
                    <td>{formatCurrency(installment.interestAmount)}</td>
                    <td>{formatCurrency(installment.totalDueAmount)}</td>
                    <td>{formatCurrency(installment.paidAmount)}</td>
                    <td>
                      <Badge bg={installment.isPaid ? 'success' : installment.overdue ? 'danger' : 'warning'}>
                        {installment.isPaid ? 'Pago' : installment.overdue ? 'Vencido' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInstallmentsModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Simulation Modal */}
      <Modal show={showSimulationModal} onHide={() => setShowSimulationModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Simulação de Parcelas - {selectedLoan && getUserName(selectedLoan.userId)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <strong>Simulação:</strong> Esta é uma prévia de como ficariam as parcelas se o empréstimo fosse aprovado.
            As parcelas reais serão criadas após a aprovação.
          </Alert>
          {installments.length === 0 ? (
            <div className="text-center py-4">
              <FileText size={48} className="text-muted mb-3" />
              <p>Nenhuma parcela simulada encontrada.</p>
            </div>
          ) : (
            <>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Vencimento</th>
                    <th>Principal</th>
                    <th>Juros</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((installment) => (
                    <tr key={installment.installmentNumber}>
                      <td>{installment.installmentNumber}</td>
                      <td>{formatDate(installment.dueDate)}</td>
                      <td>{formatCurrency(installment.principalAmount)}</td>
                      <td>{formatCurrency(installment.interestAmount)}</td>
                      <td>{formatCurrency(installment.totalDueAmount)}</td>
                      <td>
                        <Badge bg="secondary">
                          Simulado
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Somatórios da Simulação */}
              <Card className="mt-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <CurrencyDollar className="me-2" />
                    Resumo Financeiro da Simulação
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-primary mb-1">
                          {formatCurrency(selectedLoan?.loanAmount || 0)}
                        </h5>
                        <small className="text-muted">Valor Emprestado</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-success mb-1">
                          {formatCurrency(installments.reduce((sum, inst) => sum + inst.interestAmount, 0))}
                        </h5>
                        <small className="text-muted">Total em Juros</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-info mb-1">
                          {formatCurrency(installments.reduce((sum, inst) => sum + inst.totalDueAmount, 0))}
                        </h5>
                        <small className="text-muted">Valor Total a Pagar</small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSimulationModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Loans;
