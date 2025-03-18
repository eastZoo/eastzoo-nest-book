import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 그룹으로 권한 목록 조회
   * @param mbrUserGroup
   * @returns {Permission[]}
   */
  permissionsByGroup(mbrUserGroup: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { pmsGroup: mbrUserGroup },
    });
  }
}
