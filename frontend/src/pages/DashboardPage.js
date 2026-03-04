import React, { useState, useEffect, useContext } from 'react';
import {
  Grid, Paper, Typography, Box, CircularProgress, useTheme, useMediaQuery,
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

// --- COMPONENTE: KPI CARD (Versão Premium com Gradiente Sutil e Glow) ---
const KpiCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: isMobile ? 6 : 8,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(23, 28, 41, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&:hover': {
          transform: isMobile ? 'none' : 'translateY(-8px)',
          background: 'rgba(23, 28, 41, 0.7)',
          borderColor: alpha(color, 0.4),
          boxShadow: `0 24px 48px -12px ${alpha(color, 0.25)}`,
          '& .kpi-icon-container': {
            transform: 'scale(1.15) rotate(-8deg)',
            background: alpha(color, 0.3),
            boxShadow: `0 0 30px ${alpha(color, 0.4)}`,
          },
          '& .kpi-glow': {
            opacity: 0.8,
            transform: 'scale(1.5)',
          },
          '& .kpi-number': {
            color: '#fff',
            textShadow: `0 0 20px ${alpha(color, 0.3)}`
          }
        }
      }}
    >
      {/* Luz ambiente interna sutil */}
      <Box
        className="kpi-glow"
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
          borderRadius: '50%',
          opacity: 0.4,
          transition: 'all 0.8s ease',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <CardContent sx={{ p: isMobile ? 3 : 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontWeight: 1000,
                letterSpacing: 3,
                fontSize: '0.55rem',
                display: 'block',
                mb: 1.5,
                opacity: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography
              className="kpi-number"
              variant={isMobile ? "h3" : "h2"}
              sx={{
                fontWeight: 1000,
                color: 'text.primary',
                letterSpacing: -2,
                lineHeight: 1,
                transition: 'all 0.3s ease'
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Box
                sx={{
                  mt: 2.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: color,
                    fontWeight: 1000,
                    fontSize: '0.6rem',
                    bgcolor: alpha(color, 0.1),
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    border: `1px solid ${alpha(color, 0.15)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8
                  }}
                >
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 8px ${color}` }} />
                  {subtitle}
                </Typography>
              </Box>
            )}
          </Box>

          <Avatar
            className="kpi-icon-container"
            variant="rounded"
            sx={{
              background: `linear-gradient(135deg, ${alpha(color, 0.25)} 0%, ${alpha(color, 0.05)} 100%)`,
              color: color,
              width: isMobile ? 56 : 72,
              height: isMobile ? 56 : 72,
              borderRadius: isMobile ? 4 : 5,
              border: `1px solid ${alpha(color, 0.2)}`,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: `0 12px 24px -10px ${alpha(color, 0.4)}`,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: isMobile ? 32 : 40, filter: `drop-shadow(0 0 10px ${alpha(color, 0.6)})` } })}
          </Avatar>
        </Box>
      </CardContent>

      {/* Barra de acento estática moderna na lateral */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          bottom: '20%',
          left: 0,
          width: '3px',
          background: color,
          borderRadius: '0 4px 4px 0',
          opacity: 0.8,
          boxShadow: `0 0 15px ${color}`
        }}
      />
    </Card>
  );
};

