import React, { useState, useEffect, useContext } from 'react';
import {
  Grid, Paper, Typography, Box, CircularProgress, useTheme,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Card, CardContent, Chip, Stack, Divider
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { alpha } from '@mui/material/styles';
import api from '../services/api';

// Ícones
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CircleIcon from '@mui/icons-material/Circle';

// Cores para a lista e gráficos
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// --- COMPONENTE: KPI CARD (Mantido do anterior) ---
const KpiCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{
    height: '100%',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    // Garante que o fundo se adapte ao tema claro/escuro
    bgcolor: 'background.paper',
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, my: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        {subtitle && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TrendingUpIcon sx={{ fontSize: 18, color: color }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {subtitle}
            </Typography>
          </Stack>
        )}
      </Box>
      {/* Use alpha para o fundo do ícone ficar bom em temas claros e escuros */}
      <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.15), color: color, width: 60, height: 60 }}>
        {React.cloneElement(icon, { fontSize: 'large' })}
      </Avatar>
    </CardContent>
  </Card>
);

// --- PÁGINA DO DASHBOARD ---
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
        // Ordena os dados do maior para o menor para a lista ficar mais útil
        const sortedChartData = chartRes.data.sort((a, b) => b.total - a.total);
        setChartData(sortedChartData);
        setRecentes(recentesRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [listaKey]);

  if (loading || !kpis) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}><CircularProgress /></Box>);
  }

  // Cálculos
  const disponiveis = kpis.totalItens - kpis.itensAlocados;
  const porcentagemAlocada = kpis.totalItens > 0 ? ((kpis.itensAlocados / kpis.totalItens) * 100).toFixed(0) : 0;

  const donutData = [
    { name: 'Disponíveis', value: disponiveis, color: theme.palette.success.main }, // Verde mais forte
    { name: 'Alocados', value: kpis.itensAlocados, color: theme.palette.error.main }   // Vermelho/Laranja para alocados
  ];

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Visão Geral</Typography>
        <Typography variant="subtitle1" color="text.secondary">Monitoramento de inventário e alocações</Typography>
      </Box>

      <Grid container spacing={3}>

        {/* --- LINHA 1: CARDS DE KPI --- */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Total de Ativos" value={kpis.totalItens} icon={<ComputerIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Em Uso" value={kpis.itensAlocados} icon={<AssignmentTurnedInIcon />} color={theme.palette.warning.main} subtitle={`${porcentagemAlocada}% alocado`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Categorias" value={kpis.tiposDeProduto} icon={<CategoryIcon />} color={theme.palette.info.main} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Colaboradores" value={kpis.totalUsuarios} icon={<PeopleIcon />} color={theme.palette.success.main} />
        </Grid>

        {/* --- LINHA 2: ÁREA PRINCIPAL --- */}

        {/* Coluna da Esquerda: NOVA LISTA DE DISTRIBUIÇÃO POR CATEGORIA */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '450px', // Altura fixa para alinhar com o gráfico ao lado
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Distribuição por Categoria</Typography>

            {/* Container da lista com rolagem se houver muitos itens */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
              {chartData.length > 0 ? (
                <List disablePadding>
                  {chartData.map((item, index) => {
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                      <React.Fragment key={item.nome}>
                        <ListItem
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) } // Efeito hover sutil
                          }}
                          secondaryAction={
                            // Chip (etiqueta) com o total
                            <Chip
                              label={item.total}
                              size="small"
                              sx={{
                                fontWeight: 'bold',
                                bgcolor: alpha(color, 0.1),
                                color: color,
                                border: `1px solid ${alpha(color, 0.3)}`
                              }}
                            />
                          }
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <CircleIcon sx={{ color: color, fontSize: 14 }} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="subtitle2" fontWeight={600}>{item.nome}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">Quantidade em estoque</Typography>}
                          />
                        </ListItem>
                        {index < chartData.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 7, opacity: 0.6 }} />}
                      </React.Fragment>
                    )
                  })}
                </List>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Nenhum dado de categoria disponível.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Coluna da Direita: GRÁFICO DE ROSCA (DONUT) */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '450px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Disponibilidade Geral</Typography>
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius="65%" // Faz virar uma rosca
                    outerRadius="85%"
                    paddingAngle={4}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Tooltip personalizado para dark/light mode */}
                  <Tooltip contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    color: theme.palette.text.primary
                  }} itemStyle={{ color: theme.palette.text.primary }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ bottom: 0 }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Texto no centro da rosca */}
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -65%)', textAlign: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  {porcentagemAlocada}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Em Uso
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* --- LINHA 3: LISTA DE RECENTES --- */}
        <Grid item xs={12}>
          {/* (Código da lista de recentes pode ser adicionado aqui se desejar, 
               mas removi para focar no pedido principal) */}
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;