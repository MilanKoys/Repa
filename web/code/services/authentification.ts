type Undefined<T> = undefined | T;
type Nullable<T> = null | T;

export interface Session {
  email: string;
  timestamp: number;
  signature: string;
}

const SESSION_COOKIE_NAME: string = "session";

const API_SIGN_IN_ENDPOINT: string = "/auth/login";
const API_URL: string = "http://localhost:4200";
const POST_METHOD: string = "POST";

export class AuthentificationService {
  private static instance: Undefined<AuthentificationService>;

  public session: Undefined<Session>;

  private constructor() {}

  private async loadSessionCookie() {
    return new Promise<Nullable<CookieListItem>>(async (resolve) => {
      resolve(await cookieStore.get(SESSION_COOKIE_NAME));
    });
  }

  private parseSessionCookieJson(cookie: CookieListItem): Nullable<Session> {
    if (cookie.value) {
      try {
        const value = JSON.parse(decodeURIComponent(cookie.value));
        return value;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  public static inject() {
    if (!AuthentificationService.instance) {
      AuthentificationService.instance = new AuthentificationService();
    }

    return AuthentificationService.instance;
  }

  public async loadSession() {
    const sessionCookie = await this.loadSessionCookie();
    if (sessionCookie) {
      const session = this.parseSessionCookieJson(sessionCookie);
      if (session) this.session = session;
      return session;
    }
  }

  public login(email: string, password: string): Promise<Response> {
    return fetch(`${API_URL}${API_SIGN_IN_ENDPOINT}`, {
      method: POST_METHOD,
      body: JSON.stringify({ email, password }),
    });
  }

  public logout() {
    return cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
