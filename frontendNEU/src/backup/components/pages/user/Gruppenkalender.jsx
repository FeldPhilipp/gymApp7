import {
  Container,
  Box,
  Button,
  Typography,
  useMediaQuery,
  ThemeProvider,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from '../../layout/NavBar';
import GymKalenderWidget from '../../shared/GurppenKalenderWidget';
import { darkTheme } from '../../../theme/darkTheme';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../../util/buttons/BackButton';
import NavBarBot from '../../layout/NavBarBot';
import HeaderCard from '../../layout/HeaderCard';

function GruppenKalender() {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { gruppeId } = useParams();

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
          {!isMobile && (
            <BackButton />
          )}
          <HeaderCard title={"Gruppenkalender"} subtitle={"Plane deine Gym-Besuche mit deinen Akhs"} />

          <GymKalenderWidget
            gruppeId={gruppeId}
            showAddButton={true}
            showTerminList={true}
          />
        </Container>
        <NavBarBot />
      </Box>
    </ThemeProvider>
  );
}

export default GruppenKalender;