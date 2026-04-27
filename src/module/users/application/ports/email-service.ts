export const EmailServiceTemplate = (subject: string, code: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
    }
    .code {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #333;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #888;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:20px 0;">
    <tr>
      <td align="center">
        
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:20px; border-radius:8px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align:center; padding-bottom:20px;">
              <h2 style="margin:0; color:#333;">Verify Your Account</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="color:#555; font-size:16px; line-height:1.5;">
              <p>Hello,</p>
              <p>Use the verification code below to complete your sign-in process:</p>

              <!-- Code -->
              <div style="font-size:28px; font-weight:bold; letter-spacing:6px; text-align:center; margin:20px 0; color:#333;">
                ${code}
              </div>

              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn’t request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center; font-size:12px; color:#888; padding-top:20px;">
              <p>© ${new Date().getFullYear()} LMS App</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
