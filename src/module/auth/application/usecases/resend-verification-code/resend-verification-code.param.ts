export class ResendVerificaionCodeParam {
  constructor(public readonly email: string) {
    if (!this.email) throw new Error('Email is missing');
  }
}
