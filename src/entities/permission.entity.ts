import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseUser } from './base-user.entity';

/**
 * 권한
 * (메뉴) 관리자설정- 사용자관리 - 권한 관리
 */
@Entity('permissions')
export class Permission extends BaseUser {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    name: 'pms_id',
    primaryKeyConstraintName: 'permissions_pk',
    comment: 'Primary Key, Index',
  })
  pmsId: number;

  @PrimaryColumn('varchar', {
    length: 20,
    name: 'pms_group',
    primaryKeyConstraintName: 'permissions_pk',
    comment: '권한그룹',
    unique: true,
  })
  pmsGroup: string;

  @PrimaryColumn('varchar', {
    length: 20,
    name: 'pms_menu_name',
    primaryKeyConstraintName: 'permissions_pk',
    comment: '메뉴',
  })
  pmsMenuName: string;

  @Column('int', { nullable: true, comment: '사용여부' })
  pmsMenuActive: number;

  @Column('int', { nullable: true, comment: '작성/등록' })
  pmsMenuInsert: number;

  @Column('int', { nullable: true, comment: '편집' })
  pmsMenuUpdate: number;

  @Column('int', { nullable: true, comment: '삭제' })
  pmsMenuDelete: number;

  @Column('int', { nullable: true, comment: '읽기' })
  pmsMenuRead: number;
}
