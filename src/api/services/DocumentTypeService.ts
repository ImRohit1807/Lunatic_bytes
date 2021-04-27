import { Service } from 'typedi';
import { Not } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { DocumentTypeRepo } from '../respositories/DocumentTypeRepo';

@Service()
export class DocumentTypeService {
    constructor(@OrmRepository() private documentTypeRepo: DocumentTypeRepo) {
    }

    public async findOrInsert(val: any): Promise<any> {

        let result: any;
        const check_document_type = await this.documentTypeRepo.
            findOne({ where: { type_name: val.type_name, status_id: Not('3') } });
        if (check_document_type !== undefined) {
            result = check_document_type;
        } else {
            result = await this.documentTypeRepo.save(val);
        }
        return result.id;
    }

    public async findAll(): Promise<any> {

        const result = await this.documentTypeRepo.find({ where: { status_id: '1' }, order: { type_name: 'ASC' } });
        return result;

    }

    public async getAllReigions(): Promise<any> {

        const result = this.documentTypeRepo.find({ relations: ['documentRegionRel', 'documentRegionRel.regionType'],
                         where: { status_id: '1' }, order: { type_name: 'ASC' } });
        return result;
    }    
}
