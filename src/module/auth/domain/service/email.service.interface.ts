export class IEmailService {
  send: (email: string, subject: string, content: string) => Promise<void>;
}
