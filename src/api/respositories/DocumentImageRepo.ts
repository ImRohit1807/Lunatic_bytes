import { EntityRepository, Repository } from 'typeorm';
import { DocumentImageEntity } from '../entities/DocumentImageEntity';

@EntityRepository(DocumentImageEntity)
export class DocumentImageRepo  extends Repository<DocumentImageEntity> {
}
