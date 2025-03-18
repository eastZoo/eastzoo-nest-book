import { UpdateDateColumn, Column } from 'typeorm';

/**
 * 작성자 정보
 */
export abstract class BaseUser {
  @Column({
    type: 'varchar',
    name: 'user_id',
    length: 20,
    comment: '작성자 ID',
  })
  userId: string;

  @Column({
    type: 'varchar',
    name: 'user_name',
    length: 50,
    comment: '작성자 이름',
  })
  userName: string;

  @Column({ type: 'timestamp', name: 'user_time', comment: '작성 시간' })
  @UpdateDateColumn()
  userTime: Date;
}
