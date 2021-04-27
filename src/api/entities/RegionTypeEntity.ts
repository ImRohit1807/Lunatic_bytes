import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { DocumentRegionRelationEntity } from './DocumentRegionRelationEntity';
import { ImageRegionEntity } from './ImageRegionEntity';

@Entity('REGION_TYPE')

export class RegionTypeEntity {

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

    @OneToMany(type => DocumentRegionRelationEntity, documentRegionRel => documentRegionRel.regionType)
    public documentRegionRel: DocumentRegionRelationEntity;

    @OneToMany(type => ImageRegionEntity, imageRegion => imageRegion.regionType)
    public imageRegion: ImageRegionEntity;
}
