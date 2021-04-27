import { EntityRepository, Repository } from 'typeorm';
import { TemplateTypeEntity } from '../entities/TemplateTypeEntity';

@EntityRepository(TemplateTypeEntity)
export class TemplateTypeRepo  extends Repository<TemplateTypeEntity> {
}
