import { Injectable } from '@nestjs/common';
import { IEmailService } from '../../domain/service/email.service.interface';
import * as nodemailer from 'nodemailer';
import { EmailServiceTemplate } from '@/module/users/application/ports/email-service';

@Injectable()
export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SERVICE_PROVIDER,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(email: string, subject: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: `LMS Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: EmailServiceTemplate(subject, code),
    });
  }
}
