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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  type: 'marketplace' | 'payment' | 'shipping' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  store_url: string;
  api_key?: string;
  last_sync?: string;
  created_at: string;
  settings: Record<string, any>;
}

const Integrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'marketplace',
    provider: '',
    store_url: '',
    api_key: '',
    api_secret: '',
    settings: {},
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query per recuperare le integrazioni
  const {
    data: integrations,
    isLoading,
    isError,
    refetch,
  } = useQuery<Integration[]>(
    'integrations',
    async () => {
      const response = await axios.get('/api/v1/integrations');
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Mutation per creare una nuova integrazione
  const createIntegrationMutation = useMutation(
    async (data: any) => {
      const response = await axios.post('/api/v1/integrations', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('integrations');
        setOpenDialog(false);
        setSuccessMessage('Integrazione creata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la creazione dell\'integrazione');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per aggiornare un'integrazione
  const updateIntegrationMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/v1/integrations/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('integrations');
        setOpenDialog(false);
        setSuccessMessage('Integrazione aggiornata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'aggiornamento dell\'integrazione');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per eliminare un'integrazione
  const deleteIntegrationMutation = useMutation(
    async (id: string) => {
      const response = await axios.delete(`/api/v1/integrations/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('integrations');
        setSuccessMessage('Integrazione eliminata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'eliminazione dell\'integrazione');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per sincronizzare un'integrazione
  const syncIntegrationMutation = useMutation(
    async (id: string) => {
      const response = await axios.post(`/api/v1/integrations/${id}/sync`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('integrations');
        setSuccessMessage('Sincronizzazione avviata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la sincronizzazione');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  const handleOpenDialog = (integration?: Integration) => {
    if (integration) {
      setCurrentIntegration(integration);
      setFormData({
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        store_url: integration.store_url,
        api_key: integration.api_key || '',
        api_secret: '',
        settings: integration.settings,
      });
    } else {
      setCurrentIntegration(null);
      setFormData({
        name: '',
        type: 'marketplace',
        provider: '',
        store_url: '',
        api_key: '',
        api_secret: '',
        settings: {},
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      type: formData.type,
      provider: formData.provider,
      store_url: formData.store_url,
      api_key: formData.api_key,
      api_secret: formData.api_secret,
      settings: formData.settings,
    };

    if (currentIntegration) {
      updateIntegrationMutation.mutate({ id: currentIntegration.id, data });
    } else {
      createIntegrationMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa integrazione?')) {
      deleteIntegrationMutation.mutate(id);
    }
  };

  const handleSync = (id: string) => {
    syncIntegrationMutation.mutate(id);
  };

  // Dati di esempio per le integrazioni
  const sampleIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Negozio Shopify',
      type: 'marketplace',
      provider: 'shopify',
      status: 'active',
      store_url: 'https://mio-negozio.myshopify.com',
      last_sync: '2025-05-11T10:30:00Z',
      created_at: '2025-04-01T09:00:00Z',
      settings: {
        auto_sync: true,
        sync_interval: 60,
      },
    },
    {
      id: '2',
      name: 'WooCommerce Store',
      type: 'marketplace',
      provider: 'woocommerce',
      status: 'active',
      store_url: 'https://mio-sito.com/shop',
      last_sync: '2025-05-12T08:15:00Z',
      created_at: '2025-04-15T14:30:00Z',
      settings: {
        auto_sync: true,
        sync_interval: 120,
      },
    },
    {
      id: '3',
      name: 'Stripe',
      type: 'payment',
      provider: 'stripe',
      status: 'active',
      store_url: '',
      created_at: '2025-04-10T11:45:00Z',
      settings: {
        currency: 'EUR',
        webhook_enabled: true,
      },
    },
    {
      id: '4',
      name: 'PayPal',
      type: 'payment',
      provider: 'paypal',
      status: 'inactive',
      store_url: '',
      created_at: '2025-04-20T16:20:00Z',
      settings: {
        sandbox_mode: true,
      },
    },
    {
      id: '5',
      name: 'DHL',
      type: 'shipping',
      provider: 'dhl',
      status: 'error',
      store_url: '',
      created_at: '2025-05-01T10:00:00Z',
      settings: {
        default_service: 'express',
      },
    },
  ];

  const displayIntegrations = integrations || sampleIntegrations;

  const getProviderOptions = (type: string) => {
    switch (type) {
      case 'marketplace':
        return [
          { value: 'shopify', label: 'Shopify' },
          { value: 'woocommerce', label: 'WooCommerce' },
          { value: 'magento', label: 'Magento' },
          { value: 'prestashop', label: 'PrestaShop' },
          { value: 'etsy', label: 'Etsy' },
          { value: 'amazon', label: 'Amazon' },
          { value: 'ebay', label: 'eBay' },
        ];
      case 'payment':
        return [
          { value: 'stripe', label: 'Stripe' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'klarna', label: 'Klarna' },
          { value: 'braintree', label: 'Braintree' },
        ];
      case 'shipping':
        return [
          { value: 'dhl', label: 'DHL' },
          { value: 'fedex', label: 'FedEx' },
          { value: 'ups', label: 'UPS' },
          { value: 'usps', label: 'USPS' },
        ];
      default:
        return [
          { value: 'custom', label: 'Personalizzato' },
        ];
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'marketplace':
        return <StoreIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'shipping':
        return <ShippingIcon />;
      default:
        return <ShoppingCartIcon />;
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
            icon={<CheckIcon />}
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
      case 'error':
        return (
          <Chip
            label="Errore"
            color="error"
            size="small"
            icon={<ErrorIcon />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Integrazioni</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuova integrazione
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
          Errore nel caricamento delle integrazioni
        </Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>Marketplace</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {displayIntegrations
              .filter((integration) => integration.type === 'marketplace')
              .map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{integration.name}</Typography>
                        {getStatusChip(integration.status)}
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        URL: {integration.store_url}
                      </Typography>
                      {integration.last_sync && (
                        <Typography variant="body2">
                          Ultima sincronizzazione: {new Date(integration.last_sync).toLocaleString('it-IT')}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<SyncIcon />}
                        onClick={() => handleSync(integration.id)}
                      >
                        Sincronizza
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(integration)}
                      >
                        Modifica
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(integration.id)}
                      >
                        Elimina
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>Pagamenti</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {displayIntegrations
              .filter((integration) => integration.type === 'payment')
              .map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{integration.name}</Typography>
                        {getStatusChip(integration.status)}
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {integration.settings.currency && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Valuta: {integration.settings.currency}
                        </Typography>
                      )}
                      {integration.settings.sandbox_mode !== undefined && (
                        <Typography variant="body2">
                          Modalità sandbox: {integration.settings.sandbox_mode ? 'Attiva' : 'Disattiva'}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(integration)}
                      >
                        Modifica
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(integration.id)}
                      >
                        Elimina
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>Spedizioni</Typography>
          <Grid container spacing={3}>
            {displayIntegrations
              .filter((integration) => integration.type === 'shipping')
              .map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{integration.name}</Typography>
                        {getStatusChip(integration.status)}
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {integration.settings.default_service && (
                        <Typography variant="body2">
                          Servizio predefinito: {integration.settings.default_service}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(integration)}
                      >
                        Modifica
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(integration.id)}
                      >
                        Elimina
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Dialog per creare/modificare un'integrazione */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentIntegration ? 'Modifica integrazione' : 'Nuova integrazione'}
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
                  <MenuItem value="marketplace">Marketplace</MenuItem>
                  <MenuItem value="payment">Pagamento</MenuItem>
                  <MenuItem value="shipping">Spedizione</MenuItem>
                  <MenuItem value="other">Altro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  name="provider"
                  value={formData.provider}
                  onChange={handleSelectChange}
                  label="Provider"
                >
                  {getProviderOptions(formData.type).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.type === 'marketplace' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL negozio"
                  name="store_url"
                  value={formData.store_url}
                  onChange={handleInputChange}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="API Key"
                name="api_key"
                value={formData.api_key}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="API Secret"
                name="api_secret"
                type="password"
                value={formData.api_secret}
                onChange={handleInputChange}
              />
            </Grid>
            {formData.type === 'marketplace' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Impostazioni di sincronizzazione
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.settings.auto_sync}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              auto_sync: e.target.checked,
                            },
                          });
                        }}
                      />
                    }
                    label="Sincronizzazione automatica"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Intervallo di sincronizzazione (minuti)"
                    type="number"
                    value={formData.settings.sync_interval || 60}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          sync_interval: parseInt(e.target.value),
                        },
                      });
                    }}
                    disabled={!formData.settings.auto_sync}
                  />
                </Grid>
              </>
            )}
            {formData.type === 'payment' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings.sandbox_mode}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            sandbox_mode: e.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Modalità sandbox"
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
            disabled={
              !formData.name ||
              !formData.provider ||
              (formData.type === 'marketplace' && !formData.store_url) ||
              !formData.api_key
            }
          >
            {currentIntegration ? 'Aggiorna' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Integrations;
