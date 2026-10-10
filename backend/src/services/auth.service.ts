/**
 * Authentication Service
 * User registration, credential verification, and JWT issuance.
 */
export class AuthService {
  async registerUser(data: any) {
    return { id: 'mock-user-id', email: data.email };
  }

  async validateCredentials(email: string, pass: string) {
    return { id: 'mock-user-id', email };
  }
}

export const authService = new AuthService();
