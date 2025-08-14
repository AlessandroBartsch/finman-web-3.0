import React from 'react';
import { 
  People, 
  FileText, 
  CurrencyDollar, 
  GraphUp,
  Folder2Open,
  Calendar,
  ExclamationTriangle,
  CheckCircle
} from 'react-bootstrap-icons';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total de Clientes',
      value: '1.234',
      change: '+12%',
      changeType: 'positive',
      icon: People,
      color: 'bg-primary',
      bgColor: 'bg-primary bg-opacity-10'
    },
    {
      name: 'Empréstimos Ativos',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-success',
      bgColor: 'bg-success bg-opacity-10'
    },
    {
      name: 'Valor Total',
      value: 'R$ 2.5M',
      change: '+8%',
      changeType: 'positive',
      icon: CurrencyDollar,
      color: 'bg-info',
      bgColor: 'bg-info bg-opacity-10'
    },
    {
      name: 'Documentos',
      value: '456',
      change: '+15%',
      changeType: 'positive',
      icon: Folder2Open,
      color: 'bg-warning',
      bgColor: 'bg-warning bg-opacity-10'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'loan',
      message: 'Novo empréstimo aprovado para João Silva',
      time: '2 horas atrás',
      status: 'success',
    },
    {
      id: 2,
      type: 'payment',
      message: 'Parcela paga por Maria Santos',
      time: '4 horas atrás',
      status: 'success',
    },
    {
      id: 3,
      type: 'document',
      message: 'Documento enviado por Pedro Costa',
      time: '6 horas atrás',
      status: 'pending',
    },
    {
      id: 4,
      type: 'overdue',
      message: 'Parcela vencida de Ana Oliveira',
      time: '1 dia atrás',
      status: 'warning',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-success" />;
      case 'warning':
        return <ExclamationTriangle className="text-warning" />;
      case 'pending':
        return <Calendar className="text-info" />;
      default:
        return <CheckCircle className="text-muted" />;
    }
  };

  return (
    <div className="h-100">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-2">Dashboard</h1>
        <p className="text-muted mb-0">
          Visão geral do sistema de gerenciamento financeiro
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="col-sm-6 col-lg-3">
              <div className={`card h-100 border-0 shadow-sm ${stat.bgColor}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-subtitle mb-1 text-muted small">{stat.name}</h6>
                      <h3 className="card-title mb-2 h4">{stat.value}</h3>
                      <div className="d-flex align-items-center">
                        <GraphUp className={`me-1 small ${stat.changeType === 'positive' ? 'text-success' : 'text-danger'}`} />
                        <small className={`${stat.changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
                          {stat.change}
                        </small>
                        <small className="text-muted ms-1 small">vs mês anterior</small>
                      </div>
                    </div>
                    <div className={`${stat.color} text-white rounded p-2 ms-3`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Row */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 bg-light">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Atividades Recentes</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="list-group-item d-flex align-items-center border-0 py-3">
                    <div className="me-3">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium small">{activity.message}</p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3 bg-light">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Ações Rápidas</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-primary btn-sm">
                  <People className="me-2" />
                  Novo Cliente
                </button>
                <button className="btn btn-success btn-sm">
                  <FileText className="me-2" />
                  Novo Empréstimo
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <Folder2Open className="me-2" />
                  Gerenciar Documentos
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm bg-light">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Resumo do Mês</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Empréstimos Aprovados</span>
                <span className="fw-medium">23</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Valor Total Aprovado</span>
                <span className="fw-medium">R$ 450.000</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Parcelas Pagas</span>
                <span className="fw-medium">156</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Parcelas Vencidas</span>
                <span className="text-danger fw-medium">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
