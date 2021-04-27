import { EntityRepository, Repository } from 'typeorm';
import { TemplateTypeSuggestionEntity } from '../entities/TemplateTypeSuggestionEntity';

@EntityRepository(TemplateTypeSuggestionEntity)
export class TemplateTypeSuggestionRepo  extends Repository<TemplateTypeSuggestionEntity > {
}
