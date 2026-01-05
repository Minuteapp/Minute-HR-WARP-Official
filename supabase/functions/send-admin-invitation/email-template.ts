
export interface EmailTemplateData {
  name: string;
  company: string;
  signUpLink: string;
  role: string;
}

export const renderEmailTemplate = (data: EmailTemplateData) => {
  const { name, company, signUpLink, role } = data;
  
  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Einladung als Administrator - ${company}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Einladung als Administrator</h1>
          <h2>${company}</h2>
        </div>
        
        <div class="content">
          <p>Hallo ${name},</p>
          
          <p>Sie wurden eingeladen, als <strong>${role}</strong> für das Unternehmen <strong>${company}</strong> zu fungieren.</p>
          
          <p>Um Ihr Konto zu aktivieren, klicken Sie bitte auf den folgenden Link:</p>
          
          <p style="text-align: center;">
            <a href="${signUpLink}" class="button">Konto aktivieren</a>
          </p>
          
          <p>Alternativ können Sie den folgenden Link in Ihren Browser kopieren:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${signUpLink}
          </p>
          
          <p>Diese Einladung ist 7 Tage gültig. Nach der Aktivierung können Sie sich mit Ihrer E-Mail-Adresse und einem selbst gewählten Passwort anmelden.</p>
          
          <p>Falls Sie Fragen haben, wenden Sie sich bitte an den Support.</p>
          
          <p>Mit freundlichen Grüßen,<br>
          Das HR-Plattform Team</p>
        </div>
        
        <div class="footer">
          <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Einladung als Administrator - ${company}
    
    Hallo ${name},
    
    Sie wurden eingeladen, als ${role} für das Unternehmen ${company} zu fungieren.
    
    Um Ihr Konto zu aktivieren, besuchen Sie bitte den folgenden Link:
    ${signUpLink}
    
    Diese Einladung ist 7 Tage gültig. Nach der Aktivierung können Sie sich mit Ihrer E-Mail-Adresse und einem selbst gewählten Passwort anmelden.
    
    Falls Sie Fragen haben, wenden Sie sich bitte an den Support.
    
    Mit freundlichen Grüßen,
    Das HR-Plattform Team
    
    ---
    Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
  `;

  return { html, text };
};
