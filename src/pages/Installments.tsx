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
  FormControl,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { 
  Search,
  Filter,
  CurrencyDollar,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Eye,
  Trash
} from 'react-bootstrap-icons';
import { installmentService, loanService, userService } from '../services/api';
import type { 
  LoanInstallment, 
  Loan,
  User
} from '../types';

const Installments: React.FC = () => {
  const [installments, setInstallments] = useState<LoanInstallment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<LoanInstallment | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [error, setError] = useState<string>('');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loanFilter, setLoanFilter] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Estados para seleção múltipla
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [installmentsResponse, loansResponse, usersResponse] = await Promise.all([
        installmentService.getAll(),
        loanService.getAll(),
        userService.getAll()
      ]);
      
      setInstallments(installmentsResponse.data);
      setLoans(loansResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
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

  const handlePaySelectedInstallments = async () => {
    if (selectedInstallments.length === 0) return;
    
    if (!window.confirm(`Tem certeza que deseja marcar ${selectedInstallments.length} parcelas como pagas?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedInstallments.map(id => installmentService.markAsPaid(id)));
      setSelectedInstallments([]);
      setSelectAll(false);
      loadData();
      setError('');
    } catch (err: any) {
      setError('Erro ao pagar parcelas selecionadas');
    }
  };

  const handleSelectInstallment = (installmentId: number) => {
    setSelectedInstallments(prev => 
      prev.includes(installmentId) 
        ? prev.filter(id => id !== installmentId)
        : [...prev, installmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInstallments([]);
      setSelectAll(false);
    } else {
      const filteredInstallments = getFilteredInstallments();
      setSelectedInstallments(filteredInstallments.map(inst => inst.id));
      setSelectAll(true);
    }
  };

  const getFilteredInstallments = () => {
    return installments.filter(installment => {
      const matchesSearch = searchTerm === '' || 
        installment.installmentNumber.toString().includes(searchTerm) ||
        getUserName(installment.loanId).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'paid' && installment.isPaid) ||
        (statusFilter === 'pending' && !installment.isPaid) ||
        (statusFilter === 'overdue' && installment.overdue);
      
      const matchesLoan = loanFilter === 0 || installment.loanId === loanFilter;
      
      const matchesDate = dateFilter === '' || installment.dueDate.includes(dateFilter);
      
      return matchesSearch && matchesStatus && matchesLoan && matchesDate;
    });
  };

  const getUserName = (loanId: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return 'N/A';
    
    const user = users.find(u => u.id === loan.userId);
    return user ? `${user.firstName} ${user.lastName}` : 'N/A';
  };

  const getLoanInfo = (loanId: number) => {
    return loans.find(l => l.id === loanId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
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
            <Col md={3}>
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
            <Col md={2}>
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
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Data de vencimento"
              />
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLoanFilter(0);
                  setDateFilter('');
                }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Ações em Lote */}
      {selectedInstallments.length > 0 && (
        <Card className="mb-4 border-warning">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>{selectedInstallments.length}</strong> parcelas selecionadas
              </span>
              <div>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={handlePaySelectedInstallments}
                  className="me-2"
                >
                  <CheckCircle className="me-1" />
                  Marcar como Pagas
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedInstallments([]);
                    setSelectAll(false);
                  }}
                >
                  Cancelar Seleção
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tabela de Parcelas */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <FileText className="me-2" />
              Parcelas ({filteredInstallments.length})
            </h6>
            <div>
              <Form.Check
                type="checkbox"
                label="Selecionar Todas"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </div>
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
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                {filteredInstallments.map((installment) => (
                  <tr key={installment.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedInstallments.includes(installment.id)}
                        onChange={() => handleSelectInstallment(installment.id)}
                      />
                    </td>
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
                ))}
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
    </div>
  );
};

export default Installments;
