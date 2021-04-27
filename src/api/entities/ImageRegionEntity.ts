import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DocumentImageEntity } from './DocumentImageEntity';
import { RegionTypeEntity } from './RegionTypeEntity';

@Entity('IMAGE_REGION')

export class ImageRegionEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ name: 'public_id', length: 100 })
    public public_id: string;

    @Column({ name: 'image_id' })
    public image_id: number;

    @Column({ name: 'file_name', nullable: true })
    public file_name: string;

    @Column({ name: 'region_type_id', nullable: true })
    public region_type_id: number;

    @Column({ name: 'return_data', type: 'text', nullable: true})
    public return_data: string;
    /*
    @Column({ name: 'process_annotation', type: 'text', nullable: true})
    public process_annotation: string;
    */
    @Column({ name: 'status_id', length: 10, default: '1' })
    public status_id: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    public created_at: Date;

    @UpdateDateColumn({ name: 'update_at', nullable: true })
    public update_at: Date;

    @ManyToOne(() => DocumentImageEntity, docImage => docImage.imageRegions)
    @JoinColumn({ name: 'image_id' })
    public docImage: DocumentImageEntity;

    @ManyToOne(type => RegionTypeEntity, regionType => regionType.imageRegion)
    @JoinColumn({ name: 'region_type_id' })
    public regionType: RegionTypeEntity;

}
