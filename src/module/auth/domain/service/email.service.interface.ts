export class IEmailService {
  send!: (to: string, subject: string, content: string) => Promise<void>;
}
