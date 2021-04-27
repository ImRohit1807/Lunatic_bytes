import { EntityRepository, Repository } from 'typeorm';
import { DocumentTypeEntity } from '../entities/DocumentTypeEntity';

@EntityRepository(DocumentTypeEntity)
export class DocumentTypeRepo  extends Repository<DocumentTypeEntity> {
}
