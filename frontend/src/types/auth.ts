export type Role = "USER" | "ADMIN";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface SignupInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}