import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  tokenExpires(): [Date, Date] {
    const accessToken = moment().add(4, 'hours').toDate();
    const refreshToken = moment().add(120, 'days').toDate();
    return [accessToken, refreshToken];
  }

  generateToken(userId: number): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(
      {
        type: 'access',
        userId,
      },
      {
        expiresIn: '4h',
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        type: 'refresh',
        userId,
      },
      {
        expiresIn: '120d',
      },
    );

    return { accessToken, refreshToken };
  }
}
