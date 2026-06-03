import axios from 'axios';
import { isNativeApp } from '../utils/platform';
import { getAuthToken, clearAuthToken } from './authStorage';

const apiUrl = process.env.REACT_APP_API_URL || "https://akkkker.de/api";

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    // Web: httpOnly Cookie; Native (Capacitor): Bearer Token
    withCredentials: !isNativeApp(),
});

api.interceptors.request.use(
    async (config) => {
        if (isNativeApp()) {
            const token = await getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('401 Unauthorized - Session ungültig oder nicht vorhanden');
            if (isNativeApp()) {
                await clearAuthToken();
            }
        }
        return Promise.reject(error);
    }
);

export const TestApi = {
    getAllUebungen: () => api.get('/uebungen')
}

export const UserApi = {
    login: (credentials) => api.post('/nutzer/login', credentials),
    validateSession: () => api.get('/nutzer/validate-session'), // ⭐ NEU
    logout: () => api.post('/nutzer/logout'), // ⭐ NEU
    forgotPassword: (email) => api.post('/nutzer/forgot-password', { email }),
    changePassword: (id, data) => api.put(`/nutzer/${id}/change-password`, data),
    createNewUser: (data) => api.post('/nutzer/register', data),
    getAllNutzer: () => api.get('/nutzer'),
    getNutzerById: (id) => api.get(`/nutzer/${id}`),
    updateNutzer: (id, data) => api.put(`/nutzer/${id}`, data),
    resetPassword: (token, newPassword) => api.post('/nutzer/reset-password', { token, newPassword }),
    getAdminStatus: (id) => api.get(`/nutzer/${id}/is-admin`),
    updateZielEinstellungen: (id, data) =>
        api.put(`/nutzer/${id}/ziel-einstellungen`, data),
}

export const TrainingApi = {
    getAllTrainingsplaene: () => api.get('/training/plaene'),

    getUebungenByPlan: (planId, nutzerId) =>
        api.get(`/training/plaene/${planId}/uebungen`, { params: { nutzerId } }),

    getLetzteErgebnisse: (uebungId, nutzerId, eigeneUebung = 0) =>
        api.get(`/training/uebungen/${uebungId}/letzte`, { params: { nutzerId, eigeneUebung } }),

    createSession: (data) => api.post('/training/sessions', {
        ...data,
        trainingsplan_typ: data.trainingsplan_typ || 'standard'
    }),

    getSessionsByNutzer: (nutzerId) => api.get(`/training/sessions/${nutzerId}`),

    getUebungenFuerPlan: (planId, nutzerId, planTyp = 'standard') =>
        api.get(`/training/plaene/${planId}/uebungen-oder-historie`, {
            params: { nutzerId, planTyp }
        }),

    createSessionMitHistorie: (data) => api.post('/training/sessions/mit-historie', {
        ...data,
        trainingsplan_typ: data.trainingsplan_typ || 'standard'
    }),

    getDashboardStats: (nutzerId, params = {}) =>
        api.get(`/training/dashboard/${nutzerId}`, { params }),

    getCustomPlaene: (nutzerId) => api.get(`/custom-trainingsplan/nutzer/${nutzerId}`),
    getAllUebungen: () => api.get('/uebungen'),
    addUebungToPlan: (data) => api.post('/custom-trainingsplan/uebungen', data),
    updateUebungInPlan: (uebungId, data) =>
        api.put(`/custom-trainingsplan/uebungen/${uebungId}`, data),
    deleteUebungFromPlan: (uebungId, data) =>
        api.delete(`/custom-trainingsplan/uebungen/${uebungId}`, { data }),
    deleteCustomPlanUebung: (uebungId, data) =>
        api.delete(`/custom-trainingsplan/uebungen/${uebungId}`, { data }),
    createCustomPlan: (data) => api.post('/custom-trainingsplan', data),
    updateCustomPlan: (planId, data) =>
        api.put(`/custom-trainingsplan/${planId}`, data),
    deleteCustomPlan: (planId, data) =>
        api.delete(`/custom-trainingsplan/${planId}`, { data }),

    getSessionDetails: (sessionId) =>
        api.get(`/training/sessions/${sessionId}/details`),
    getSessionErgebnisse: (sessionId) =>
        api.get(`/training/sessions/${sessionId}/ergebnisse`),

    updateSession: (sessionId, data) =>
        api.put(`/training/sessions/${sessionId}`, data),
    deleteSession: (sessionId, data) =>
        api.delete(`/training/sessions/${sessionId}`, { data }),
    saveTempSession: (data) => api.post('/training/temp-session', data),
    getTempSession: (nutzerId) => api.get(`/training/temp-session/${nutzerId}`),
    deleteTempSession: (nutzerId) => api.delete(`/training/temp-session/${nutzerId}`),
    getCustomPlaene: (nutzerId) => api.get(`/custom-trainingsplan/nutzer/${nutzerId}`),
    getCustomPlanUebungen: (planId, nutzerId) =>
        api.get(`/custom-trainingsplan/${planId}`, { params: { nutzerId } }),

    postCreateUserUebung: (data) =>
        api.post(`/uebungen/user-uebung`, data),

    getUebungenByUserId: (nutzerId) =>
        api.get(`/uebungen/user-uebungen/${nutzerId}`),
};

