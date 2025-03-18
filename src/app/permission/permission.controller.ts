import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Permission } from 'src/entities/permission.entity';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '그룹으로 권한 목록 조회 ' })
  @ApiResponse({
    status: 200,
    type: [Permission],
  })
  @Get('group')
  permissionsByGroup(@Request() req: any) {
    const { user } = req;
    return this.permissionService.permissionsByGroup(user?.mbrUserGroup);
  }
}
