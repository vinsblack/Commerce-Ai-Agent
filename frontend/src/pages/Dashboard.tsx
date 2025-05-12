import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  // Dati di esempio per la dashboard
  const recentOrders = [
    { id: '1', customer: 'Mario Rossi', total: 120.50, status: 'completed', date: '2025-05-12' },
    { id: '2', customer: 'Giulia Bianchi', total: 85.20, status: 'processing', date: '2025-05-11' },
    { id: '3', customer: 'Luca Verdi', total: 210.00, status: 'completed', date: '2025-05-10' },
    { id: '4', customer: 'Anna Neri', total: 45.99, status: 'shipped', date: '2025-05-09' },
    { id: '5', customer: 'Paolo Gialli', total: 150.75, status: 'pending', date: '2025-05-08' },
  ];

  const lowStockProducts = [
    { id: '1', name: 'Smartphone XYZ', stock: 3, threshold: 5 },
    { id: '2', name: 'Cuffie Wireless', stock: 2, threshold: 10 },
    { id: '3', name: 'Tablet Pro', stock: 4, threshold: 8 },
  ];

  // Dati per i grafici
  const salesData = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Vendite 2025',
        data: [12000, 19000, 15000, 17000, 22000, 24000, 25000, 26000, 23000, 18000, 13000, 0],
        fill: false,
        borderColor: '#2563eb',
        tension: 0.1,
      },
      {
        label: 'Vendite 2024',
        data: [10000, 15000, 12000, 14000, 20000, 22000, 23000, 24000, 21000, 16000, 12000, 11000],
        fill: false,
        borderColor: '#8b5cf6',
        tension: 0.1,
      },
    ],
  };

  const customerSourceData = {
    labels: ['Ricerca organica', 'Social Media', 'Email', 'Referral', 'Diretto', 'Altro'],
    datasets: [
      {
        label: 'Origine clienti',
        data: [35, 25, 15, 10, 10, 5],
        backgroundColor: [
          '#2563eb',
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#6b7280',
        ],
      },
    ],
  };

  // Query per recuperare i dati della dashboard
  const { data: dashboardData, isLoading } = useQuery('dashboardData', async () => {
    try {
      const response = await axios.get('/api/v1/dashboard');
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei dati della dashboard:', error);
      return null;
    }
  }, {
    // Disabilita la query per utilizzare i dati di esempio
    enabled: false,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistiche principali */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Vendite oggi
              </Typography>
              <MoneyIcon />
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              €1,250
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                +15% rispetto a ieri
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Ordini oggi
              </Typography>
              <ShoppingCartIcon />
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              24
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                +8% rispetto a ieri
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Nuovi clienti
              </Typography>
              <PeopleIcon />
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              12
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                +20% rispetto a ieri
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Prodotti attivi
              </Typography>
              <InventoryIcon />
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              156
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                +5% rispetto al mese scorso
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Grafici */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Andamento vendite" />
            <Divider />
            <CardContent>
              <Line data={salesData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Origine clienti" />
            <Divider />
            <CardContent>
              <Bar data={customerSourceData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ordini recenti e prodotti con scorte basse */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Ordini recenti" />
            <Divider />
            <List sx={{ p: 0 }}>
              {recentOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ShoppingCartIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={order.customer}
                      secondary={`Ordine #${order.id} - ${order.date}`}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'right', mb: 0.5 }}>
                        €{order.total.toFixed(2)}
                      </Typography>
                      <Chip
                        label={order.status}
                        size="small"
                        color={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'processing' || order.status === 'shipped'
                            ? 'primary'
                            : 'warning'
                        }
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Prodotti con scorte basse" />
            <Divider />
            <List sx={{ p: 0 }}>
              {lowStockProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <InventoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.stock}/${product.threshold}`}
                    />
                    <Box sx={{ width: '30%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={(product.stock / product.threshold) * 100}
                        color={product.stock < product.threshold / 2 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
