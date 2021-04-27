import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { DocumentImageEntity } from './DocumentImageEntity';
import { TemplateTypeEntity } from './TemplateTypeEntity';

@Entity('TEMPLATE_TYPE_SUGGESTION')

export class TemplateTypeSuggestionEntity {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    public id: number;

    // @Index()
    @Column({ name: 'image_id' })
    public image_id: number;

    // @Index()
    @Column({ name: 'type_id' })
    public type_id: number;

    @Index()
    @Column({ name: 'confidence', type: 'decimal', precision: 15, scale: 4, nullable: true })
    public confidence: number;

    @Index()
    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @ManyToOne(() => DocumentImageEntity, imageEntity => imageEntity.templateSuggestions)
    @JoinColumn({ name: 'image_id' })
    public imageEntity: DocumentImageEntity;

    @ManyToOne(type => TemplateTypeEntity, templateType => templateType.templateType) // specify inverse side as a second parameter
    @JoinColumn({name: 'type_id'})
    public templateType: TemplateTypeEntity;

}
