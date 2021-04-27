import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { TemplateTypeSuggestionEntity } from './TemplateTypeSuggestionEntity';
import { DocumentImageEntity } from './DocumentImageEntity';

@Entity('TEMPLATE_TYPE')

export class TemplateTypeEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ name: 'type_name', nullable: true })
    public type_name: string;

    // if partner_id equal to null that's mean the template is created by system not a user/partner.
    @Index()
    @Column({ name: 'partner_id', nullable: true })
    public partner_id: number;

    @Index()
    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @OneToMany(type => TemplateTypeSuggestionEntity, templateType => templateType.templateType)
    public templateType: TemplateTypeSuggestionEntity;

    @OneToMany(type => DocumentImageEntity, docImage => docImage.templateType)
    public docImage: DocumentImageEntity;
}
