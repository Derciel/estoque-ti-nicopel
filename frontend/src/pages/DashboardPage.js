import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, useTheme, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
// A importação do 'Sector' do recharts estava em falta
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { alpha } from '@mui/material/styles';

// Ícones
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CategoryIcon from '@mui/icons-material/Category';

// --- COMPONENTES VISUAIS ---
const StatCardVertical = ({ title, value, icon, color }) => (
    <Paper elevation={4} sx={{ p: 2, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: alpha(color, 0.1), width: 48, height: 48 }}>
            {React.cloneElement(icon, { sx: { color: color, fontSize: 28 } })}
        </Avatar>
    </Paper>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
const DashboardPage = () => {
    const { listaKey } = useContext(AppContext);
    const theme = useTheme();
    const [kpis, setKpis] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentes, setRecentes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [kpisRes, chartRes, recentesRes] = await Promise.all([
                      axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/kpis`),
                      axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/produtos-chart`),
                      axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/recentes`)
                ]);
                setKpis(kpisRes.data);
                setChartData(chartRes.data);
                setRecentes(recentesRes.data);
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, [listaKey]);
    
    if (loading || !kpis) { return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>; }

    const pieChartData = [
        { name: 'Disponíveis', value: kpis.totalItens - kpis.itensAlocados },
        { name: 'Alocados', value: kpis.itensAlocados }
    ];
    const COLORS = [theme.palette.primary.main, '#ed6c02'];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Painel</Typography>
      
      <Grid container spacing={3}>
        {/* Coluna 1: Gráfico de Barras e Atividade Recente */}
        <Grid xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, height: '350px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Inventário por Tipo de Produto</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <YAxis type="category" dataKey="nome" stroke={theme.palette.text.secondary} width={80} />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.1)'}} contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                  <Bar dataKey="total" fill={theme.palette.primary.main} name="Total de Itens" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Atividade Recente</Typography>
              <List>
                {recentes.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem disablePadding><ListItemAvatar><Avatar variant="rounded" src={item.imagem_url || '/placeholder.png'} /></ListItemAvatar><ListItemText primary={item.nome} secondary={item.codigo_produto} /></ListItem>
                    {index < recentes.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 7}} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>

        {/* Coluna 2: Status Geral */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Status Geral</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" startAngle={90} endAngle={-270} innerRadius="75%" outerRadius="90%" cornerRadius={8} paddingAngle={2}>
                  {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Coluna 3: KPIs Verticais */}
        <Grid xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <StatCardVertical title="Total de Itens" value={kpis.totalItens} icon={<ComputerIcon />} color="#0288d1" />
            <StatCardVertical title="Itens Alocados" value={kpis.itensAlocados} icon={<AssignmentTurnedInIcon />} color="#ed6c02" />
            <StatCardVertical title="Tipos de Produto" value={kpis.tiposDeProduto} icon={<CategoryIcon />} color="#6a1b9a" />
            <StatCardVertical title="Usuários" value={kpis.totalUsuarios} icon={<PeopleIcon />} color="#2e7d32" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;