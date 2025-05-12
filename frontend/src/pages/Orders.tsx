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
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_price: number;
  subtotal: number;
  shipping_price: number;
  tax_price: number;
  discount_price: number;
  currency: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
}

const Orders: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Query per recuperare gli ordini
  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>(
    ['orders', statusFilter],
    async () => {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await axios.get('/api/v1/orders', { params });
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Dati di esempio per gli ordini
  const exampleOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-2025-001',
      status: 'processing',
      total_price: 649.99,
      subtotal: 599.99,
      shipping_price: 10.00,
      tax_price: 40.00,
      discount_price: 0,
      currency: 'EUR',
      customer_id: '1',
      customer_name: 'Mario Rossi',
      customer_email: 'mario.rossi@example.com',
      created_at: '2025-05-12T08:30:00Z',
      items: [
        {
          product_id: '1',
          product_name: 'Smartphone XYZ',
          quantity: 1,
          price: 599.99,
          total: 599.99,
        }
      ],
      shipping_address: {
        address1: 'Via Roma 123',
        city: 'Milano',
        province: 'MI',
        postal_code: '20100',
        country: 'Italia',
      },
    },
    {
      id: '2',
      order_number: 'ORD-2025-002',
      status: 'shipped',
      total_price: 1399.99,
      subtotal: 1349.99,
      shipping_price: 0,
      tax_price: 50.00,
      discount_price: 0,
      currency: 'EUR',
      customer_id: '2',
      customer_name: 'Giulia Bianchi',
      customer_email: 'giulia.bianchi@example.com',
      created_at: '2025-05-11T14:45:00Z',
      items: [
        {
          product_id: '2',
          product_name: 'Laptop Pro',
          quantity: 1,
          price: 1299.99,
          total: 1299.99,
        },
        {
          product_id: '3',
          product_name: 'Cuffie Wireless',
          quantity: 1,
          price: 50.00,
          total: 50.00,
        }
      ],
      shipping_address: {
        address1: 'Via Verdi 45',
        address2: 'Interno 7',
        city: 'Roma',
        province: 'RM',
        postal_code: '00100',
        country: 'Italia',
      },
    },
    {
      id: '3',
      order_number: 'ORD-2025-003',
      status: 'delivered',
      total_price: 219.99,
      subtotal: 199.99,
      shipping_price: 5.00,
      tax_price: 15.00,
      discount_price: 0,
      currency: 'EUR',
      customer_id: '3',
      customer_name: 'Luca Verdi',
      customer_email: 'luca.verdi@example.com',
      created_at: '2025-05-10T10:15:00Z',
      items: [
        {
          product_id: '4',
          product_name: 'Smartwatch Sport',
          quantity: 1,
          price: 199.99,
          total: 199.99,
        }
      ],
      shipping_address: {
        address1: 'Via Napoli 78',
        city: 'Torino',
        province: 'TO',
        postal_code: '10100',
        country: 'Italia',
      },
    },
    {
      id: '4',
      order_number: 'ORD-2025-004',
      status: 'pending',
      total_price: 439.99,
      subtotal: 399.99,
      shipping_price: 10.00,
      tax_price: 30.00,
      discount_price: 0,
      currency: 'EUR',
      customer_id: '4',
      customer_name: 'Anna Neri',
      customer_email: 'anna.neri@example.com',
      created_at: '2025-05-09T16:20:00Z',
      items: [
        {
          product_id: '5',
          product_name: 'Tablet Pro',
          quantity: 1,
          price: 399.99,
          total: 399.99,
        }
      ],
      shipping_address: {
        address1: 'Via Firenze 22',
        city: 'Bologna',
        province: 'BO',
        postal_code: '40100',
        country: 'Italia',
      },
    },
    {
      id: '5',
      order_number: 'ORD-2025-005',
      status: 'cancelled',
      total_price: 109.99,
      subtotal: 99.99,
      shipping_price: 0,
      tax_price: 10.00,
      discount_price: 0,
      currency: 'EUR',
      customer_id: '5',
      customer_name: 'Paolo Gialli',
      customer_email: 'paolo.gialli@example.com',
      created_at: '2025-05-08T09:10:00Z',
      items: [
        {
          product_id: '3',
          product_name: 'Cuffie Wireless',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        }
      ],
      shipping_address: {
        address1: 'Via Milano 55',
        city: 'Firenze',
        province: 'FI',
        postal_code: '50100',
        country: 'Italia',
      },
    },
  ];

  // Filtra gli ordini in base al termine di ricerca e allo stato
  const filteredOrders = (orders || exampleOrders).filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  // Gestisce l'apertura del dialog per visualizzare i dettagli di un ordine
  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setOpenDialog(true);
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gestisce il cambio di tab nel dialog dei dettagli dell'ordine
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Gestisce l'invio di un'email di conferma dell'ordine
  const handleSendOrderConfirmation = (orderId: string) => {
    alert(`Email di conferma inviata per l'ordine ${orderId}`);
  };

  // Gestisce l'aggiornamento dello stato di spedizione
  const handleUpdateShippingStatus = (orderId: string) => {
    alert(`Stato di spedizione aggiornato per l'ordine ${orderId}`);
  };

  // Gestisce la generazione della fattura
  const handleGenerateInvoice = (orderId: string) => {
    alert(`Fattura generata per l'ordine ${orderId}`);
  };

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  // Funzione per ottenere il colore del chip in base allo stato dell'ordine
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  // Funzione per ottenere l'etichetta in italiano dello stato dell'ordine
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'processing':
        return 'In elaborazione';
      case 'shipped':
        return 'Spedito';
      case 'delivered':
        return 'Consegnato';
      case 'cancelled':
        return 'Annullato';
      case 'refunded':
        return 'Rimborsato';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ordini
      </Typography>

      {/* Toolbar */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar disableGutters>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                placeholder="Cerca ordini..."
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
                <InputLabel id="status-filter-label">Stato</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Stato"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tutti gli stati</MenuItem>
                  <MenuItem value="pending">In attesa</MenuItem>
                  <MenuItem value="processing">In elaborazione</MenuItem>
                  <MenuItem value="shipped">Spedito</MenuItem>
                  <MenuItem value="delivered">Consegnato</MenuItem>
                  <MenuItem value="cancelled">Annullato</MenuItem>
                  <MenuItem value="refunded">Rimborsato</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Aggiorna">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </Paper>

      {/* Tabella degli ordini */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Errore nel caricamento degli ordini
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Numero Ordine</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Totale</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell component="th" scope="row">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{order.customer_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customer_email}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell align="right">
                          {order.currency === 'EUR' ? '€' : '$'}
                          {order.total_price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Visualizza dettagli">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Invia email">
                            <IconButton
                              size="small"
                              onClick={() => handleSendOrderConfirmation(order.id)}
                            >
                              <EmailIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Aggiorna spedizione">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateShippingStatus(order.id)}
                            >
                              <ShippingIcon />
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
              count={filteredOrders.length}
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

      {/* Dialog per visualizzare i dettagli dell'ordine */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {currentOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Ordine {currentOrder.order_number}
                </Typography>
                <Chip
                  label={getStatusLabel(currentOrder.status)}
                  color={getStatusColor(currentOrder.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabValue} onChange={handleChangeTab} sx={{ mb: 2 }}>
                <Tab label="Dettagli" />
                <Tab label="Prodotti" />
                <Tab label="Indirizzo" />
              </Tabs>

              {/* Tab Dettagli */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Cliente</Typography>
                    <Typography variant="body2">{currentOrder.customer_name}</Typography>
                    <Typography variant="body2">{currentOrder.customer_email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Data ordine</Typography>
                    <Typography variant="body2">
                      {formatDate(currentOrder.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Riepilogo</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Subtotale:</Typography>
                      <Typography variant="body2">
                        {currentOrder.currency === 'EUR' ? '€' : '$'}
                        {currentOrder.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2">Spedizione:</Typography>
                      <Typography variant="body2">
                        {currentOrder.currency === 'EUR' ? '€' : '$'}
                        {currentOrder.shipping_price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2">Tasse:</Typography>
                      <Typography variant="body2">
                        {currentOrder.currency === 'EUR' ? '€' : '$'}
                        {currentOrder.tax_price.toFixed(2)}
                      </Typography>
                    </Box>
                    {currentOrder.discount_price > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="body2">Sconto:</Typography>
                        <Typography variant="body2" color="error">
                          -{currentOrder.currency === 'EUR' ? '€' : '$'}
                          {currentOrder.discount_price.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2">Totale:</Typography>
                      <Typography variant="subtitle2">
                        {currentOrder.currency === 'EUR' ? '€' : '$'}
                        {currentOrder.total_price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Azioni</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => handleSendOrderConfirmation(currentOrder.id)}
                      >
                        Invia email di conferma
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShippingIcon />}
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => handleUpdateShippingStatus(currentOrder.id)}
                      >
                        Aggiorna stato spedizione
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ReceiptIcon />}
                        fullWidth
                        onClick={() => handleGenerateInvoice(currentOrder.id)}
                      >
                        Genera fattura
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Tab Prodotti */}
              {tabValue === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Prodotto</TableCell>
                        <TableCell align="right">Prezzo</TableCell>
                        <TableCell align="right">Quantità</TableCell>
                        <TableCell align="right">Totale</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentOrder.items.map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell align="right">
                            {currentOrder.currency === 'EUR' ? '€' : '$'}
                            {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {currentOrder.currency === 'EUR' ? '€' : '$'}
                            {item.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab Indirizzo */}
              {tabValue === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Indirizzo di spedizione</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {currentOrder.shipping_address.address1}
                    </Typography>
                    {currentOrder.shipping_address.address2 && (
                      <Typography variant="body2">
                        {currentOrder.shipping_address.address2}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {currentOrder.shipping_address.postal_code},{' '}
                      {currentOrder.shipping_address.city} ({currentOrder.shipping_address.province})
                    </Typography>
                    <Typography variant="body2">
                      {currentOrder.shipping_address.country}
                    </Typography>
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

export default Orders;
