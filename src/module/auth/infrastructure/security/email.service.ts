import { Injectable } from '@nestjs/common';
import { IEmailService } from '../../domain/service/email.service.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(email: string, subject: string, content: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'LMS support <support@lms.com>',
      to: email,
      subject,
      html: content,
    });
  }
}
