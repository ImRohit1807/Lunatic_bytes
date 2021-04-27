import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { DocumentTypeSuggestionEntity } from './DocumentTypeSuggestionEntity';
import { DocumentImageEntity } from './DocumentImageEntity';
import { DocumentRegionRelationEntity } from './DocumentRegionRelationEntity';

@Entity('DOCUMENT_TYPE')

export class DocumentTypeEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ name: 'type_name', nullable: true })
    public type_name: string;

    @Index()
    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @OneToMany(type => DocumentTypeSuggestionEntity, docType => docType.documentType)
    public docType: DocumentTypeSuggestionEntity;

    @OneToMany(type => DocumentImageEntity, docImage => docImage.documentType)
    public docImage: DocumentImageEntity;

    @OneToMany(type => DocumentRegionRelationEntity, documentRegionRel => documentRegionRel.documentType)
    public documentRegionRel: DocumentRegionRelationEntity;

}
