export interface CreateUser {
  email: string;
  password: string;
}

export interface User {
  email: string;
  password: string;
  created: number;
}
