export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Authentication {
  user: User;
  token: string;
}
export interface SignUpInput {
  email: string;
  name: string;
  password: string;
}
export interface AuthenticateInput {
  email: string;
  password: string;
}