// --- PÁGINA DO DASHBOARD ---
const DashboardPage = () => {
  const { listaKey } = useContext(AppContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpisRes, chartRes] = await Promise.all([
          api.get('/api/dashboard/kpis'),
          api.get('/api/dashboard/produtos-chart')
        ]);
        setKpis(kpisRes.data);
        const sortedChartData = chartRes.data.sort((a, b) => b.total - a.total);
        setChartData(sortedChartData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [listaKey]);

  if (loading || !kpis) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const disponiveis = kpis.totalItens - kpis.itensAlocados;
  const porcentagemAlocada = kpis.totalItens > 0 ? ((kpis.itensAlocados / kpis.totalItens) * 100).toFixed(0) : 0;

  const donutData = [
    { name: 'Disponíveis', value: disponiveis, color: '#BEF264' },
    { name: 'Alocados', value: kpis.itensAlocados, color: '#38BDF8' }
  ];

  return (
    <Box sx={{ position: 'relative', pb: 4 }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute', top: -100, right: -100, width: 300, height: 300,
        bgcolor: alpha(theme.palette.primary.main, 0.05), filter: 'blur(100px)', borderRadius: '50%', zIndex: 0
      }} />

      <Box sx={{ mb: 5, textAlign: isMobile ? 'center' : 'left', position: 'relative', zIndex: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
          Dashboard <Box component="span" sx={{ color: 'primary.main' }}>Geral</Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.8 }}>
          Monitor de Patrimônio & Gestão de Itens NICOPEL
        </Typography>
      </Box>

      <Grid container spacing={isMobile ? 2 : 4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* --- LINHA 1: CARDS DE KPI --- */}
        <Grid item xs={6} md={3}>
          <KpiCard title="Total Geral" value={kpis.totalItens} icon={<ComputerIcon />} color="#BEF264" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Em Uso" value={kpis.itensAlocados} icon={<AssignmentTurnedInIcon />} color="#38BDF8" subtitle={`${porcentagemAlocada}% de taxa`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Categorias" value={kpis.tiposDeProduto} icon={<CategoryIcon />} color="#A855F7" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Colaboradores" value={kpis.totalUsuarios} icon={<PeopleIcon />} color="#F59E0B" />
        </Grid>

        {/* --- LINHA 2: GRÁFICOS --- */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 6,
              height: isMobile ? 'auto' : '520px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(22, 27, 39, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 800 }}>Estoque por Categoria</Typography>
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                pr: 2,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.02)', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <List disablePadding>
                {chartData.map((item, index) => {
                  const colors = CHART_COLORS;
                  const colorIndex = index % colors.length;
                  const percentage = ((item.total / kpis.totalItens) * 100).toFixed(0);

                  return (
                    <ListItem
                      key={item.nome}
                      sx={{
                        mb: 1.5,
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderColor: alpha(colors[colorIndex], 0.2),
                          transform: 'translateX(4px)'
                        }
                      }}
                      secondaryAction={
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" sx={{ fontWeight: 900, mb: 0.5 }}>{item.total}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{percentage}%</Typography>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: alpha(colors[colorIndex], 0.1),
                          color: colors[colorIndex],
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          fontWeight: 800,
                          border: `1px solid ${alpha(colors[colorIndex], 0.2)}`
                        }}>
                          {item.nome.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ ml: 1 }}
                        primary={item.nome}
                        secondary={
                          <Box sx={{ mt: 1, width: isMobile ? '120px' : '200px' }}>
                            <Box sx={{ height: 6, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <Box sx={{
                                height: '100%',
                                width: `${percentage}%`,
                                bgcolor: colors[colorIndex],
                                boxShadow: `0 0 10px ${alpha(colors[colorIndex], 0.5)}`
                              }} />
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                              {item.disponivel} em estoque
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 800, fontSize: '1rem' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 6,
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(22, 27, 39, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 800, alignSelf: 'flex-start' }}>Ocupação e Status</Typography>
            <Box sx={{ position: 'relative', width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius="75%"
                    outerRadius="95%"
                    paddingAngle={10}
                    stroke="none"
                    cornerRadius={6}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 0 8px ${alpha(entry.color, 0.3)})` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      bgcolor: '#161B27',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontWeight: 800 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 950, color: 'text.primary', letterSpacing: -2 }}>
                  {porcentagemAlocada}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 2, display: 'block', mt: -1 }}>
                  OCUPADO
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Chip
                icon={<CircleIcon sx={{ fontSize: '10px !important', color: '#BEF264 !important' }} />}
                label="Disponíveis"
                sx={{
                  bgcolor: alpha('#BEF264', 0.05),
                  color: '#BEF264',
                  fontWeight: 800,
                  border: '1px solid rgba(190, 242, 100, 0.1)'
                }}
              />
              <Chip
                icon={<CircleIcon sx={{ fontSize: '10px !important', color: '#38BDF8 !important' }} />}
                label="Em Uso"
                sx={{
                  bgcolor: alpha('#38BDF8', 0.05),
                  color: '#38BDF8',
                  fontWeight: 800,
                  border: '1px solid rgba(56, 189, 248, 0.1)'
                }}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;