import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  is_active: boolean;
  categories: string[];
  store_id: string;
}

const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Query per recuperare i prodotti
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery<Product[]>(
    ['products', selectedStore],
    async () => {
      const params = selectedStore ? { store_id: selectedStore } : {};
      const response = await axios.get('/api/v1/products', { params });
      return response.data;
    },
    {
      // Disabilita la query per utilizzare i dati di esempio
      enabled: false,
    }
  );

  // Query per recuperare i negozi
  const { data: stores } = useQuery(
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

  // Mutazione per eliminare un prodotto
  const deleteMutation = useMutation(
    (id: string) => axios.delete(`/api/v1/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', selectedStore]);
      },
    }
  );

  // Dati di esempio per i prodotti
  const exampleProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone XYZ',
      sku: 'PHONE-001',
      price: 599.99,
      compare_at_price: 649.99,
      quantity: 25,
      is_active: true,
      categories: ['Elettronica', 'Smartphone'],
      store_id: '1',
    },
    {
      id: '2',
      name: 'Laptop Pro',
      sku: 'LAPTOP-001',
      price: 1299.99,
      compare_at_price: null,
      quantity: 10,
      is_active: true,
      categories: ['Elettronica', 'Computer'],
      store_id: '1',
    },
    {
      id: '3',
      name: 'Cuffie Wireless',
      sku: 'AUDIO-001',
      price: 99.99,
      compare_at_price: 129.99,
      quantity: 50,
      is_active: true,
      categories: ['Elettronica', 'Audio'],
      store_id: '1',
    },
    {
      id: '4',
      name: 'Smartwatch Sport',
      sku: 'WATCH-001',
      price: 199.99,
      compare_at_price: null,
      quantity: 15,
      is_active: true,
      categories: ['Elettronica', 'Wearable'],
      store_id: '1',
    },
    {
      id: '5',
      name: 'Tablet Pro',
      sku: 'TABLET-001',
      price: 399.99,
      compare_at_price: 449.99,
      quantity: 8,
      is_active: true,
      categories: ['Elettronica', 'Tablet'],
      store_id: '1',
    },
  ];

  // Dati di esempio per i negozi
  const exampleStores = [
    { id: '1', name: 'Negozio Elettronica' },
    { id: '2', name: 'Negozio Abbigliamento' },
  ];

  // Filtra i prodotti in base al termine di ricerca
  const filteredProducts = searchTerm
    ? (products || exampleProducts).filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products || exampleProducts;

  // Gestisce il cambio di pagina
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Gestisce il cambio di righe per pagina
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestisce l'apertura del dialog per modificare un prodotto
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setOpenDialog(true);
  };

  // Gestisce l'apertura del dialog per creare un nuovo prodotto
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setOpenDialog(true);
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gestisce l'eliminazione di un prodotto
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      deleteMutation.mutate(id);
    }
  };

  // Gestisce la generazione di descrizioni AI per i prodotti
  const handleGenerateDescriptions = () => {
    alert('Funzionalità di generazione descrizioni AI in fase di implementazione');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Prodotti
      </Typography>

      {/* Toolbar */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Toolbar disableGutters>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Cerca prodotti..."
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="store-select-label">Negozio</InputLabel>
                <Select
                  labelId="store-select-label"
                  id="store-select"
                  value={selectedStore}
                  label="Negozio"
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  <MenuItem value="">Tutti i negozi</MenuItem>
                  {(stores || exampleStores).map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Aggiorna">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerateDescriptions}
              >
                Genera descrizioni AI
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
              >
                Nuovo Prodotto
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </Paper>

      {/* Tabella dei prodotti */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Errore nel caricamento dei prodotti
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Prezzo</TableCell>
                    <TableCell align="right">Quantità</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell>Categorie</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell component="th" scope="row">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell align="right">
                          €{product.price.toFixed(2)}
                          {product.compare_at_price && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              €{product.compare_at_price.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={
                              product.quantity <= 5
                                ? 'error.main'
                                : product.quantity <= 10
                                ? 'warning.main'
                                : 'inherit'
                            }
                          >
                            {product.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.is_active ? 'Attivo' : 'Inattivo'}
                            color={product.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {product.categories.map((category) => (
                            <Chip
                              key={category}
                              label={category}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifica">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProduct(product)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Elimina">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(product.id)}
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
              count={filteredProducts.length}
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

      {/* Dialog per aggiungere/modificare un prodotto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Prodotto"
                defaultValue={currentProduct?.name || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                defaultValue={currentProduct?.sku || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prezzo"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                defaultValue={currentProduct?.price || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prezzo Comparativo (opzionale)"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                defaultValue={currentProduct?.compare_at_price || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantità"
                type="number"
                defaultValue={currentProduct?.quantity || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Stato</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  defaultValue={currentProduct?.is_active || true}
                  label="Stato"
                >
                  <MenuItem value={true}>Attivo</MenuItem>
                  <MenuItem value={false}>Inattivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrizione"
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Categorie (separate da virgola)"
                defaultValue={currentProduct?.categories.join(', ') || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
