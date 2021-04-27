import { EntityRepository, Repository } from 'typeorm';
import { RegionTypeEntity } from '../entities/RegionTypeEntity';

@EntityRepository(RegionTypeEntity)
export class RegionTypeRepo  extends Repository<RegionTypeEntity> {
}
