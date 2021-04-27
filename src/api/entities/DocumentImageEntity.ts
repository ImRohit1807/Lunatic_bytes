import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DocumentMasterEntity } from './DocumentMasterEntity';
import { DocumentTypeSuggestionEntity } from './DocumentTypeSuggestionEntity';
import { DocumentTypeEntity } from './DocumentTypeEntity';
import { TemplateTypeSuggestionEntity } from './TemplateTypeSuggestionEntity';
import { TemplateTypeEntity } from './TemplateTypeEntity';
import { ImageRegionEntity } from './ImageRegionEntity';

@Entity('DOCUMENT_IMAGE')

export class DocumentImageEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ name: 'public_id', length: 100 })
    public public_id: string;

    @Column({ name: 'document_id' })
    public document_id: number;

    @Column({ name: 'page_no', nullable: true, length: 10 })
    public page_no: string;

    @Column({ name: 'file_name', nullable: true })
    public file_name: string;

    @Column({ name: 'document_type_id', nullable: true })
    public document_type_id: number;

    @Index()
    @Column({ name: 'document_confidence', type: 'decimal', precision: 15, scale: 4, nullable: true })
    public document_confidence: number;

    @Column({ name: 'template_type_id', nullable: true })
    public template_type_id: number;

    @Index()
    @Column({ name: 'template_confidence', type: 'decimal', precision: 15, scale: 4, nullable: true })
    public template_confidence: number;

    @Column({ name: 'annotation', type: 'text', nullable: true})
    public annotation: string;

    @Column({ name: 'process_annotation', type: 'text', nullable: true})
    public process_annotation: string;

    // default value is 0. That's mean not complete
    @Index()
    @Column({ name: 'is_complete', default: '0' })
    public is_complete: number;

    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @ManyToOne(() => DocumentMasterEntity, doc => doc.images)
    @JoinColumn({ name: 'document_id' })
    public doc: DocumentMasterEntity;

    @OneToMany(() => DocumentTypeSuggestionEntity, suggestion => suggestion.imageEntity)
    public suggestions: DocumentTypeSuggestionEntity[];

    @ManyToOne(type => DocumentTypeEntity, documentType => documentType.docImage) // specify inverse side as a second parameter
    @JoinColumn({ name: 'document_type_id' })
    public documentType: DocumentTypeEntity;

    @OneToMany(() => TemplateTypeSuggestionEntity, templateSuggestion => templateSuggestion.imageEntity)
    public templateSuggestions: TemplateTypeSuggestionEntity[];

    @ManyToOne(type => TemplateTypeEntity, templateType => templateType.docImage) // specify inverse side as a second parameter
    @JoinColumn({ name: 'template_type_id' })
    public templateType: TemplateTypeEntity;

    @OneToMany(() => ImageRegionEntity, imageRegion => imageRegion.docImage)
    public imageRegions: ImageRegionEntity[];
}
