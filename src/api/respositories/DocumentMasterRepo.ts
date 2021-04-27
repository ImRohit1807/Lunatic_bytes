import { EntityRepository, Repository } from 'typeorm';
import { DocumentMasterEntity } from '../entities/DocumentMasterEntity';

@EntityRepository(DocumentMasterEntity)
export class DocumentMasterRepo  extends Repository<DocumentMasterEntity> {
}
