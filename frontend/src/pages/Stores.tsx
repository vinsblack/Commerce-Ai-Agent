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
  Paper,
  IconButton,
  Tooltip,
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
  Store as StoreIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface Store {
  id: string;
  name: string;
  type: 'shopify' | 'woocommerce' | 'magento' | 'prestashop' | 'custom';
  url: string;
  status: 'active' | 'inactive' | 'error';
  products_count: number;
  orders_count: number;
  created_at: string;
  last_sync: string | null;
  settings: {
    auto_sync: boolean;
    sync_interval: number;
    currency: string;
    [key: string]: any;
  };
}

const Stores: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'shopify',
    url: '',
    settings: {
      auto_sync: true,
      sync_interval: 60,
      currency: 'EUR',
    },
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query per recuperare i negozi
  const {
    data: stores,
    isLoading,
    isError,
    refetch,
  } = useQuery<Store[]>(
    'stores',
    async () => {
      const response = await axios.get('/api/v1/stores');
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Mutation per creare un nuovo negozio
  const createStoreMutation = useMutation(
    async (data: any) => {
      const response = await axios.post('/api/v1/stores', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setOpenDialog(false);
        setSuccessMessage('Negozio creato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la creazione del negozio');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per aggiornare un negozio
  const updateStoreMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/v1/stores/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setOpenDialog(false);
        setSuccessMessage('Negozio aggiornato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'aggiornamento del negozio');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per eliminare un negozio
  const deleteStoreMutation = useMutation(
    async (id: string) => {
      const response = await axios.delete(`/api/v1/stores/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setSuccessMessage('Negozio eliminato con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'eliminazione del negozio');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per sincronizzare un negozio
  const syncStoreMutation = useMutation(
    async (id: string) => {
      const response = await axios.post(`/api/v1/stores/${id}/sync`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setSuccessMessage('Sincronizzazione avviata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la sincronizzazione');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setCurrentStore(store);
      setFormData({
        name: store.name,
        type: store.type,
        url: store.url,
        settings: { ...store.settings },
      });
    } else {
      setCurrentStore(null);
      setFormData({
        name: '',
        type: 'shopify',
        url: '',
        settings: {
          auto_sync: true,
          sync_interval: 60,
          currency: 'EUR',
        },
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
      url: formData.url,
      settings: formData.settings,
    };

    if (currentStore) {
      updateStoreMutation.mutate({ id: currentStore.id, data });
    } else {
      createStoreMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo negozio?')) {
      deleteStoreMutation.mutate(id);
    }
  };

  const handleSync = (id: string) => {
    syncStoreMutation.mutate(id);
  };

  // Dati di esempio per i negozi
  const sampleStores: Store[] = [
    {
      id: '1',
      name: 'Negozio Shopify',
      type: 'shopify',
      url: 'https://mio-negozio.myshopify.com',
      status: 'active',
      products_count: 120,
      orders_count: 45,
      created_at: '2025-04-01T09:00:00Z',
      last_sync: '2025-05-11T10:30:00Z',
      settings: {
        auto_sync: true,
        sync_interval: 60,
        currency: 'EUR',
      },
    },
    {
      id: '2',
      name: 'WooCommerce Store',
      type: 'woocommerce',
      url: 'https://mio-sito.com/shop',
      status: 'active',
      products_count: 85,
      orders_count: 32,
      created_at: '2025-04-15T14:30:00Z',
      last_sync: '2025-05-12T08:15:00Z',
      settings: {
        auto_sync: true,
        sync_interval: 120,
        currency: 'EUR',
      },
    },
    {
      id: '3',
      name: 'Magento Shop',
      type: 'magento',
      url: 'https://magento-shop.com',
      status: 'inactive',
      products_count: 210,
      orders_count: 0,
      created_at: '2025-05-01T11:45:00Z',
      last_sync: null,
      settings: {
        auto_sync: false,
        sync_interval: 240,
        currency: 'USD',
      },
    },
    {
      id: '4',
      name: 'PrestaShop Store',
      type: 'prestashop',
      url: 'https://prestashop-demo.com',
      status: 'error',
      products_count: 65,
      orders_count: 12,
      created_at: '2025-04-20T16:20:00Z',
      last_sync: '2025-05-10T09:45:00Z',
      settings: {
        auto_sync: true,
        sync_interval: 180,
        currency: 'EUR',
      },
    },
  ];

  const displayStores = stores || sampleStores;

  const getStoreTypeLabel = (type: string) => {
    switch (type) {
      case 'shopify':
        return 'Shopify';
      case 'woocommerce':
        return 'WooCommerce';
      case 'magento':
        return 'Magento';
      case 'prestashop':
        return 'PrestaShop';
      case 'custom':
        return 'Personalizzato';
      default:
        return type;
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
        <Typography variant="h4">Negozi</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuovo negozio
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
          Errore nel caricamento dei negozi
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayStores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: 'primary.main' }}>
                      <StoreIcon />
                    </Box>
                    <Typography variant="h6">{store.name}</Typography>
                    <Box sx={{ ml: 'auto' }}>
                      {getStatusChip(store.status)}
                    </Box>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {getStoreTypeLabel(store.type)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {store.url}
                    </Typography>
                    <Tooltip title="Apri negozio">
                      <IconButton
                        size="small"
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Prodotti: {store.products_count}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Ordini: {store.orders_count}
                      </Typography>
                    </Grid>
                  </Grid>
                  {store.last_sync && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Ultima sincronizzazione: {new Date(store.last_sync).toLocaleString('it-IT')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={() => handleSync(store.id)}
                    disabled={store.status === 'inactive'}
                  >
                    Sincronizza
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(store)}
                  >
                    Modifica
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(store.id)}
                  >
                    Elimina
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog per creare/modificare un negozio */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentStore ? 'Modifica negozio' : 'Nuovo negozio'}
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
                  <MenuItem value="shopify">Shopify</MenuItem>
                  <MenuItem value="woocommerce">WooCommerce</MenuItem>
                  <MenuItem value="magento">Magento</MenuItem>
                  <MenuItem value="prestashop">PrestaShop</MenuItem>
                  <MenuItem value="custom">Personalizzato</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL del negozio"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Impostazioni
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.auto_sync}
                    onChange={(e) => handleSettingsChange('auto_sync', e.target.checked)}
                  />
                }
                label="Sincronizzazione automatica"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Intervallo di sincronizzazione (minuti)</InputLabel>
                <Select
                  value={formData.settings.sync_interval}
                  onChange={(e) => handleSettingsChange('sync_interval', e.target.value)}
                  label="Intervallo di sincronizzazione (minuti)"
                  disabled={!formData.settings.auto_sync}
                >
                  <MenuItem value={30}>30 minuti</MenuItem>
                  <MenuItem value={60}>1 ora</MenuItem>
                  <MenuItem value={120}>2 ore</MenuItem>
                  <MenuItem value={180}>3 ore</MenuItem>
                  <MenuItem value={240}>4 ore</MenuItem>
                  <MenuItem value={360}>6 ore</MenuItem>
                  <MenuItem value={720}>12 ore</MenuItem>
                  <MenuItem value={1440}>24 ore</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Valuta</InputLabel>
                <Select
                  value={formData.settings.currency}
                  onChange={(e) => handleSettingsChange('currency', e.target.value)}
                  label="Valuta"
                >
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="USD">Dollaro USA ($)</MenuItem>
                  <MenuItem value="GBP">Sterlina (£)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type || !formData.url}
          >
            {currentStore ? 'Aggiorna' : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stores;
