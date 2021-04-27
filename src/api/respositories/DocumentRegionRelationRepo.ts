import { EntityRepository, Repository } from 'typeorm';
import { DocumentRegionRelationEntity } from '../entities/DocumentRegionRelationEntity';

@EntityRepository(DocumentRegionRelationEntity)
export class DocumentRegionRelationRepo  extends Repository<DocumentRegionRelationEntity> {
}
