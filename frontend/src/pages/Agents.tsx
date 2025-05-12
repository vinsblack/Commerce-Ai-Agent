import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Inventory as InventoryIcon,
  PriceChange as PriceChangeIcon,
  Support as SupportIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';

interface Agent {
  id: string;
  name: string;
  type: 'inventory' | 'pricing' | 'customer_service' | 'marketing';
  status: 'active' | 'inactive' | 'running' | 'error';
  description: string;
  created_at: string;
  last_run: string | null;
  settings: {
    run_frequency: number;
    auto_run: boolean;
    confidence_threshold: number;
    max_actions_per_run: number;
    notification_on_completion: boolean;
    [key: string]: any;
  };
}

interface AgentRun {
  id: string;
  agent_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  actions_taken: number;
  results: string;
}

const Agents: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'inventory',
    description: '',
    settings: {
      run_frequency: 24,
      auto_run: true,
      confidence_threshold: 0.7,
      max_actions_per_run: 50,
      notification_on_completion: true,
    },
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query per recuperare gli agenti
  const {
    data: agents,
    isLoading,
    isError,
    refetch,
  } = useQuery<Agent[]>(
    'agents',
    async () => {
      const response = await axios.get('/api/v1/agents');
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Query per recuperare la cronologia delle esecuzioni di un agente
  const {
    data: agentRuns,
    isLoading: isLoadingRuns,
  } = useQuery<AgentRun[]>(
    ['agentRuns', currentAgent?.id],
    async () => {
      const response = await axios.get(`/api/v1/agents/${currentAgent?.id}/runs`);
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Mutation per creare un nuovo agente
  const createAgentMutation = useMutation(
    async (data: any) => {
      const response = await axios.post('/api/v1/agents', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setOpenDialog(false);
        setSuccessMessage('Agente creato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la creazione dell\'agente');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per aggiornare un agente
  const updateAgentMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/v1/agents/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setOpenDialog(false);
        setSuccessMessage('Agente aggiornato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'aggiornamento dell\'agente');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per eliminare un agente
  const deleteAgentMutation = useMutation(
    async (id: string) => {
      const response = await axios.delete(`/api/v1/agents/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setSuccessMessage('Agente eliminato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'eliminazione dell\'agente');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per avviare un agente
  const startAgentMutation = useMutation(
    async (id: string) => {
      const response = await axios.post(`/api/v1/agents/${id}/start`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setSuccessMessage('Agente avviato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'avvio dell\'agente');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per fermare un agente
  const stopAgentMutation = useMutation(
    async (id: string) => {
      const response = await axios.post(`/api/v1/agents/${id}/stop`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        setSuccessMessage('Agente fermato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'arresto dell\'agente');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setCurrentAgent(agent);
      setFormData({
        name: agent.name,
        type: agent.type,
        description: agent.description,
        settings: { ...agent.settings },
      });
    } else {
      setCurrentAgent(null);
      setFormData({
        name: '',
        type: 'inventory',
        description: '',
        settings: {
          run_frequency: 24,
          auto_run: true,
          confidence_threshold: 0.7,
          max_actions_per_run: 50,
          notification_on_completion: true,
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenHistoryDialog = (agent: Agent) => {
    setCurrentAgent(agent);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSettingsChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [name]: value,
      },
    });
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      settings: formData.settings,
    };

    if (currentAgent) {
      updateAgentMutation.mutate({ id: currentAgent.id, data });
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo agente?')) {
      deleteAgentMutation.mutate(id);
    }
  };

  const handleStartAgent = (id: string) => {
    startAgentMutation.mutate(id);
  };

  const handleStopAgent = (id: string) => {
    stopAgentMutation.mutate(id);
  };

  // Dati di esempio per gli agenti
  const sampleAgents: Agent[] = [
    {
      id: '1',
      name: 'Gestore Inventario',
      type: 'inventory',
      status: 'active',
      description: 'Monitora e gestisce l\'inventario, suggerendo riordini e ottimizzando i livelli di stock.',
      created_at: '2025-04-10T09:00:00Z',
      last_run: '2025-05-11T14:30:00Z',
      settings: {
        run_frequency: 24,
        auto_run: true,
        confidence_threshold: 0.7,
        max_actions_per_run: 50,
        notification_on_completion: true,
        min_stock_threshold: 5,
      },
    },
    {
      id: '2',
      name: 'Ottimizzatore Prezzi',
      type: 'pricing',
      status: 'running',
      description: 'Analizza il mercato e la concorrenza per suggerire prezzi ottimali per i prodotti.',
      created_at: '2025-04-15T11:30:00Z',
      last_run: '2025-05-12T10:15:00Z',
      settings: {
        run_frequency: 12,
        auto_run: true,
        confidence_threshold: 0.8,
        max_actions_per_run: 30,
        notification_on_completion: true,
        max_price_change_percent: 10,
      },
    },
    {
      id: '3',
      name: 'Assistente Clienti',
      type: 'customer_service',
      status: 'inactive',
      description: 'Risponde alle domande frequenti dei clienti e gestisce i problemi comuni.',
      created_at: '2025-04-20T14:45:00Z',
      last_run: null,
      settings: {
        run_frequency: 6,
        auto_run: false,
        confidence_threshold: 0.9,
        max_actions_per_run: 100,
        notification_on_completion: true,
        auto_reply_enabled: true,
      },
    },
    {
      id: '4',
      name: 'Stratega Marketing',
      type: 'marketing',
      status: 'error',
      description: 'Crea e ottimizza campagne di marketing basate sui dati di vendita e comportamento dei clienti.',
      created_at: '2025-05-01T10:00:00Z',
      last_run: '2025-05-10T08:45:00Z',
      settings: {
        run_frequency: 48,
        auto_run: true,
        confidence_threshold: 0.75,
        max_actions_per_run: 20,
        notification_on_completion: true,
        budget_limit: 1000,
      },
    },
  ];

  // Dati di esempio per le esecuzioni degli agenti
  const sampleAgentRuns: AgentRun[] = [
    {
      id: '1',
      agent_id: currentAgent?.id || '1',
      status: 'completed',
      started_at: '2025-05-11T14:30:00Z',
      completed_at: '2025-05-11T14:35:00Z',
      actions_taken: 12,
      results: 'Aggiornati 5 livelli di stock. Suggerito riordino per 3 prodotti.',
    },
    {
      id: '2',
      agent_id: currentAgent?.id || '1',
      status: 'completed',
      started_at: '2025-05-10T14:30:00Z',
      completed_at: '2025-05-10T14:33:00Z',
      actions_taken: 8,
      results: 'Aggiornati 3 livelli di stock. Nessun riordino necessario.',
    },
    {
      id: '3',
      agent_id: currentAgent?.id || '1',
      status: 'failed',
      started_at: '2025-05-09T14:30:00Z',
      completed_at: '2025-05-09T14:31:00Z',
      actions_taken: 0,
      results: 'Errore di connessione al database.',
    },
  ];

  const displayAgents = agents || sampleAgents;
  const displayAgentRuns = agentRuns || sampleAgentRuns;

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <InventoryIcon />;
      case 'pricing':
        return <PriceChangeIcon />;
      case 'customer_service':
        return <SupportIcon />;
      case 'marketing':
        return <CampaignIcon />;
      default:
        return <PsychologyIcon />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            label="Attivo"
            color="success"
            size="small"
          />
        );
      case 'inactive':
        return (
          <Chip
            label="Inattivo"
            color="default"
            size="small"
          />
        );
      case 'running':
        return (
          <Chip
            label="In esecuzione"
            color="primary"
            size="small"
          />
        );
      case 'error':
        return (
          <Chip
            label="Errore"
            color="error"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Agenti AI</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuovo agente
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento degli agenti
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayAgents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: 'primary.main' }}>
                      {getAgentIcon(agent.type)}
                    </Box>
                    <Typography variant="h6">{agent.name}</Typography>
                    <Box sx={{ ml: 'auto' }}>
                      {getStatusChip(agent.status)}
                    </Box>
                  </Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {agent.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Frequenza: ogni {agent.settings.run_frequency} ore
                  </Typography>
                  {agent.last_run && (
                    <Typography variant="body2">
                      Ultima esecuzione: {new Date(agent.last_run).toLocaleString('it-IT')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {agent.status === 'running' ? (
                    <Button
                      size="small"
                      startIcon={<StopIcon />}
                      color="error"
                      onClick={() => handleStopAgent(agent.id)}
                    >
                      Ferma
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      color="primary"
                      onClick={() => handleStartAgent(agent.id)}
                      disabled={agent.status === 'error'}
                    >
                      Avvia
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<HistoryIcon />}
                    onClick={() => handleOpenHistoryDialog(agent)}
                  >
                    Cronologia
                  </Button>
                  <Button
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => handleOpenDialog(agent)}
                  >
                    Impostazioni
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(agent.id)}
                  >
                    Elimina
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog per creare/modificare un agente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAgent ? 'Modifica agente' : 'Nuovo agente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Tipo"
                >
                  <MenuItem value="inventory">Gestione Inventario</MenuItem>
                  <MenuItem value="pricing">Ottimizzazione Prezzi</MenuItem>
                  <MenuItem value="customer_service">Servizio Clienti</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrizione"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Impostazioni
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequenza di esecuzione (ore)</InputLabel>
                <Select
                  value={formData.settings.run_frequency}
                  onChange={(e) => handleSettingsChange('run_frequency', e.target.value)}
                  label="Frequenza di esecuzione (ore)"
                >
                  <MenuItem value={1}>Ogni ora</MenuItem>
                  <MenuItem value={3}>Ogni 3 ore</MenuItem>
                  <MenuItem value={6}>Ogni 6 ore</MenuItem>
                  <MenuItem value={12}>Ogni 12 ore</MenuItem>
                  <MenuItem value={24}>Ogni 24 ore</MenuItem>
                  <MenuItem value={48}>Ogni 48 ore</MenuItem>
                  <MenuItem value={72}>Ogni 72 ore</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Azioni massime per esecuzione"
                type="number"
                value={formData.settings.max_actions_per_run}
                onChange={(e) => handleSettingsChange('max_actions_per_run', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Soglia di confidenza: {formData.settings.confidence_threshold}
              </Typography>
              <Slider
                value={formData.settings.confidence_threshold}
                onChange={(_, value) => handleSettingsChange('confidence_threshold', value)}
                step={0.05}
                marks
                min={0.5}
                max={1}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.auto_run}
                    onChange={(e) => handleSettingsChange('auto_run', e.target.checked)}
                  />
                }
                label="Esecuzione automatica"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.notification_on_completion}
                    onChange={(e) => handleSettingsChange('notification_on_completion', e.target.checked)}
                  />
                }
                label="Notifica al completamento"
              />
            </Grid>
            {formData.type === 'inventory' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Soglia minima di stock"
                  type="number"
                  value={formData.settings.min_stock_threshold || 5}
                  onChange={(e) => handleSettingsChange('min_stock_threshold', parseInt(e.target.value))}
                />
              </Grid>
            )}
            {formData.type === 'pricing' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Variazione massima prezzo (%)"
                  type="number"
                  value={formData.settings.max_price_change_percent || 10}
                  onChange={(e) => handleSettingsChange('max_price_change_percent', parseInt(e.target.value))}
                />
              </Grid>
            )}
            {formData.type === 'customer_service' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings.auto_reply_enabled || false}
                      onChange={(e) => handleSettingsChange('auto_reply_enabled', e.target.checked)}
                    />
                  }
                  label="Abilita risposte automatiche"
                />
              </Grid>
            )}
            {formData.type === 'marketing' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Limite di budget"
                  type="number"
                  value={formData.settings.budget_limit || 1000}
                  onChange={(e) => handleSettingsChange('budget_limit', parseInt(e.target.value))}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type}
          >
            {currentAgent ? 'Aggiorna' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per visualizzare la cronologia delle esecuzioni */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Cronologia esecuzioni - {currentAgent?.name}
        </DialogTitle>
        <DialogContent>
          {isLoadingRuns ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {displayAgentRuns.map((run) => (
                <Paper key={run.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">
                      Esecuzione del {new Date(run.started_at).toLocaleString('it-IT')}
                    </Typography>
                    <Chip
                      label={
                        run.status === 'completed'
                          ? 'Completato'
                          : run.status === 'running'
                          ? 'In esecuzione'
                          : 'Fallito'
                      }
                      color={
                        run.status === 'completed'
                          ? 'success'
                          : run.status === 'running'
                          ? 'primary'
                          : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Azioni eseguite: {run.actions_taken}
                  </Typography>
                  {run.completed_at && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Durata: {
                        Math.round(
                          (new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000
                        )
                      } secondi
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Risultati: {run.results}
                  </Typography>
                </Paper>
              ))}
              {displayAgentRuns.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                  Nessuna esecuzione trovata per questo agente
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;
