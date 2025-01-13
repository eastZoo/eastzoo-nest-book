import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import * as jwt from 'jsonwebtoken';

// 인증 관련 엔드포인트를 처리하는 컨트롤러
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 회원가입 엔드포인트 추가
  @Post('register')
  async register(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      if (!body.email || !body.password) {
        throw new UnauthorizedException(
          '이메일과 비밀번호를 모두 입력해주세요.',
        );
      }

      await this.authService.register(body.email, body.password);

      // 회원가입 후 자동 로그인 처리
      const { accessToken, refreshToken } = await this.authService.login(
        body.email,
        body.password,
      );

      // Refresh Token을 보안 쿠키로 설정
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 유효기간
      });

      // Access Token만 응답 본문에 포함하여 반환
      res.send({ accessToken });
    } catch (error) {
      console.log(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  // 로그인 처리 엔드포인트
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      if (!body.email || !body.password) {
        throw new UnauthorizedException(
          '이메일과 비밀번호를 모두 입력해주세요.',
        );
      }

      const { accessToken, refreshToken } = await this.authService.login(
        body.email,
        body.password,
      );

      // Refresh Token을 보안 쿠키로 설정
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: Number(process.env.JWT_REFRESH_EXPIRES), // 7일 유효기간
      });

      // Access Token만 응답 본문에 포함하여 반환
      res.send({ accessToken });
    } catch (error) {
      console.log(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Res() res: Response) {
    try {
      const refreshToken = res.req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new UnauthorizedException('리프레시 토큰이 없습니다.');
      }

      try {
        // jwt.verify를 프로미스로 처리하고 타입 지정
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
        ) as { userId: number };

        Logger.log('decoded', decoded);
        if (!decoded.userId) {
          throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
        }

        const newAccessToken = await this.authService.refreshToken(
          decoded.userId,
          refreshToken,
        );

        Logger.log('엑세스토큰 재발급');
        res.send({ accessToken: newAccessToken });
      } catch (jwtError) {
        throw new UnauthorizedException(
          '만료되거나 유효하지 않은 리프레시 토큰입니다.',
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 갱신 중 오류가 발생했습니다.');
    }
  }
}
