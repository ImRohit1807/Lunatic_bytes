import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DocumentTypeEntity } from './DocumentTypeEntity';
import { RegionTypeEntity } from './RegionTypeEntity';

@Entity('DOCUMENT_REGION_RELATION')

export class DocumentRegionRelationEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'document_type_id' })
    public document_type_id: number;

    @Column({ name: 'region_type_id' })
    public region_type_id: number;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @ManyToOne(type => DocumentTypeEntity, documentType => documentType.documentRegionRel)
    @JoinColumn({ name: 'document_type_id' })
    public documentType: DocumentTypeEntity;

    @ManyToOne(type => RegionTypeEntity, regionType => regionType.documentRegionRel)
    @JoinColumn({ name: 'region_type_id' })
    public regionType: RegionTypeEntity;
}
