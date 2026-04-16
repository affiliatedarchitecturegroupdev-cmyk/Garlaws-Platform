import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string): Promise<any> {
    if (email === 'admin@garlaws.co.za' && password === 'demo123') {
      return { id: 1, email, role: 'admin' };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    return {
      access_token: 'demo_token_' + Date.now(),
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}