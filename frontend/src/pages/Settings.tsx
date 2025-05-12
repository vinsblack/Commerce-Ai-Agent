import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Grid,
  TextField,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ApiKey {
  id: string;
  name: string;
  last_used: string | null;
  created_at: string;
}

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    email_notifications: user?.preferences?.email_notifications || true,
    sms_notifications: user?.preferences?.sms_notifications || false,
    language: user?.preferences?.language || 'it',
    currency: user?.preferences?.currency || 'EUR',
  });

  // Query per recuperare le chiavi API
  const {
    data: apiKeys,
    isLoading: isLoadingApiKeys,
    refetch: refetchApiKeys,
  } = useQuery<ApiKey[]>(
    'apiKeys',
    async () => {
      const response = await axios.get('/api/v1/user/api-keys');
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Mutation per aggiornare il profilo
  const updateProfileMutation = useMutation(
    async (data: any) => {
      const response = await axios.put('/api/v1/user/profile', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setSuccessMessage('Profilo aggiornato con successo');
        updateUser(data);
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'aggiornamento del profilo');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per cambiare la password
  const changePasswordMutation = useMutation(
    async (data: any) => {
      const response = await axios.post('/api/v1/user/change-password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setSuccessMessage('Password cambiata con successo');
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante il cambio della password');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per creare una nuova chiave API
  const createApiKeyMutation = useMutation(
    async (name: string) => {
      const response = await axios.post('/api/v1/user/api-keys', { name });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setGeneratedApiKey(data.key);
        refetchApiKeys();
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante la creazione della chiave API');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  // Mutation per eliminare una chiave API
  const deleteApiKeyMutation = useMutation(
    async (id: string) => {
      const response = await axios.delete(`/api/v1/user/api-keys/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        refetchApiKeys();
        setSuccessMessage('Chiave API eliminata con successo');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.detail || 'Errore durante l\'eliminazione della chiave API');
        setTimeout(() => setErrorMessage(null), 3000);
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdateProfile = () => {
    const profileData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      company_name: formData.company_name,
      phone: formData.phone,
      preferences: {
        email_notifications: formData.email_notifications,
        sms_notifications: formData.sms_notifications,
        language: formData.language,
        currency: formData.currency,
      },
    };
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage('Le password non corrispondono');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const passwordData = {
      current_password: formData.current_password,
      new_password: formData.new_password,
    };
    changePasswordMutation.mutate(passwordData);
  };

  const handleOpenApiKeyDialog = () => {
    setOpenApiKeyDialog(true);
    setNewApiKeyName('');
    setGeneratedApiKey(null);
  };

  const handleCloseApiKeyDialog = () => {
    setOpenApiKeyDialog(false);
  };

  const handleCreateApiKey = () => {
    if (newApiKeyName.trim()) {
      createApiKeyMutation.mutate(newApiKeyName.trim());
    }
  };

  const handleDeleteApiKey = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa chiave API?')) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  // Dati di esempio per le chiavi API
  const sampleApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Integrazione Shopify',
      last_used: '2025-05-10T14:30:00Z',
      created_at: '2025-04-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Integrazione WooCommerce',
      last_used: null,
      created_at: '2025-05-01T09:15:00Z',
    },
  ];

  const displayApiKeys = apiKeys || sampleApiKeys;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Impostazioni
      </Typography>

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

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="impostazioni tabs">
            <Tab label="Profilo" />
            <Tab label="Password" />
            <Tab label="Preferenze" />
            <Tab label="API" />
            <Tab label="Abbonamento" />
          </Tabs>
        </Box>

        {/* Tab Profilo */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cognome"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Azienda"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefono"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Salva modifiche'
                )}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab Password */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password attuale"
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nuova password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Conferma nuova password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isLoading}
              >
                {changePasswordMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Cambia password'
                )}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab Preferenze */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.email_notifications}
                      onChange={handleInputChange}
                      name="email_notifications"
                    />
                  }
                  label="Notifiche email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sms_notifications}
                      onChange={handleInputChange}
                      name="sms_notifications"
                    />
                  }
                  label="Notifiche SMS"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Lingua"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="it">Italiano</option>
                <option value="en">Inglese</option>
                <option value="es">Spagnolo</option>
                <option value="fr">Francese</option>
                <option value="de">Tedesco</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Valuta"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollaro USA ($)</option>
                <option value="GBP">Sterlina (£)</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Salva preferenze'
                )}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab API */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Chiavi API</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenApiKeyDialog}
            >
              Nuova chiave API
            </Button>
          </Box>
          
          <List>
            {displayApiKeys.map((key) => (
              <ListItem key={key.id} divider>
                <ListItemText
                  primary={key.name}
                  secondary={`Creata il ${new Date(key.created_at).toLocaleDateString('it-IT')}${
                    key.last_used
                      ? ` • Ultimo utilizzo: ${new Date(key.last_used).toLocaleDateString('it-IT')}`
                      : ' • Mai utilizzata'
                  }`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteApiKey(key.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {displayApiKeys.length === 0 && (
              <ListItem>
                <ListItemText primary="Nessuna chiave API trovata" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        {/* Tab Abbonamento */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Piano attuale: {user?.subscription_plan?.toUpperCase() || 'Free'}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Free
                  </Typography>
                  <Typography variant="h4" color="text.primary" sx={{ mt: 2 }}>
                    €0
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    per mese
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 1 negozio
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 100 prodotti
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Agenti AI base
                  </Typography>
                  <Typography variant="body2">
                    • Supporto email
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={user?.subscription_plan === 'free'}
                  >
                    {user?.subscription_plan === 'free' ? 'Piano attuale' : 'Seleziona piano'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Pro
                  </Typography>
                  <Typography variant="h4" color="text.primary" sx={{ mt: 2 }}>
                    €49
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    per mese
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 3 negozi
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 1.000 prodotti
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Agenti AI avanzati
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Supporto prioritario
                  </Typography>
                  <Typography variant="body2">
                    • Analisi avanzate
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={user?.subscription_plan === 'pro'}
                  >
                    {user?.subscription_plan === 'pro' ? 'Piano attuale' : 'Seleziona piano'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Enterprise
                  </Typography>
                  <Typography variant="h4" color="text.primary" sx={{ mt: 2 }}>
                    €199
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    per mese
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Negozi illimitati
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Prodotti illimitati
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Agenti AI personalizzati
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Supporto dedicato 24/7
                  </Typography>
                  <Typography variant="body2">
                    • API avanzate
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={user?.subscription_plan === 'enterprise'}
                  >
                    {user?.subscription_plan === 'enterprise' ? 'Piano attuale' : 'Seleziona piano'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog per la creazione di una nuova chiave API */}
      <Dialog open={openApiKeyDialog} onClose={handleCloseApiKeyDialog}>
        <DialogTitle>
          {generatedApiKey ? 'Chiave API generata' : 'Crea nuova chiave API'}
        </DialogTitle>
        <DialogContent>
          {generatedApiKey ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Questa chiave verrà mostrata solo una volta. Copiala e conservala in un luogo sicuro.
              </Alert>
              <TextField
                fullWidth
                value={generatedApiKey}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
            </>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Nome chiave API"
              fullWidth
              value={newApiKeyName}
              onChange={(e) => setNewApiKeyName(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApiKeyDialog}>
            {generatedApiKey ? 'Chiudi' : 'Annulla'}
          </Button>
          {!generatedApiKey && (
            <Button
              onClick={handleCreateApiKey}
              variant="contained"
              disabled={!newApiKeyName.trim() || createApiKeyMutation.isLoading}
            >
              {createApiKeyMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Genera'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
