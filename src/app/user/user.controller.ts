import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(AccessTokenGuard)
  @Get('test')
  async testAuth() {
    return { message: '인증된 사용자입니다!' };
  }
}
