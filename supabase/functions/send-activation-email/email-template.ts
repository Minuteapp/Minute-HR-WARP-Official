
/**
 * Builds the HTML email template for the activation email
 */
export function buildEmailTemplate(
  name: string,
  email: string,
  company: string,
  signUpLink: string,
  logoBase64: string
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivieren Sie Ihr Administrator-Konto</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      height: 60px;
    }
    .header {
      background-color: #f5f5f5;
      padding: 15px 20px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .content {
      padding: 0 20px;
    }
    .button {
      display: inline-block;
      background-color: #6366F1;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #4F46E5;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100%;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="${logoBase64}" alt="MINUTE Logo">
    </div>
    <div class="header">
      <h1>Aktivieren Sie Ihr Administrator-Konto</h1>
    </div>
    <div class="content">
      <p>Hallo ${name},</p>
      <p>Sie wurden eingeladen, Administrator für <strong>${company}</strong> zu werden.</p>
      <p>Klicken Sie auf den folgenden Button, um Ihr Konto zu aktivieren und den Einrichtungsprozess abzuschließen:</p>
      <div style="text-align: center;">
        <a href="${signUpLink}" class="button">Konto aktivieren</a>
      </div>
      <p>Alternativ können Sie auch den folgenden Link in Ihren Browser kopieren:</p>
      <p><a href="${signUpLink}">${signUpLink}</a></p>
      <p>Diese Einladung läuft in 7 Tagen ab.</p>
      <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
      <p>Mit freundlichen Grüßen,<br>Das MINUTE-Team</p>
    </div>
    <div class="footer">
      <p>Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht auf diese Nachricht.</p>
      <p>&copy; ${new Date().getFullYear()} MINUTE. Alle Rechte vorbehalten.</p>
    </div>
  </div>
</body>
</html>`;
}
