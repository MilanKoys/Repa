const actionScope = '[User]';

export namespace UserActions {
  export class Reset {
    static readonly type = `${actionScope} Reset`;
  }

  export class Login {
    static readonly type = `${actionScope} Login`;
    constructor(public payload: { email: string; password: string }) {}
  }
}
