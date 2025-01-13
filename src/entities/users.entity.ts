import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserState {
  PENDING = 'PENDING', // 가입대기
  APPROVED = 'APPROVED', // 가입승인
  CANCEL = 'CANCEL', // 가입취소
  WITHDRAWAL = 'WITHDRAWAL', // 탈퇴처리
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string; // Refresh Token 저장

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;
}
