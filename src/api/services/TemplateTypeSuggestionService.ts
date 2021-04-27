import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { TemplateTypeSuggestionRepo } from '../respositories/TemplateTypeSuggestionRepo';

@Service()
export class TemplateTypeSuggestionService {
    constructor(@OrmRepository() private templateTypeSuggestionRepo: TemplateTypeSuggestionRepo) {
    }
    public async insert(val: any): Promise<any> {

        const result = await this.templateTypeSuggestionRepo.save(val);
        return result.id;
    }

    public async getSuggestion(imageId: number): Promise<any> {
        const result = await this.templateTypeSuggestionRepo.createQueryBuilder('template_type_suggestion')
            .innerJoinAndSelect('template_type_suggestion.templateType', 'template_type')
            .where('template_type_suggestion.image_id = :imageId')
            .setParameters({ imageId })
            .getMany();

        const new_result = [];
        for (const v of result) {
            new_result.push({
                template_type_id: v.type_id,
                template_type_name: v.templateType.type_name,
                template_confidence: v.confidence,
            });
        }
        return new_result;
    }

    public async deleteTemplateSuggestionImageId(image_id: number): Promise<void> {

        await this.templateTypeSuggestionRepo.delete({image_id: image_id});
    }
}
