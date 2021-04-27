// import { Inject, Service } from 'typedi';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { DocumentImageRepo } from '../respositories/DocumentImageRepo';

@Service()
export class DocumentImageService {

    constructor(@OrmRepository() private documentImageRepo: DocumentImageRepo) {
    }

    public async addImage(val: any): Promise<any> {
        const result = await this.documentImageRepo.save(val);
        return result.id;
    }

    public async getImage(val: any): Promise<any> {
        return this.documentImageRepo.findOne({ where: { public_id: val.image_id } });
    }

    // at the time of pdf upload and process
    public async updateDocumentClassifyImage(id: number, val: any): Promise<any> {
        const result = await this.documentImageRepo.findOne(id);
        result.document_type_id = val.document_type_id;
        result.document_confidence = val.document_confidence;
        await this.documentImageRepo.save(result);
        return true;
    }

    // at the time of pdf upload and process
    public async updateTemplateClassifyImage(id: number, val: any): Promise<any> {
        const result = await this.documentImageRepo.findOne(id);
        result.template_type_id = val.template_type_id;
        result.template_confidence = val.template_confidence;
        await this.documentImageRepo.save(result);
        return true;
    }

    // at the time of change reuest for document classify from UI
    public async updateDocumentClassify(image_id: any, document_type_id: number): Promise<any> {
        // console.log(document_type_id)
        const result = await this.documentImageRepo.findOne({ where: { public_id: image_id } });
        if (result !== undefined) {
            result.document_type_id = document_type_id;
            await this.documentImageRepo.save(result);
            return true;
        } else {
            return false;
        }

    }

    // at the time of change reuest for template classify from UI
    public async updateTemplateClassify(image_id: any, template_type_id: number): Promise<any> {
        // console.log(document_type_id)
        const result = await this.documentImageRepo.findOne({ where: { public_id: image_id } });
        if (result !== undefined) {
            result.template_type_id = template_type_id;
            await this.documentImageRepo.save(result);
            return true;
        } else {
            return false;
        }

    }

    public async updateAnnotation(val: any): Promise<any> {

        const image_id = val.image_id;
        const annotation = JSON.stringify(val.annotation);
        const result = await this.documentImageRepo.findOne({ where: { public_id: image_id } });
        let message: any;
        if (result !== undefined) {
            result.annotation = annotation;
            await this.documentImageRepo.save(result);
            message = { success: 'Annotation has been updated successfully.' };
        } else {
            message = { error: 'Oops! Do not find the image.' };
        }

        return message;
    }

    public async updateProcessAnnotation(val: any): Promise<any> {

        const image_id = val.image_id;
        const process_annotation = JSON.stringify(val.process_annotation);
        const result = await this.documentImageRepo.findOne({ where: { public_id: image_id } });
        let message: any;
        if (result !== undefined) {
            result.process_annotation = process_annotation;
            result.is_complete = 1; // mark as complete at the time of update the process annotation
            await this.documentImageRepo.save(result);
            message = { success: 'Process annotation has been updated successfully.' };
        } else {
            message = { error: 'Oops! Do not find the image.' };
        }

        return message;
    }

    // update annotation and process annotation. Use it at the time of image region
    public async updateAnnotationAndProcessAnnotation(image_id: number, annotation: any, process_annotation: any, is_complete: any): Promise<any>{
        const result = await this.documentImageRepo.findOne({ where: { id: image_id } });
        result.annotation = JSON.stringify(annotation);
        result.process_annotation = JSON.stringify(process_annotation);
        // if the image is incomplete.
        if(is_complete != null)
        {
            result.is_complete = is_complete;
        }
        await this.documentImageRepo.save(result);

        return true;
    }

    /*
    public async findOne(public_image_id: string): Promise<any> {
        const result = await this.documentImageRepo.findOne({ where: { public_id: public_image_id } });
        return result;
    }
    */
   
     // fetch how may complete or incmplete document images by document id
     public async getTotalDocumentStatus(document_id: number, image_status: number): Promise<any> {
        const [,total_image] = await this.documentImageRepo.findAndCount({ where: { document_id, is_complete: image_status, status_id: '1' }});
           
            return total_image;
        }

    public async getTotalDocumentByTemplateType(template_type_id): Promise<any> {
        const [,total_image] = await this.documentImageRepo.findAndCount({ where: { template_type_id, status_id: '1' }});
           
            return total_image;
        }

    public async deleteImage(image_id: number): Promise<void> {

        await this.documentImageRepo.delete(image_id);
    }
}
