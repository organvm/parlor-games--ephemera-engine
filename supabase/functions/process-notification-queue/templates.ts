export const emailTemplates = {
  base: (content: string, unsubscribeUrl: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Georgia', serif;
            background-color: #FAF9F6;
            color: #2C2B29;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            padding: 40px;
            border: 1px solid #E8E6E1;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .eyebrow {
            font-size: 12px;
            color: #8A867D;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .content {
            font-size: 16px;
            line-height: 1.6;
            color: #4A4843;
          }
          .button {
            display: inline-block;
            background-color: #2C2B29;
            color: #FAF9F6;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 24px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #8A867D;
          }
          .footer a {
            color: #8A867D;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="eyebrow">Ephemera Engine</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Sent by the Ephemera Engine.</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `,
  
  invitation: (hostName: string, gameType: string, ctaUrl: string) => `
    <h2 style="font-weight: 500; font-size: 24px; margin-top: 0;">You have been invited.</h2>
    <p>${hostName} has invited you to join a game of <i>${gameType.replace('_', ' ')}</i>.</p>
    <p>Please review the details and RSVP at your earliest convenience.</p>
    <a href="${ctaUrl}" class="button">View Invitation</a>
  `,
  
  reminder: (eventName: string, ctaUrl: string) => `
    <h2 style="font-weight: 500; font-size: 24px; margin-top: 0;">A gentle reminder.</h2>
    <p>Your contribution for <i>${eventName}</i> is still pending.</p>
    <p>Please submit it soon so the game may proceed.</p>
    <a href="${ctaUrl}" class="button">Complete Contribution</a>
  `,
  
  artifact_ready: (eventName: string, ctaUrl: string) => `
    <h2 style="font-weight: 500; font-size: 24px; margin-top: 0;">The artifact is ready.</h2>
    <p>The final record for <i>${eventName}</i> has been generated.</p>
    <a href="${ctaUrl}" class="button">View Artifact</a>
  `,
  
  cancellation: (eventName: string, ctaUrl: string) => `
    <h2 style="font-weight: 500; font-size: 24px; margin-top: 0;">Session cancelled.</h2>
    <p>The session <i>${eventName}</i> has been cancelled by the host.</p>
    <a href="${ctaUrl}" class="button">View Details</a>
  `
};
