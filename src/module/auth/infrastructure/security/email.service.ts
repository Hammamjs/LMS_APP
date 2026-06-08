import { Injectable } from '@nestjs/common';
import { IEmailService } from '../../domain/service/email.service.interface';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { EmailServiceTemplate } from '@/module/users/application/ports/email-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
<<<<<<< Updated upstream
export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SERVICE_PROVIDER,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
=======
export class MailersendService implements IEmailService {
  private mailerSend: MailerSend;

  constructor(private readonly config: ConfigService) {
    this.mailerSend = new MailerSend({
      apiKey: config.getOrThrow<string>('MAILER_SEND_API_KEY'),
>>>>>>> Stashed changes
    });
  }

  async send(email: string, subject: string, code: string): Promise<void> {
<<<<<<< Updated upstream
    await this.transporter.sendMail({
      from: `LMS Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: EmailServiceTemplate(subject, code),
    });
=======
    const sentFrom = new Sender(
      this.config.getOrThrow<string>('MAILER_SEND_FROM'),
      'LMS Support',
    );

    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(EmailServiceTemplate(subject, code));

    await this.mailerSend.email.send(emailParams);
>>>>>>> Stashed changes
  }
}
