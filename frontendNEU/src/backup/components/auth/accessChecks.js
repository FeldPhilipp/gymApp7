import { GruppenApi, TrainingApi, UserApi } from '../../services/api';

/**
 * Prüft ob der Nutzer Mitglied einer Gruppe ist
 */
export async function checkGroupMembership(nutzer, gruppeId) {
  if (!nutzer || !gruppeId) return false;

  try {
    const response = await GruppenApi.getMitglieder(gruppeId);
    
    const userIsMember = response.data.some(
      member => member.id === nutzer.id || member.userId === nutzer.id
    );
    
    return userIsMember;
  } catch (error) {
    console.error('Error checking group membership:', error);
    throw error;
  }
}

/**
 * Prüft ob das Training dem Nutzer gehört
 */
export async function checkTrainingOwnership(nutzer, trainingId) {
  if (!nutzer || !trainingId) return false;

  try {
    const response = await TrainingApi.getSessionDetails(trainingId);
    return response.data.nutzer_id === nutzer.id;
  } catch (error) {
    console.error('Error checking training ownership:', error);
    throw error;
  }
}

/**
 * Prüft ob der Nutzer Zugriff auf einen Termin/Kommentar hat
 */
export async function checkTerminAccess(nutzer, terminId) {
  if (!nutzer || !terminId) return false;

  try {
    const resGruppen = await GruppenApi.getGruppenByNutzer(nutzer.id);
    const resTermin = await GruppenApi.getGruppeByTerminId(terminId);
    
    const foundGroup = resGruppen.data.find(
      gruppe => gruppe.id === resTermin.data.gruppe_id
    );
    
    return !!foundGroup;
  } catch (error) {
    console.error('Error checking termin access:', error);
    throw error;
  }
}

/**
 * Prüft ob der Nutzer existiert (für User-spezifische Routen)
 */
export async function checkUserExists(nutzer) {
  if (!nutzer) return false;

  try {
    const response = await UserApi.getNutzerById(nutzer.id);
    return response.data.id === nutzer.id;
  } catch (error) {
    console.error('Error checking user exists:', error);
    throw error;
  }
}