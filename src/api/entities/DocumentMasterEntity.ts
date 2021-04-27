import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { DocumentImageEntity } from './DocumentImageEntity';

@Entity('DOCUMENT_MASTER')

export class DocumentMasterEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ name: 'public_id', length: 100 })
    public public_id: string;

    @Index()
    @Column({ name: 'partner_id' })
    public partner_id: number;

    @Column({ name: 'original_file_name', nullable: true })
    public original_file_name: string;

    @Column({ name: 'new_file_name', nullable: true })
    public new_file_name: string;

    // default value is 0. That's mean not complete
    @Index()
    @Column({ name: 'is_complete', default: '0' })
    public is_complete: number;

    @Index()
    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @OneToMany(() => DocumentImageEntity, image => image.doc)
    public images: DocumentImageEntity[];
}
