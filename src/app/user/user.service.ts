// 필요한 의존성 모듈 가져오기
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/entities/users.entity';

// Injectable 데코레이터를 사용하여 이 클래스가 NestJS의 의존성 주입 시스템에서 사용될 수 있음을 표시
@Injectable()
export class UserService {
  // 생성자에서 Users 엔티티에 대한 TypeORM 리포지토리 주입
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {}

  // 이메일로 사용자 찾기
  async findByEmail(email: string): Promise<Users> {
    return this.userRepository.findOneBy({ email });
  }

  // 새로운 사용자 생성
  async create(email: string, password: string): Promise<Users> {
    // 이메일 중복 체크
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    const user = this.userRepository.create({
      email,
      password, // 이미 해시화된 비밀번호가 전달됨
    });

    return this.userRepository.save(user);
  }

  // 리프레시 토큰 업데이트
  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    // 리프레시 토큰 해시화
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    // 사용자의 리프레시 토큰 업데이트
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  // 리프레시 토큰 유효성 검사
  async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    // 사용자 ID로 사용자 찾기
    const user = await this.userRepository.findOneBy({ id: userId });
    // 사용자가 없거나 리프레시 토큰이 없으면 false 반환
    if (!user || !user.refreshToken) return false;
    // 저장된 해시된 리프레시 토큰과 제공된 리프레시 토큰 비교
    return bcrypt.compare(refreshToken, user.refreshToken);
  }
}
