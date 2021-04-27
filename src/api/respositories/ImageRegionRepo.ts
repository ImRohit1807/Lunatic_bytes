import { EntityRepository, Repository } from 'typeorm';
import { ImageRegionEntity } from '../entities/ImageRegionEntity';

@EntityRepository(ImageRegionEntity)
export class ImageRegionRepo  extends Repository<ImageRegionEntity> {
}
