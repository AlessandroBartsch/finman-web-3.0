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
  Row,
  Col,
  InputGroup,
  FormControl
} from 'react-bootstrap';
import { 
  Search,
  Filter,
  CurrencyDollar,
  CheckCircle,
  FileText,
  Eye,
  Pencil,
  Plus
} from 'react-bootstrap-icons';
import { installmentService, loanService, userService } from '../services/api';
import type { 
  LoanInstallment, 
  Loan,
  User
} from '../types';

const Installments: React.FC = () => {
  console.log('Renderizando componente Installments');
  
  const [installments, setInstallments] = useState<LoanInstallment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<LoanInstallment | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [error, setError] = useState<string>('');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loanFilter, setLoanFilter] = useState<number>(0);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0
  });

  const [editForm, setEditForm] = useState({
    installmentNumber: 0,
    dueDate: '',
    principalAmount: 0,
    interestAmount: 0,
    totalDueAmount: 0
  });

  const [addForm, setAddForm] = useState({
    loanId: 0,
    installmentNumber: 0,
    dueDate: '',
    principalAmount: 0,
    interestAmount: 0,
    totalDueAmount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  // Preencher formulário de edição quando selecionar uma parcela
  useEffect(() => {
    if (selectedInstallment && showEditModal) {
      setEditForm({
        installmentNumber: selectedInstallment.installmentNumber,
        dueDate: selectedInstallment.dueDate.split('T')[0],
        principalAmount: selectedInstallment.principalAmount,
        interestAmount: selectedInstallment.interestAmount,
        totalDueAmount: selectedInstallment.totalDueAmount
      });
    }
  }, [selectedInstallment, showEditModal]);

  // Recalcular juros quando data ou principal mudar no formulário de edição
  useEffect(() => {
    if (showEditModal && selectedInstallment && editForm.dueDate && editForm.principalAmount > 0) {
      recalculateInterest(selectedInstallment.loanId, editForm.dueDate, editForm.principalAmount)
        .then(interest => {
          setEditForm(prev => ({
            ...prev,
            interestAmount: interest,
            totalDueAmount: prev.principalAmount + interest
          }));
        });
    }
  }, [editForm.dueDate, editForm.principalAmount, showEditModal, selectedInstallment]);

  // Recalcular juros quando data ou principal mudar no formulário de adição
  useEffect(() => {
    if (showAddModal && addForm.loanId && addForm.dueDate && addForm.principalAmount > 0) {
      recalculateInterest(addForm.loanId, addForm.dueDate, addForm.principalAmount)
        .then(interest => {
          setAddForm(prev => ({
            ...prev,
            interestAmount: interest,
            totalDueAmount: prev.principalAmount + interest
          }));
        });
    }
  }, [addForm.dueDate, addForm.principalAmount, addForm.loanId, showAddModal]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados das parcelas...');
      
      const [installmentsResponse, loansResponse, usersResponse] = await Promise.all([
        installmentService.getAll(),
        loanService.getAll(),
        userService.getAll()
      ]);
      
      console.log('Dados carregados:', {
        installments: installmentsResponse.data,
        loans: loansResponse.data,
        users: usersResponse.data
      });
      
      setInstallments(installmentsResponse.data);
      setLoans(loansResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async () => {
    if (!selectedInstallment) return;
    
    try {
      await installmentService.pay(selectedInstallment.id, paymentForm.amount);
      setShowPaymentModal(false);
      setPaymentForm({ amount: 0 });
      setSelectedInstallment(null);
      loadData();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao pagar parcela');
    }
  };

  const handlePayFullInstallment = async (installment: LoanInstallment) => {
    if (!window.confirm(`Tem certeza que deseja pagar a parcela ${installment.installmentNumber} completa?`)) {
      return;
    }
    
    try {
      await installmentService.markAsPaid(installment.id);
      loadData();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao pagar parcela');
    }
  };

  const handleEditInstallment = async () => {
    if (!selectedInstallment) return;
    
    try {
      // Recalcular juros baseado na nova data de vencimento
      const recalculatedInterest = await recalculateInterest(
        selectedInstallment.loanId,
        editForm.dueDate,
        editForm.principalAmount
      );
      
      const updatedInstallment = {
        ...editForm,
        interestAmount: recalculatedInterest,
        totalDueAmount: editForm.principalAmount + recalculatedInterest
      };
      
      await installmentService.update(selectedInstallment.id, updatedInstallment);
      setShowEditModal(false);
      setEditForm({
        installmentNumber: 0,
        dueDate: '',
        principalAmount: 0,
        interestAmount: 0,
        totalDueAmount: 0
      });
      setSelectedInstallment(null);
      loadData();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao editar parcela');
    }
  };

  const handleAddInstallment = async () => {
    try {
      // Recalcular juros baseado na data de vencimento
      const recalculatedInterest = await recalculateInterest(
        addForm.loanId,
        addForm.dueDate,
        addForm.principalAmount
      );
      
      const newInstallment = {
        ...addForm,
        interestAmount: recalculatedInterest,
        totalDueAmount: addForm.principalAmount + recalculatedInterest
      };
      
      await installmentService.create(addForm.loanId, newInstallment);
      setShowAddModal(false);
      setAddForm({
        loanId: 0,
        installmentNumber: 0,
        dueDate: '',
        principalAmount: 0,
        interestAmount: 0,
        totalDueAmount: 0
      });
      loadData();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar parcela');
    }
  };

  const recalculateInterest = async (loanId: number, dueDate: string, principalAmount: number): Promise<number> => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return 0;
      
      // Calcular juros proporcional aos dias
      const startDate = new Date(loan.startDate);
      const endDate = new Date(dueDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Taxa de juros mensal para diária
      const dailyRate = loan.interestRate / 30;
      const interestAmount = principalAmount * dailyRate * daysDiff;
      
      return Math.round(interestAmount * 100) / 100; // Arredondar para 2 casas decimais
    } catch (error) {
      console.error('Erro ao recalcular juros:', error);
      return 0;
    }
  };

  const getFilteredInstallments = () => {
    console.log('Filtrando parcelas:', {
      total: installments.length,
      searchTerm,
      statusFilter,
      loanFilter
    });
    
    const filtered = installments.filter(installment => {
      const matchesSearch = searchTerm === '' || 
        installment.installmentNumber.toString().includes(searchTerm) ||
        getUserName(installment.loanId).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'paid' && installment.isPaid) ||
        (statusFilter === 'pending' && !installment.isPaid) ||
        (statusFilter === 'overdue' && installment.overdue);
      
      const matchesLoan = loanFilter === 0 || installment.loanId === loanFilter;
      
      return matchesSearch && matchesStatus && matchesLoan;
    });
    
    console.log('Parcelas filtradas:', filtered.length);
    return filtered;
  };

  const getUserName = (loanId: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      console.warn(`Empréstimo não encontrado para ID: ${loanId}`);
      return 'N/A';
    }
    
    const user = users.find(u => u.id === loan.userId);
    if (!user) {
      console.warn(`Usuário não encontrado para ID: ${loan.userId}`);
      return 'N/A';
    }
    
    return `${user.firstName} ${user.lastName}`;
  };

  const getLoanInfo = (loanId: number) => {
    return loans.find(l => l.id === loanId);
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    } catch (error) {
      console.error('Erro ao formatar moeda:', value, error);
      return `R$ ${value.toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return dateString;
    }
  };

  const filteredInstallments = getFilteredInstallments();

  const stats = {
    total: installments.length,
    paid: installments.filter(inst => inst.isPaid).length,
    pending: installments.filter(inst => !inst.isPaid).length,
    overdue: installments.filter(inst => inst.overdue).length,
    totalAmount: installments.reduce((sum, inst) => sum + inst.totalDueAmount, 0),
    paidAmount: installments.reduce((sum, inst) => sum + inst.paidAmount, 0),
    remainingAmount: installments.reduce((sum, inst) => sum + inst.remainingAmount, 0)
  };

  console.log('Renderizando com dados:', {
    installments: installments.length,
    filtered: filteredInstallments.length,
    stats
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FileText className="me-2" />
          Parcelas
        </h2>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Dashboard Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{stats.total}</h4>
              <small className="text-muted">Total de Parcelas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">{stats.paid}</h4>
              <small className="text-muted">Parcelas Pagas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{stats.pending}</h4>
              <small className="text-muted">Parcelas Pendentes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger">{stats.overdue}</h4>
              <small className="text-muted">Parcelas Vencidas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{formatCurrency(stats.totalAmount)}</h5>
              <small className="text-muted">Total Devido</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{formatCurrency(stats.paidAmount)}</h5>
              <small className="text-muted">Total Pago</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-danger">{formatCurrency(stats.remainingAmount)}</h5>
              <small className="text-muted">Total Restante</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <Filter className="me-2" />
            Filtros
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <FormControl
                  placeholder="Buscar por parcela ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="paid">Pagas</option>
                <option value="pending">Pendentes</option>
                <option value="overdue">Vencidas</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={loanFilter}
                onChange={(e) => setLoanFilter(parseInt(e.target.value))}
              >
                <option value={0}>Todos os Empréstimos</option>
                {loans.map(loan => (
                  <option key={loan.id} value={loan.id}>
                    {getUserName(loan.id)} - {formatCurrency(loan.loanAmount)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLoanFilter(0);
                }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de Parcelas */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <FileText className="me-2" />
              Parcelas ({filteredInstallments.length})
            </h6>
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setSelectedInstallment(null);
                setSelectedLoan(null);
                setShowAddModal(true);
              }}
            >
              <Plus className="me-1" />
              Adicionar Parcela
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredInstallments.length === 0 ? (
            <div className="text-center py-4">
              <FileText size={48} className="text-muted mb-3" />
              <p>Nenhuma parcela encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Cliente</th>
                  <th>Empréstimo</th>
                  <th>Vencimento</th>
                  <th>Principal</th>
                  <th>Juros</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Restante</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallments.map((installment) => {
                  console.log('Renderizando parcela:', installment);
                  return (
                    <tr key={installment.id}>
                      <td>{installment.installmentNumber}</td>
                      <td>{getUserName(installment.loanId)}</td>
                      <td>
                        <small className="text-muted">
                          {formatCurrency(getLoanInfo(installment.loanId)?.loanAmount || 0)}
                        </small>
                      </td>
                      <td>{formatDate(installment.dueDate)}</td>
                      <td>{formatCurrency(installment.principalAmount)}</td>
                      <td>{formatCurrency(installment.interestAmount)}</td>
                      <td>{formatCurrency(installment.totalDueAmount)}</td>
                      <td>{formatCurrency(installment.paidAmount)}</td>
                      <td>
                        <span className={installment.remainingAmount > 0 ? 'text-danger' : 'text-success'}>
                          {formatCurrency(installment.remainingAmount)}
                        </span>
                      </td>
                      <td>
                        <Badge bg={installment.isPaid ? 'success' : installment.overdue ? 'danger' : 'warning'}>
                          {installment.isPaid ? 'Pago' : installment.overdue ? 'Vencido' : 'Pendente'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setSelectedLoan(getLoanInfo(installment.loanId) || null);
                              setShowViewModal(true);
                            }}
                            title="Ver Detalhes"
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setSelectedLoan(getLoanInfo(installment.loanId) || null);
                              setShowEditModal(true);
                            }}
                            title="Editar Parcela"
                          >
                            <Pencil />
                          </Button>
                          {!installment.isPaid && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handlePayFullInstallment(installment)}
                                title="Pagar Parcela Completa"
                              >
                                <CheckCircle />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedInstallment(installment);
                                  setPaymentForm({ amount: installment.remainingAmount });
                                  setShowPaymentModal(true);
                                }}
                                title="Pagar Parcialmente"
                              >
                                <CurrencyDollar />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pagar Parcela Parcialmente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstallment && (
            <>
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">
                    <FileText className="me-2" />
                    Informações da Parcela {selectedInstallment.installmentNumber}
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Cliente:</strong> {getUserName(selectedInstallment.loanId)}</p>
                      <p><strong>Vencimento:</strong> {formatDate(selectedInstallment.dueDate)}</p>
                      <p><strong>Principal:</strong> {formatCurrency(selectedInstallment.principalAmount)}</p>
                      <p><strong>Juros:</strong> {formatCurrency(selectedInstallment.interestAmount)}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Valor Total:</strong> {formatCurrency(selectedInstallment.totalDueAmount)}</p>
                      <p><strong>Já Pago:</strong> {formatCurrency(selectedInstallment.paidAmount)}</p>
                      <p className="text-primary"><strong>Valor Restante:</strong> {formatCurrency(selectedInstallment.remainingAmount)}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Valor a Pagar</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedInstallment.remainingAmount}
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                  <Form.Text className="text-muted">
                    Valor máximo: {formatCurrency(selectedInstallment.remainingAmount)}
                  </Form.Text>
                </Form.Group>
                
                {paymentForm.amount > 0 && (
                  <Alert variant="info">
                    <strong>Resumo do Pagamento:</strong><br />
                    Valor a pagar: {formatCurrency(paymentForm.amount)}<br />
                    Após o pagamento: {formatCurrency(selectedInstallment.remainingAmount - paymentForm.amount)} restante
                  </Alert>
                )}
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handlePayInstallment}
            disabled={!paymentForm.amount || paymentForm.amount <= 0 || paymentForm.amount > (selectedInstallment?.remainingAmount || 0)}
          >
            <CurrencyDollar className="me-1" />
            Confirmar Pagamento
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalhes da Parcela - {selectedInstallment && getUserName(selectedInstallment.loanId)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstallment && selectedLoan && (
            <>
              <Row>
                <Col md={6}>
                  <h6>Informações da Parcela</h6>
                  <p><strong>Número:</strong> {selectedInstallment.installmentNumber}</p>
                  <p><strong>Vencimento:</strong> {formatDate(selectedInstallment.dueDate)}</p>
                  <p><strong>Principal:</strong> {formatCurrency(selectedInstallment.principalAmount)}</p>
                  <p><strong>Juros:</strong> {formatCurrency(selectedInstallment.interestAmount)}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedInstallment.totalDueAmount)}</p>
                </Col>
                <Col md={6}>
                  <h6>Status do Pagamento</h6>
                  <p><strong>Pago:</strong> {formatCurrency(selectedInstallment.paidAmount)}</p>
                  <p><strong>Restante:</strong> {formatCurrency(selectedInstallment.remainingAmount)}</p>
                  <p><strong>Status:</strong> 
                    <Badge bg={selectedInstallment.isPaid ? 'success' : selectedInstallment.overdue ? 'danger' : 'warning'} className="ms-2">
                      {selectedInstallment.isPaid ? 'Pago' : selectedInstallment.overdue ? 'Vencido' : 'Pendente'}
                    </Badge>
                  </p>
                  <p><strong>Criado em:</strong> {formatDate(selectedInstallment.createdAt)}</p>
                  {selectedInstallment.paidAt && (
                    <p><strong>Pago em:</strong> {formatDate(selectedInstallment.paidAt)}</p>
                  )}
                </Col>
              </Row>
              
              <hr />
              
              <Row>
                <Col md={12}>
                  <h6>Informações do Empréstimo</h6>
                  <p><strong>Cliente:</strong> {getUserName(selectedLoan.id)}</p>
                  <p><strong>Valor do Empréstimo:</strong> {formatCurrency(selectedLoan.loanAmount)}</p>
                  <p><strong>Taxa de Juros:</strong> {(selectedLoan.interestRate * 100).toFixed(2)}% ao mês</p>
                  <p><strong>Status:</strong> {selectedLoan.status}</p>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Editar Parcela - {selectedInstallment && getUserName(selectedInstallment.loanId)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstallment && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número da Parcela</Form.Label>
                    <Form.Control
                      type="number"
                      value={editForm.installmentNumber || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        installmentNumber: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data de Vencimento</Form.Label>
                    <Form.Control
                      type="date"
                      value={editForm.dueDate || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        dueDate: e.target.value 
                      }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor Principal</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={editForm.principalAmount || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        principalAmount: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor dos Juros (Recalculado automaticamente)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={editForm.interestAmount || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor Total</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={editForm.totalDueAmount || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Alert variant="info">
                <strong>Nota:</strong> Os juros serão recalculados automaticamente baseado na nova data de vencimento e valor principal.
              </Alert>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            onClick={handleEditInstallment}
            disabled={!editForm.installmentNumber || !editForm.dueDate || editForm.principalAmount <= 0}
          >
            <Pencil className="me-1" />
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nova Parcela</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Empréstimo</Form.Label>
                  <Form.Select
                    value={addForm.loanId || ''}
                    onChange={(e) => setAddForm(prev => ({ 
                      ...prev, 
                      loanId: parseInt(e.target.value) || 0 
                    }))}
                  >
                    <option value="">Selecione um empréstimo</option>
                    {loans.map(loan => (
                      <option key={loan.id} value={loan.id}>
                        {getUserName(loan.id)} - {formatCurrency(loan.loanAmount)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número da Parcela</Form.Label>
                  <Form.Control
                    type="number"
                    value={addForm.installmentNumber || ''}
                    onChange={(e) => setAddForm(prev => ({ 
                      ...prev, 
                      installmentNumber: parseInt(e.target.value) || 0 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Vencimento</Form.Label>
                  <Form.Control
                    type="date"
                    value={addForm.dueDate || ''}
                    onChange={(e) => setAddForm(prev => ({ 
                      ...prev, 
                      dueDate: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Principal</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={addForm.principalAmount || ''}
                    onChange={(e) => setAddForm(prev => ({ 
                      ...prev, 
                      principalAmount: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor dos Juros (Recalculado automaticamente)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={addForm.interestAmount || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Total</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={addForm.totalDueAmount || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Alert variant="info">
              <strong>Nota:</strong> Os juros serão calculados automaticamente baseado na data de vencimento e valor principal.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddInstallment}
            disabled={!addForm.loanId || !addForm.installmentNumber || !addForm.dueDate || addForm.principalAmount <= 0}
          >
            <Plus className="me-1" />
            Adicionar Parcela
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Installments;
