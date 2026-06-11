import { useEffect, useState } from 'react';
import { TrainingApi, GruppenApi } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * useDashboard – kapselt sämtliche Datenabruf-Logik für das Dashboard.
 *
 * Gibt zurück:
 *   stats            Trainingsdaten (letzteTrainings, verbesserungen, highscores)
 *   favoritGruppe    Objekt der Favoriten-Gruppe (oder null)
 *   einladungen      Array offener Einladungen
 *   ansicht          'gruppe' | 'persoenlich'
 *   setAnsicht       Setter für ansicht
 *   gruppeId         ID der aktiven Gruppe (für Highscores)
 *   loading          Boolean
 *   message          { type: string, text: string }
 *   setMessage       Setter für message
 */
function useDashboard() {
  const { nutzer, isLoggedIn } = useAuth();

  const [stats, setStats] = useState(null);
  const [favoritGruppe, setFavoritGruppe] = useState(null);
  const [ansicht, setAnsicht] = useState('gruppe');
  const [loading, setLoading] = useState(true);
  const [einladungen, setEinladungen] = useState([]);
  const [gruppeId, setGruppeId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Favoriten-Gruppe laden
  useEffect(() => {
    if (!isLoggedIn || !nutzer?.id) {
      setLoading(false);
      return;
    }
    fetchFavoritGruppe();
  }, [nutzer, isLoggedIn]);

  // 2. Stats + Einladungen laden (abhängig von ansicht & favoritGruppe)
  useEffect(() => {
    if (!isLoggedIn || !nutzer?.id) {
      setLoading(false);
      return;
    }
    fetchStats();
    fetchEinladungen();
  }, [nutzer, isLoggedIn, ansicht, favoritGruppe]);

  // 3. gruppeId synchron halten
  useEffect(() => {
    setGruppeId(ansicht === 'gruppe' && favoritGruppe?.id ? favoritGruppe.id : null);
  }, [ansicht, favoritGruppe]);

  const fetchFavoritGruppe = async () => {
    setLoading(true);
    try {
      const response = await GruppenApi.getFavoritGruppe(nutzer.id);
      setFavoritGruppe(response.data || null);
      if (!response.data) setAnsicht('persoenlich');
    } catch (err) {
      console.error('Fehler beim Laden der Favoriten-Gruppe:', err);
      setMessage({ type: 'error', text: 'Favoriten-Gruppe konnte nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEinladungen = async () => {
    setLoading(true);
    try {
      const response = await GruppenApi.getEinladungen(nutzer.id);
      setEinladungen(response.data);
    } catch (err) {
      console.error('Fetch Fehler Einladungen:', err);
      setMessage({ type: 'error', text: 'Fehler beim Abrufen der Einladungen' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const gId = ansicht === 'gruppe' && favoritGruppe?.id ? favoritGruppe.id : null;
      const response = await TrainingApi.getDashboardStats(nutzer.id, gId ? { gruppeId: gId } : {});

      const letzteTrainings = Array.isArray(response.data?.letzteTrainings)
        ? response.data.letzteTrainings.filter((t) => t?.id)
        : [];

      const verbesserungen = Array.isArray(response.data?.verbesserungen)
        ? response.data.verbesserungen.filter((v) => v?.uebung_name)
        : [];

      const highscores = Array.isArray(response.data?.highscores)
        ? response.data.highscores.filter(Boolean)
        : [];

      setStats({ letzteTrainings, verbesserungen, highscores });
    } catch (err) {
      console.error('Fehler beim Laden der Statistiken:', err);
      setMessage({ type: 'error', text: 'Statistiken konnten nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnsichtChange = (event, newAnsicht) => {
    if (newAnsicht !== null) setAnsicht(newAnsicht);
  };

  return {
    stats,
    favoritGruppe,
    einladungen,
    ansicht,
    setAnsicht,
    handleAnsichtChange,
    gruppeId,
    loading,
    message,
    setMessage,
  };
}

export default useDashboard;