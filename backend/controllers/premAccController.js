const db = require('../config/db');

// GET /api/sub/status/:nutzerId
exports.getStatus = async (req, res) => {
    try {
        const { nutzerId } = req.params;
        const [rows] = await db.query(
            `SELECT id, plan, status, started_at, expires_at
             FROM subscriptions
             WHERE nutzer_id = ? AND status = 'active' AND expires_at > NOW()
             ORDER BY expires_at DESC LIMIT 1`,
            [nutzerId]
        );
        if (rows.length === 0) {
            return res.json({ is_premium: false });
        }
        res.json({ is_premium: true, ...rows[0] });
    } catch (error) {
        console.error("Fehler bei getStatus:", error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/sub/activate
// Wird nach erfolgreicher PayPal-Zahlung vom Frontend aufgerufen
exports.activatePremium = async (req, res) => {
    try {
        const { nutzerId, plan, paypalOrderId } = req.body;

        if (!nutzerId || !plan || !paypalOrderId) {
            return res.status(400).json({ error: 'nutzerId, plan und paypalOrderId erforderlich' });
        }

        // Verifiziere die PayPal-Order serverseitig
        const verified = await verifyPayPalOrder(paypalOrderId);
        if (!verified) {
            return res.status(400).json({ error: 'PayPal-Zahlung konnte nicht verifiziert werden' });
        }

        // Prüfen ob bereits eine aktive Subscription existiert
        const [existing] = await db.query(
            `SELECT id FROM subscriptions WHERE nutzer_id = ? AND status = 'active'`,
            [nutzerId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Bereits ein aktives Abo vorhanden' });
        }

        const startedAt = new Date();
        const expiresAt = new Date();
        if (plan === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (plan === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            return res.status(400).json({ error: 'Ungültiger Plan' });
        }

        await db.query(
            `INSERT INTO subscriptions (nutzer_id, plan, status, started_at, expires_at, provider, provider_sub_id)
             VALUES (?, ?, 'active', ?, ?, 'paypal', ?)`,
            [nutzerId, plan, startedAt, expiresAt, paypalOrderId]
        );

        // Optionales Cache-Flag am User setzen
        await db.query(
            `UPDATE nutzer SET is_premium = 1 WHERE id = ?`,
            [nutzerId]
        );

        res.json({ success: true, expires_at: expiresAt });
    } catch (error) {
        console.error("Fehler bei activatePremium:", error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/sub/cancel
exports.cancelSubscription = async (req, res) => {
    try {
        const { nutzerId } = req.body;
        const [result] = await db.query(
            `UPDATE subscriptions SET status = 'cancelled'
             WHERE nutzer_id = ? AND status = 'active'`,
            [nutzerId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kein aktives Abo gefunden' });
        }
        await db.query(`UPDATE nutzer SET is_premium = 0 WHERE id = ?`, [nutzerId]);
        res.json({ success: true, message: 'Abo wurde gekündigt' });
    } catch (error) {
        console.error("Fehler bei cancelSubscription:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- Hilfsfunktion: PayPal Order serverseitig verifizieren ---
async function verifyPayPalOrder(orderId) {
    try {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const secret = process.env.PAYPAL_SECRET;
        const baseUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        // Access Token holen
        const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        const tokenData = await tokenRes.json();

        // Order-Details abrufen
        const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });
        const order = await orderRes.json();

        // Order muss COMPLETED sein
        return order.status === 'COMPLETED';
    } catch (err) {
        console.error('PayPal-Verifizierung fehlgeschlagen:', err);
        return false;
    }
}