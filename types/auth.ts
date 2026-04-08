export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  userId: number
  email: string
  firstName: string
  lastName: string
}
