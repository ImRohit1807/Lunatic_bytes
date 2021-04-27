import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { DocumentRegionRelationRepo } from '../respositories/DocumentRegionRelationRepo';

@Service()
export class DocumentRegionRelationService {

    constructor(@OrmRepository() private documentRegionRelationRepo: DocumentRegionRelationRepo) {
    }

    public async insert(val: any): Promise<any> {

        let result: any;
        const check_doc_region_rel = await this.documentRegionRelationRepo
                                    .findOne({ where: { document_type_id: val.document_type_id, region_type_id: val.region_type_id } });
        if (check_doc_region_rel === undefined) {
            result = await this.documentRegionRelationRepo.save(val);
        }
        return result.id;
    }
    public async getReigionsByDcoumentId(val: any): Promise<any> {
        const result = this.documentRegionRelationRepo.find({ relations: ['regionType'], where: { document_type_id: val.document_type_id } });
        return result;
    }
}
