import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { DocumentTypeSuggestionRepo } from '../respositories/DocumentTypeSuggestionRepo';

@Service()
export class DocumentTypeSuggestionService {

    constructor(@OrmRepository() private documentTypeSuggestionRepo: DocumentTypeSuggestionRepo) {
    }

    public async insert(val: any): Promise<any> {

        const result = await this.documentTypeSuggestionRepo.save(val);
        return result.id;
    }

    public async getSuggestion(imageId: number): Promise<any> {
        const result = await this.documentTypeSuggestionRepo.createQueryBuilder('document_type_suggestion')
            .innerJoinAndSelect('document_type_suggestion.documentType', 'document_type')
            .where('document_type_suggestion.image_id = :imageId')
            .setParameters({ imageId })
            .getMany();

        const new_result = [];
        for (const v of result) {
            new_result.push({
                document_type_id: v.type_id,
                document_type_name: v.documentType.type_name,
                document_confidence: v.confidence,
            });
        }
        return new_result;
    }

    public async deleteDocomentSuggestionImageId(image_id: number): Promise<void> {

        await this.documentTypeSuggestionRepo.delete({image_id: image_id});
    }
}
