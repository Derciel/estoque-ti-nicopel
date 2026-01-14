import React, { useState, useEffect, useContext } from 'react';
import {
  Grid, Paper, Typography, Box, CircularProgress, useTheme,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider,
  LinearProgress, Card, CardContent, IconButton
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { alpha } from '@mui/material/styles';
import api from '../services/api';

// Ícones
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CategoryIcon from '@mui/icons-material/Category';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- COMPONENTE: KPI CARD MODERNO (Horizontal) ---
const KpiCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{
    height: '100%',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        )}
      </Box>
      <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.15), color: color, width: 56, height: 56 }}>
        {React.cloneElement(icon, { fontSize: 'large' })}
      </Avatar>
    </CardContent>
  </Card>
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
          api.get('/api/dashboard/kpis'),
          api.get('/api/dashboard/produtos-chart'),
          api.get('/api/dashboard/recentes')
        ]);
        setKpis(kpisRes.data);
        setChartData(chartRes.data);
        setRecentes(recentesRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [listaKey]);

  if (loading || !kpis) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Cálculos para o gráfico de rosca
  const disponiveis = kpis.totalItens - kpis.itensAlocados;
  const porcentagemAlocada = kpis.totalItens > 0 ? ((kpis.itensAlocados / kpis.totalItens) * 100).toFixed(1) : 0;

  const pieChartData = [
    { name: 'Disponíveis', value: disponiveis, color: theme.palette.success.light },
    { name: 'Alocados', value: kpis.itensAlocados, color: theme.palette.primary.main }
  ];

  return (
    <Box sx={{ pb: 5 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Visão geral do inventário e alocações</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>

        {/* SEÇÃO 1: KPIs (Cartões de Topo) - Agora em linha horizontal */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Ativos"
            value={kpis.totalItens}
            icon={<ComputerIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Em Uso"
            value={kpis.itensAlocados}
            icon={<AssignmentTurnedInIcon />}
            color={theme.palette.warning.main}
            subtitle={`${porcentagemAlocada}% do inventário total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Categorias"
            value={kpis.tiposDeProduto}
            icon={<CategoryIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Colaboradores"
            value={kpis.totalUsuarios}
            icon={<PeopleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>

        {/* SEÇÃO 2: Gráficos Principais */}

        {/* Gráfico de Barras - Inventário */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '400px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Distribuição por Categoria</Typography>
              <IconButton size="small"><MoreVertIcon /></IconButton>
            </Box>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="nome" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                />
                <Bar dataKey="total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Rosca - Status de Alocação */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Disponibilidade</Typography>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Texto centralizado no gráfico de rosca */}
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -65%)', textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{porcentagemAlocada}%</Typography>
                <Typography variant="caption" color="text.secondary">Alocado</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* SEÇÃO 3: Lista Recente (Estilo Timeline Simples) */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Atividades Recentes</Typography>
            <Grid container spacing={2}>
              {recentes.slice(0, 4).map((item) => (
                <Grid item xs={12} md={6} lg={3} key={item.id}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar
                      variant="rounded"
                      src={item.imagem_url}
                      sx={{ width: 48, height: 48, bgcolor: 'grey.200' }}
                    >
                      {item.nome.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.nome}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {item.codigo_produto}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                        Atualizado recentemente
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;