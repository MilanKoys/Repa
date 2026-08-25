export interface CreateUser {
  username: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface User {
  username: string;
  email: string;
  password: string;
  created: number;
}
