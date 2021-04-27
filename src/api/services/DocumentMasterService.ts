// import { Inject, Service } from 'typedi';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import {LessThan, MoreThan} from "typeorm"
// import { DocumentLinkEntity} from '../entities/DocumentLinkEntity';
import { DocumentMasterRepo } from '../respositories/DocumentMasterRepo';
// import { is } from 'bluebird';
// import { DocumentProcessService } from '../services/DocumentProcessService';

@Service()
export class DocumentMasterService {
    constructor(@OrmRepository() private documentMasterRepo: DocumentMasterRepo ) { }

   //  @Inject()
   //  private DocumentProcessService: DocumentProcessService;

    public async addDocument(val: any): Promise<any> {
        try {
            const result: any = await this.documentMasterRepo.save(val);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    // for testing. it is not using.
    public async findAlls(): Promise<any> {
        const [allFiles, fileCount] = await this.documentMasterRepo.findAndCount({ relations: ['images'], where: { status_id: '1' } });

        const final_result = [];
        const results = [];

        for (let i = 0; i < allFiles.length; i++) {

            const images = [];
            for (let j = 0; j < allFiles[i].images.length; j++) {

                images.push({
                    page_no: allFiles[i].images[j].page_no,
                    image_path: `${process.env.STORAGE_BASE_URL}${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}original-file/${allFiles[i].images[j].file_name}`,
                });
            }

            results.push({
                id: allFiles[i].id,
                original_file_name: allFiles[i].original_file_name,
                images,
            });
        }

        final_result.push({
            fileCount,
            results,
        });

        return final_result;
    }

    public async findAll(partner_id: number, page?: number, limit?: number): Promise<any> {
        const result = await this.documentMasterRepo.createQueryBuilder('document_master')
            .where('document_master.status_id = :statusId')
            .andWhere('document_master.partner_id = :partnerId')
            .setParameters({ statusId: '1', partnerId: partner_id });
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
            .orderBy('document_master.id', 'ASC')
            .take(per_page)
            .getMany();

        const documents = [];

        for (let i = 0; i < results.length; i++) {

            const images = [];

            const image = await this.documentMasterRepo.findOne({ relations: ['images'], where: { id: results[i].id }});

            // let image = await this.DocumentImageRepo.find({ where: {document_id: results[i].id} });

            for (let j = 0; j < image.images.length; j++) {

                images.push({
                    image_id: image.images[j].public_id,
                    page_no: Number(image.images[j].page_no),
                    });

            }

            documents.push({
                id: results[i].public_id,
                original_file_name: results[i].original_file_name,
                is_complete: results[i].is_complete,
                images,
            });
        }
        const final_result = {
            total_page,
            documents,
        };

        return final_result;
    }

    public async find(document_id: any): Promise<any> {
    const result = await this.documentMasterRepo.find({ relations: ['images', 'images.documentType', 'images.templateType'],
                    where: { public_id: document_id, status_id: '1' } });
    /*
    const result = await this.documentMasterRepo.createQueryBuilder('document_master')
                    .leftJoinAndSelect('document_master.images', 'document_image')
                    .leftJoinAndSelect('document_image.documentType', 'document_type')
                    .leftJoinAndSelect('document_image.templateType', 'template_type')
                    .where('document_master.id = :id')
                    .setParameters({ id: document_id })
                    .getMany();
    */
    return result;
    }

    public async start_review_document(): Promise<any> {
        
        // check is there any incomplete document or not.
        const result = await this.documentMasterRepo.findOne({ where: { is_complete: 0, status_id: '1' },  order: {id: 'ASC' } });
        let document_id: any;
        if(result !== undefined)
        {
            document_id = result.public_id;
        } else {

            // check any document from start
            const new_result = await this.documentMasterRepo.findOne({ where: { status_id: '1' },  order: {id: 'ASC' } });
            if(new_result !== undefined)
            {
                document_id = new_result.public_id;
            } else {

                document_id = null;
            }
        }

        return document_id;
    }

    public async nextDocument(document_id: any): Promise<any> {
    const result = await this.documentMasterRepo.findOne({ where: { id:MoreThan(document_id), status_id: '1' }, order: {id: 'ASC' }});
    
    let new_result: any = null;
        if(result !== undefined)
        {
            new_result = result.public_id;
        }
        
        return new_result;
    }

    public async previousDocument(document_id: any): Promise<any> {
        const result = await this.documentMasterRepo.findOne({ where: { id:LessThan(document_id), status_id: '1' }, order: {id: 'DESC' } });
        let new_result: any = null;
            if(result !== undefined)
            {
                new_result = result.public_id;
            }

            return new_result;
        }

        // fetch how may complete or incmplete documents
        public async getTotalDocumentStatus(document_status: number): Promise<any> {
            const [,total_file] = await this.documentMasterRepo.findAndCount({ where: { is_complete: document_status, status_id: '1' }});
               
                return total_file;
            }

            // update the document complete or incomplete satatus
            // by default document is incomplete
            public async updateDocumentStatus(document_id: number, document_status: number): Promise<any> {

                const result = await this.documentMasterRepo.findOne({ where: { id: document_id } });
                result.is_complete = document_status;
                await this.documentMasterRepo.save(result);

                return true;                
            }

    public async delete(document_id: number): Promise<void> {
        const result = await this.documentMasterRepo.findOne({ where: { id: document_id } });
        result.status_id = '3';
        this.documentMasterRepo.save(result);
    }
}
