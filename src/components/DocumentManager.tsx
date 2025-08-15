import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { 
  FileEarmarkText, 
  Upload, 
  Download, 
  Eye, 
  Trash, 
  CheckCircle, 
  XCircle 
} from 'react-bootstrap-icons';
import { documentService } from '../services/api';
import { DocumentTypes } from '../types';
import type { Document as DocumentModel, CreateDocumentForm, DocumentType } from '../types';

interface DocumentManagerProps {
  userId: number;
  userName: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ userId, userName }) => {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<CreateDocumentForm>({
    file: new File([], ''),
    documentType: DocumentTypes.RG,
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const documentTypeLabels = {
    [DocumentTypes.RG]: 'RG',
    [DocumentTypes.CPF]: 'CPF',
    [DocumentTypes.COMPROVANTE_RESIDENCIA]: 'Comprovante de Residência',
    [DocumentTypes.COMPROVANTE_RENDA]: 'Comprovante de Renda',
    [DocumentTypes.CONTRACHEQUE]: 'Contracheque',
    [DocumentTypes.EXTRATO_BANCARIO]: 'Extrato Bancário',
    [DocumentTypes.OUTROS]: 'Outros'
  } as const;

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await documentService.getUserDocuments(userId);
      setDocuments(response.data || []);
    } catch (err) {
      setError('Erro ao carregar documentos');
      console.error('Erro ao carregar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || uploadForm.file.size === 0) {
      setError('Selecione um arquivo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('documentType', uploadForm.documentType);
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }

      await documentService.upload(userId, formData);
      setShowUploadModal(false);
      setUploadForm({
        file: new File([], ''),
        documentType: DocumentTypes.RG,
        description: ''
      });
      loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: DocumentModel) => {
    try {
      const response = await documentService.download(document.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: document.contentType 
      }));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalFileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao fazer download do documento');
    }
  };

  const handleView = async (document: DocumentModel) => {
    try {
      const response = await documentService.view(document.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: document.contentType 
      }));
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao visualizar documento');
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await documentService.delete(documentId);
      loadDocuments();
    } catch (err) {
      setError('Erro ao excluir documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FileEarmarkText className="me-2" />
          Documentos de {userName}
        </h5>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="me-1" />
          Adicionar Documento
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <FileEarmarkText size={48} className="mb-3" />
            <p>Nenhum documento cadastrado</p>
          </div>
        ) : (
          <div className="row">
            {documents.map((doc) => (
              <div key={doc.id} className="col-md-6 col-lg-4 mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge 
                        bg={doc.isVerified ? 'success' : 'warning'}
                        className="text-white"
                      >
                        {doc.isVerified ? (
                          <>
                            <CheckCircle className="me-1" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <XCircle className="me-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                    
                    <h6 className="card-title">{documentTypeLabels[doc.documentType]}</h6>
                    <p className="card-text small text-muted mb-2">
                      {doc.originalFileName}
                    </p>
                    <p className="card-text small text-muted mb-3">
                      {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    
                    {doc.description && (
                      <p className="card-text small mb-3">{doc.description}</p>
                    )}
                    
                    <div className="d-flex gap-2">
                                             <Button
                         variant="outline-primary"
                         size="sm"
                         onClick={() => handleView(doc)}
                       >
                        <Eye className="me-1" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="me-1" />
                        Download
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Card.Body>

      {/* Modal de Upload */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Documento</Form.Label>
              <Form.Select
                value={uploadForm.documentType}
                onChange={(e) => setUploadForm(prev => ({ 
                  ...prev, 
                  documentType: e.target.value as DocumentType 
                }))}
              >
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Arquivo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Apenas imagens e PDFs são permitidos. Máximo 10MB.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                placeholder="Descrição do documento..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="me-1" />
                Enviar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DocumentManager;
