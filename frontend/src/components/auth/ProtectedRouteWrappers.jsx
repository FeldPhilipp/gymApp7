import { useParams } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { 
  checkGroupMembership, 
  checkTrainingOwnership, 
  checkTerminAccess, 
  checkUserExists 
} from '../auth/accessChecks';

export function ProtectedGroupRoute({ children }) {
  const { gruppeId } = useParams();
  
  return (
    <ProtectedRoute checkAccess={(nutzer) => checkGroupMembership(nutzer, gruppeId)}>
      {children}
    </ProtectedRoute>
  );
}

export function ProtectedTrainingRoute({ children }) {
  const { id } = useParams();
  
  return (
    <ProtectedRoute checkAccess={(nutzer) => checkTrainingOwnership(nutzer, id)}>
      {children}
    </ProtectedRoute>
  );
}

export function ProtectedKommentarRoute({ children }) {
  const { id } = useParams();
  
  return (
    <ProtectedRoute checkAccess={(nutzer) => checkTerminAccess(nutzer, id)}>
      {children}
    </ProtectedRoute>
  );
}

export function ProtectedUserRoute({ children }) {
  return (
    <ProtectedRoute checkAccess={(nutzer) => checkUserExists(nutzer)}>
      {children}
    </ProtectedRoute>
  );
}