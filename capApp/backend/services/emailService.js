const nodemailer = require('nodemailer');

// Transporter für Web.de erstellen
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // false für Port 587, true für 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Debugging für detaillierte Logs
  logger: true,
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  }
});

// E-Mail-Verbindung testen
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ E-Mail-Service Fehler:', error);
  } else {
    console.log('✅ E-Mail-Service bereit (Web.de)');
  }
});

// Gruppen-Einladungs-E-Mail
exports.sendGruppenEinladung = async (empfaengerEmail, empfaengerName, einladerName, gruppenName, token) => {
  const einladungsLink = `${process.env.FRONTEND_URL}/einladungen?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: empfaengerEmail,
    subject: `Einladung zur Gruppe "${gruppenName}"`,
    html: `
         <!DOCTYPE html>
         <html>
         <head>
           <style>
             body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
             .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
             .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
             .header h1 { margin: 0 0 10px 0; font-size: 32px; }
             .header p { margin: 0; font-size: 16px; opacity: 0.9; }
             .content { padding: 40px 30px; }
             .content h2 { color: #1e293b; margin: 0 0 20px 0; }
             .content p { color: #475569; margin: 0 0 15px 0; }
             .highlight { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
             .highlight strong { color: #3b82f6; }
             .button-container { text-align: center; margin: 30px 0; }
             .button { 
               display: inline-block; 
               background: #3b82f6; 
               color: white !important; 
               padding: 14px 40px; 
               text-decoration: none; 
               border-radius: 8px; 
               font-weight: 600;
               font-size: 16px;
             }
             .button:hover { background: #2563eb; }
             .link-box { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; word-break: break-all; }
             .link-box a { color: #3b82f6; text-decoration: none; font-size: 14px; }
             .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
             .footer p { margin: 5px 0; }
           </style>
         </head>
         <body>
           <div class="container">
             <div class="header">
               <h1>🏋️ Fitness Tracker</h1>
               <p>Gruppeneinladung</p>
             </div>
             <div class="content">
               <h2>Hallo ${empfaengerName}!</h2>
               <div class="highlight">
                 <p><strong>${einladerName}</strong> hat dich zur Trainingsgruppe <strong>"${gruppenName}"</strong> eingeladen.</p>
               </div>
               <p>Tritt der Gruppe bei und verfolge gemeinsam eure Trainingsfortschritte, Highscores und motiviert euch gegenseitig!</p>
               <div class="button-container">
                 <a href="${einladungsLink}" class="button">Einladung annehmen</a>
               </div>
               <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                 <strong>Link funktioniert nicht?</strong><br>
                 Kopiere diese URL in deinen Browser:
               </p>
               <div class="link-box">
                 <a href="${einladungsLink}">${einladungsLink}</a>
               </div>
             </div>
             <div class="footer">
               <p><strong>Fitness Tracker</strong></p>
               <p>Diese E-Mail wurde automatisch generiert. Bitte antworte nicht darauf.</p>
               <p style="margin-top: 10px;">Wenn du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.</p>
             </div>
           </div>
         </body>
         </html>
       `,
    text: `
   Hallo ${empfaengerName}!

   ${einladerName} hat dich zur Trainingsgruppe "${gruppenName}" eingeladen.

   Tritt der Gruppe bei und verfolge gemeinsam eure Trainingsfortschritte!

   Einladung annehmen: ${einladungsLink}

   Viel Erfolg beim Training!
   Dein Fitness Tracker Team

   ---
   Falls der Link nicht funktioniert, kopiere diese URL in deinen Browser:
   ${einladungsLink}
       `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail versendet an:', empfaengerEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error.message);
    throw error;
  }
};

// Passwort-Reset E-Mail
exports.sendPasswordResetEmail = async (empfaengerEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: empfaengerEmail,
    subject: 'Passwort zurücksetzen',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0 0 10px 0; font-size: 32px; }
          .content { padding: 40px 30px; }
          .content p { color: #475569; margin: 0 0 15px 0; }
          .warning { background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .warning strong { color: #dc2626; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #3b82f6; color: white !important; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .button:hover { background: #2563eb; }
          .link-box { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; word-break: break-all; }
          .link-box a { color: #3b82f6; text-decoration: none; font-size: 14px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Passwort zurücksetzen</h1>
          </div>
          <div class="content">
            <p>Hallo!</p>
            <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
            <div class="button-container">
              <a href="${resetLink}" class="button">Passwort zurücksetzen</a>
            </div>
            <div class="warning">
              <strong>⚠️ Wichtig:</strong> Dieser Link ist 1 Stunde lang gültig. Falls du diesen Link nicht angefordert hast, ignoriere diese E-Mail.
            </div>
            <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
              <strong>Link funktioniert nicht?</strong><br>
              Kopiere diese URL in deinen Browser:
            </p>
            <div class="link-box">
              <a href="${resetLink}">${resetLink}</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>Fitness Tracker</strong></p>
            <p>Diese E-Mail wurde automatisch generiert. Bitte antworte nicht darauf.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hallo!

Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.

Klicke auf diesen Link, um dein Passwort zurückzusetzen:
${resetLink}

Dieser Link ist 1 Stunde lang gültig.

Falls du diesen Link nicht angefordert hast, ignoriere diese E-Mail.

Dein Fitness Tracker Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Passwort-Reset E-Mail versendet an:', empfaengerEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error.message);
    throw error;
  }
};