import { Service, Inject } from 'typedi';
import { Not } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { TemplateTypeRepo } from '../respositories/TemplateTypeRepo';
import { DocumentImageService } from './DocumentImageService';

@Service()
export class TemplateTypeService {

    constructor(@OrmRepository() private templateTypeRepo: TemplateTypeRepo) {
    }

    @Inject()
    DocumentImageService: DocumentImageService;

    public async findOrInsert(val: any): Promise<any> {

        let result: any;
        const check_template_type = await this.templateTypeRepo.findOne({ where: { type_name: val.type_name, status_id: Not('3') } });
        if (check_template_type !== undefined) {
            result = check_template_type;
        } else {
            result = await this.templateTypeRepo.save(val);
        }

        return result.id;
    }

    public async insert(val: any): Promise<any> {

        let message: any;
        // check the template is exist in the system or not
        const check_template_type = await this.templateTypeRepo.findOne({ where: { type_name: val.type_name, partner_id: val.partner_id,status_id: Not('3') } });
        if (check_template_type !== undefined) {
           // console.log(val);
            message = {error: 'This template type already present in the system.'};
        } else {
            await this.templateTypeRepo.save(val);
            message = {success: 'You have added template successfully.'};
            
        }
        return message;
    }

    public async update(val: any): Promise<any> {

        let message: any;
        // check the template is exist in the system or not
        const check_template_type = await this.templateTypeRepo.findOne({ where: { id: val.template_type_id, partner_id: val.partner_id, status_id: Not('3') } });
        if (check_template_type === undefined) {
           // console.log(val);
            message = {error: 'Oops: We did not find the template.'};

        } else {
            // check for the template name is using other or not in same partner
            const check_unique_template_type = await this.templateTypeRepo.findOne({ where: { type_name: val.type_name, partner_id: val.partner_id, id: Not(val.template_type_id), status_id: Not('3') } });
            if (check_unique_template_type !== undefined) {
               message = {error: 'This template type already present in the system.'};
             } else {
            check_template_type.type_name = val.type_name
            await this.templateTypeRepo.save(check_template_type);
            message = {success: 'You have updated the template successfully.'};
             }
        }
        return message;
    }

    public async findAll(): Promise<any> {

        const result = await this.templateTypeRepo.find({ where: { status_id: '1' }, order: { type_name: 'ASC'}});
        return result;

    }

    public async findMyTemplate(partner_id: number, page?: number, limit?: number, search_keyword?: any): Promise<any> {

        const result = await this.templateTypeRepo.createQueryBuilder('template_type')
            .select(['template_type.id', 'template_type.type_name', 'template_type.created_at', 'template_type.update_at'])
            // .select('template_type.type_name')
            .where('template_type.partner_id = :partnerId and template_type.status_id = :statusId', { partnerId: partner_id, statusId: '1' });
            if(search_keyword !== undefined && search_keyword != '')
            {
                result.andWhere('template_type.type_name like :searchKeyword',{ searchKeyword: `%${search_keyword}%`})
            }
            
            const count = await result.getCount();

            let skip = 0;
        let per_page = 5;

        if (page !== undefined && limit !== undefined) {
            per_page = limit;
            skip = (page - 1) * per_page;
        } else {
            per_page = 5;
            skip = 0;
        }

        const total_page = Math.ceil(count / per_page);

        const results = await result.skip(skip)
            .orderBy('template_type.id', 'ASC')
            .take(per_page)
            .getMany();
        const new_result = [];

            for(let v of results)
            {
                const total_image = await this.DocumentImageService.getTotalDocumentByTemplateType(v.id);
                new_result.push({
                    ...v,
                    total_image
                })
                
            }

            const final_result = {
                total_page,
                templates: new_result,

            };

            return final_result;

    }
}