export const GruppenApi = {
    getGruppenByNutzer: (nutzerId) => api.get(`/gruppen/nutzer/${nutzerId}`),
    getFavoritGruppe: (nutzerId) => api.get(`/gruppen/favorit/${nutzerId}`),
    createGruppe: (data) => api.post('/gruppen', data),
    setFavorit: (data) => api.post('/gruppen/favorit', data),
    deleteGruppe: (data) => api.delete('/gruppen', { data }),
    leaveGruppe: (data) => api.post('/gruppen/leave', data),
    getMitglieder: (gruppeId) => api.get(`/gruppen/${gruppeId}/mitglieder`),
    removeMitglied: (data) => api.delete('/gruppen/mitglieder', { data }),
    searchNutzer: (query, gruppeId) => api.get('/gruppen/search/nutzer', { params: { query, gruppeId } }),
    createEinladung: (data) => api.post('/gruppen/einladungen', data),
    getEinladungen: (nutzerId) => api.get(`/gruppen/einladungen/${nutzerId}`),
    acceptEinladung: (data) => api.post('/gruppen/einladungen/accept', data),
    declineEinladung: (data) => api.post('/gruppen/einladungen/decline', data),
    getBenachrichtigungen: (nutzerId) => api.get(`/gruppen/benachrichtigungen/${nutzerId}`),
    markAsRead: (data) => api.post('/gruppen/benachrichtigungen/read', data),
    getVapidPublicKey: () => api.get(`/gruppen/push/vapid-key`),
    subscribePush: (data) => api.post(`/gruppen/push/subscribe`, data),
    unsubscribePush: (nutzerId) => api.delete(`/gruppen/push/unsubscribe`, { data: { nutzer_id: nutzerId } }),
    getGruppenStats: (gruppeId) => api.get(`/gruppen/${gruppeId}/stats`),
    getGymTermine: (gruppeId, params = {}) => api.get(`/gruppen/${gruppeId}/termine`, { params }),
    createGymTermin: (data) => api.post('/gruppen/termine', data),
    updateGymTermin: (terminId, data) => api.put(`/gruppen/termine/${terminId}`, data),
    deleteGymTermin: (terminId, data) => api.delete(`/gruppen/termine/${terminId}`, { data }),
    setTeilnahmeStatus: (data) => api.post('/gruppen/teilnahme-status', data),
    removeTeilnahme: (data) => api.post('/gruppen/teilnahme-remove', data),
    getKommentare: (id) => api.get(`/gruppen/termine/${id}/kommentare`),
    addKommentar: (id, data) => api.post(`/gruppen/termine/${id}/kommentare`, data),
    getGruppeByTerminId: (id) => api.get(`/gruppen/termin/${id}`)
}

export const FeedbackApi = {
    createFeedback: (data) => api.post('/feedback', data),
    getAllFeedback: () => api.get('/feedback'),
    updateFeedbackStatus: (id, status) => api.put(`/feedback/${id}`, { status }),
    deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

export const GewichtApi = {
    createGewicht: (data) => api.post('/gewicht', data),
    getGewichtByNutzer: (nutzerId, params) =>
        api.get(`/gewicht/nutzer/${nutzerId}`, { params }),
    getGewichtStats: (nutzerId, params) =>
        api.get(`/gewicht/nutzer/${nutzerId}/stats`, { params }),
    getGewichtById: (id) => api.get(`/gewicht/${id}`),
    updateGewicht: (id, data) => api.put(`/gewicht/${id}`, data),
    deleteGewicht: (id) => api.delete(`/gewicht/${id}`),
    getErweiterteStats: (nutzerId) =>
        api.get(`/gewicht/nutzer/${nutzerId}/erweiterte-stats`),
};

export const AdminApi = {
    getTermine: () => api.get('/admin/termine'),
    addUebung: (data) => api.post('/admin/addUebung', data),
    getLogs: () => api.get('/admin/logs'),
};

export default api;