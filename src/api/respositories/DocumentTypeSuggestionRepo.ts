import { EntityRepository, Repository } from 'typeorm';
import { DocumentTypeSuggestionEntity } from '../entities/DocumentTypeSuggestionEntity';

@EntityRepository(DocumentTypeSuggestionEntity)
export class DocumentTypeSuggestionRepo  extends Repository<DocumentTypeSuggestionEntity> {
}
