import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  accepts_marketing: boolean;
  default_address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  } | null;
  birthdate: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  created_at: string;
}

const Customers: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketingFilter, setMarketingFilter] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Query per recuperare i clienti
  const {
    data: customers,
    isLoading,
    isError,
    refetch,
  } = useQuery<Customer[]>(
    ['customers', marketingFilter],
    async () => {
      const params = marketingFilter ? { accepts_marketing: marketingFilter === 'true' } : {};
      const response = await axios.get('/api/v1/customers', { params });
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Dati di esempio per i clienti
  const exampleCustomers: Customer[] = [
    {
      id: '1',
      email: 'mario.rossi@example.com',
      first_name: 'Mario',
      last_name: 'Rossi',
      phone: '+39 123 456 7890',
      is_active: true,
      accepts_marketing: true,
      default_address: {
        address1: 'Via Roma 123',
        city: 'Milano',
        province: 'MI',
        postal_code: '20100',
        country: 'Italia',
      },
      birthdate: '1985-05-15',
      created_at: '2024-01-10T14:30:00Z',
      orders_count: 5,
      total_spent: 1250.50,
    },
    {
      id: '2',
      email: 'giulia.bianchi@example.com',
      first_name: 'Giulia',
      last_name: 'Bianchi',
      phone: '+39 234 567 8901',
      is_active: true,
      accepts_marketing: false,
      default_address: {
        address1: 'Via Verdi 45',
        address2: 'Interno 7',
        city: 'Roma',
        province: 'RM',
        postal_code: '00100',
        country: 'Italia',
      },
      birthdate: '1990-08-22',
      created_at: '2024-02-15T10:45:00Z',
      orders_count: 3,
      total_spent: 750.25,
    },
    {
      id: '3',
      email: 'luca.verdi@example.com',
      first_name: 'Luca',
      last_name: 'Verdi',
      phone: '+39 345 678 9012',
      is_active: true,
      accepts_marketing: true,
      default_address: {
        address1: 'Via Napoli 78',
        city: 'Torino',
        province: 'TO',
        postal_code: '10100',
        country: 'Italia',
      },
      birthdate: null,
      created_at: '2024-03-20T09:15:00Z',
      orders_count: 2,
      total_spent: 420.00,
    },
    {
      id: '4',
      email: 'anna.neri@example.com',
      first_name: 'Anna',
      last_name: 'Neri',
      phone: '+39 456 789 0123',
      is_active: true,
      accepts_marketing: true,
      default_address: {
        address1: 'Via Firenze 22',
        city: 'Bologna',
        province: 'BO',
        postal_code: '40100',
        country: 'Italia',
      },
      birthdate: '1988-11-30',
      created_at: '2024-04-05T16:20:00Z',
      orders_count: 1,
      total_spent: 150.75,
    },
    {
      id: '5',
      email: 'paolo.gialli@example.com',
      first_name: 'Paolo',
      last_name: 'Gialli',
      phone: null,
      is_active: false,
      accepts_marketing: false,
      default_address: {
        address1: 'Via Milano 55',
        city: 'Firenze',
        province: 'FI',
        postal_code: '50100',
        country: 'Italia',
      },
      birthdate: '1975-03-10',
      created_at: '2024-01-25T11:10:00Z',
      orders_count: 0,
      total_spent: 0,
    },
  ];

  // Dati di esempio per gli ordini di un cliente
  const exampleCustomerOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-2025-001',
      status: 'delivered',
      total_price: 299.99,
      created_at: '2025-04-15T10:30:00Z',
    },
    {
      id: '2',
      order_number: 'ORD-2025-002',
      status: 'delivered',
      total_price: 199.99,
      created_at: '2025-03-22T14:45:00Z',
    },
    {
      id: '3',
      order_number: 'ORD-2025-003',
      status: 'delivered',
      total_price: 450.50,
      created_at: '2025-02-10T09:15:00Z',
    },
    {
      id: '4',
      order_number: 'ORD-2025-004',
      status: 'delivered',
      total_price: 150.75,
      created_at: '2025-01-05T16:20:00Z',
    },
    {
      id: '5',
      order_number: 'ORD-2025-005',
      status: 'cancelled',
      total_price: 99.99,
      created_at: '2024-12-18T11:10:00Z',
    },
  ];

  // Filtra i clienti in base al termine di ricerca e al filtro marketing
  const filteredCustomers = (customers || exampleCustomers).filter((customer) => {
    const matchesSearch =
      !searchTerm ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesMarketing = !marketingFilter || customer.accepts_marketing === (marketingFilter === 'true');
    
    return matchesSearch && matchesMarketing;
  });

  // Gestisce il cambio di pagina
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Gestisce il cambio di righe per pagina
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestisce l'apertura del dialog per visualizzare i dettagli di un cliente
  const handleViewCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setOpenDialog(true);
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gestisce il cambio di tab nel dialog dei dettagli del cliente
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Gestisce l'invio di un'email al cliente
  const handleSendEmail = (customerId: string) => {
    alert(`Email inviata al cliente ${customerId}`);
  };

  // Gestisce l'eliminazione di un cliente
  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      alert(`Cliente ${customerId} eliminato`);
    }
  };

  // Gestisce la generazione di email personalizzate con AI
  const handleGenerateAIEmails = () => {
    alert('Generazione di email personalizzate con AI in corso...');
  };

  // Funzione per formattare la data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/D';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  // Funzione per ottenere le iniziali del nome per l'avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clienti
      </Typography>

      {/* Toolbar */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar disableGutters>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                placeholder="Cerca clienti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel id="marketing-filter-label">Marketing</InputLabel>
                <Select
                  labelId="marketing-filter-label"
                  id="marketing-filter"
                  value={marketingFilter}
                  label="Marketing"
                  onChange={(e) => setMarketingFilter(e.target.value)}
                >
                  <MenuItem value="">Tutti</MenuItem>
                  <MenuItem value="true">Accetta marketing</MenuItem>
                  <MenuItem value="false">Non accetta marketing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Aggiorna">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerateAIEmails}
              >
                Email AI
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </Paper>

      {/* Tabella dei clienti */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Errore nel caricamento dei clienti
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefono</TableCell>
                    <TableCell>Iscrizione</TableCell>
                    <TableCell align="right">Ordini</TableCell>
                    <TableCell align="right">Spesa totale</TableCell>
                    <TableCell>Marketing</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: customer.is_active ? 'primary.main' : 'text.disabled' }}>
                              {getInitials(customer.first_name, customer.last_name)}
                            </Avatar>
                            <Typography variant="body2">
                              {customer.first_name} {customer.last_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || 'N/D'}</TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell align="right">{customer.orders_count}</TableCell>
                        <TableCell align="right">€{customer.total_spent.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={customer.accepts_marketing ? 'Sì' : 'No'}
                            color={customer.accepts_marketing ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Visualizza dettagli">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Invia email">
                            <IconButton
                              size="small"
                              onClick={() => handleSendEmail(customer.id)}
                            >
                              <EmailIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Elimina">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCustomers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Righe per pagina:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} di ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Dialog per visualizzare i dettagli del cliente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {currentCustomer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                  {getInitials(currentCustomer.first_name, currentCustomer.last_name)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {currentCustomer.first_name} {currentCustomer.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliente dal {formatDate(currentCustomer.created_at)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabValue} onChange={handleChangeTab} sx={{ mb: 2 }}>
                <Tab label="Informazioni" />
                <Tab label="Ordini" />
                <Tab label="Indirizzo" />
              </Tabs>

              {/* Tab Informazioni */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Contatti</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {currentCustomer.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Telefono:</strong> {currentCustomer.phone || 'N/D'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Data di nascita:</strong> {formatDate(currentCustomer.birthdate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Statistiche</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Numero ordini:</strong> {currentCustomer.orders_count}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Spesa totale:</strong> €{currentCustomer.total_spent.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Accetta marketing:</strong> {currentCustomer.accepts_marketing ? 'Sì' : 'No'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Stato account:</strong> {currentCustomer.is_active ? 'Attivo' : 'Inattivo'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2">Azioni</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        onClick={() => handleSendEmail(currentCustomer.id)}
                      >
                        Invia email
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                      >
                        Modifica
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          handleDeleteCustomer(currentCustomer.id);
                          handleCloseDialog();
                        }}
                      >
                        Elimina
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Tab Ordini */}
              {tabValue === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Numero Ordine</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Stato</TableCell>
                        <TableCell align="right">Totale</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exampleCustomerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={
                                order.status === 'delivered'
                                  ? 'success'
                                  : order.status === 'processing' || order.status === 'shipped'
                                  ? 'primary'
                                  : order.status === 'cancelled'
                                  ? 'error'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">€{order.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {exampleCustomerOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" sx={{ py: 2 }}>
                              Nessun ordine trovato
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab Indirizzo */}
              {tabValue === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Indirizzo predefinito</Typography>
                    {currentCustomer.default_address ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          {currentCustomer.default_address.address1}
                        </Typography>
                        {currentCustomer.default_address.address2 && (
                          <Typography variant="body2">
                            {currentCustomer.default_address.address2}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {currentCustomer.default_address.postal_code},{' '}
                          {currentCustomer.default_address.city} ({currentCustomer.default_address.province})
                        </Typography>
                        <Typography variant="body2">
                          {currentCustomer.default_address.country}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Nessun indirizzo predefinito
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Chiudi</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Customers;
