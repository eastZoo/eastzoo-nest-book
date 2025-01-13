// 필요한 의존성 모듈 가져오기
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../app/user/user.service';
import * as bcrypt from 'bcryptjs';
import { Users } from 'src/entities/users.entity';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

// Injectable 데코레이터를 사용하여 이 클래스가 NestJS의 의존성 주입 시스템에서 사용될 수 있음을 표시
@Injectable()
export class AuthService {
  // UserService와 JwtService를 주입받는 생성자
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {}

  // 로그인 처리를 위한 메서드
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 이메일로 사용자 찾기
    const user = await this.userService.findByEmail(email);
    // 사용자가 없거나 비밀번호가 일치하지 않으면 예외 발생
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // Access Token 생성 (15분 유효)
    const accessToken = this.createAccessToken({ userId: user.id });
    // Refresh Token 생성 (7일 유효)
    const refreshToken = this.createRefreshToken({ userId: user.id });

    // 생성된 Refresh Token을 데이터베이스에 저장
    await this.userService.updateRefreshToken(user.id, refreshToken);

    // 생성된 토큰들 반환
    return { accessToken, refreshToken };
  }

  // Refresh Token을 사용하여 새로운 Access Token을 발급하는 메서드
  async refreshToken(userId: number, refreshToken: string): Promise<string> {
    try {
      Logger.log('refreshToken', refreshToken);

      // Refresh Token 유효성 검사
      const isValid = await this.userService.validateRefreshToken(
        userId,
        refreshToken,
      );

      console.log('isValid', isValid);
      // 유효하지 않은 경우 예외 발생
      if (!isValid) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 새로운 Access Token 발급 (30초 유효)
      return this.createAccessToken({ userId });
    } catch (error) {
      console.log('error', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 갱신 중 오류가 발생했습니다.');
    }
  }

  // 회원가입 메서드 추가
  async register(email: string, password: string): Promise<Users> {
    try {
      // 비밀번호 유효성 검사 추가
      if (password.length < 6) {
        throw new UnauthorizedException(
          '비밀번호는 최소 6자 이상이어야 합니다.',
        );
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new UnauthorizedException('유효하지 않은 이메일 형식입니다.');
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);

      // 사용자 생성
      return await this.userService.create(email, hashedPassword);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  // 엑세스 토큰 생성
  createAccessToken = (payload: any) => {
    Logger.log('createAdminAccessToken -> payload', payload);

    // 토큰 만료 시간 가져오기
    const ACCESS_TOKEN_EXPIRES = this.configService.get('JWT_ACCESS_EXPIRES');
    // 토큰 시크릿키 가져오기
    const jwtSecretKey = this.configService.get('JWT_SECRET');

    return jwt.sign(payload, jwtSecretKey, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
  };

  //  리프레쉬 토큰 생성
  createRefreshToken = (payload: any) => {
    Logger.log('createAdminRefreshToken -> payload', payload);

    // 토큰 시크릿키 가져오기
    const jwtRefreshSecretKey = this.configService.get('JWT_REFRESH_SECRET');
    // 토큰 만료 시간 가져오기
    const REFRESH_TOKEN_EXPIRES = this.configService.get('JWT_REFRESH_EXPIRES');

    return jwt.sign(payload, jwtRefreshSecretKey, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });
  };
}
