import { Post, Body, HttpCode, JsonController, Res } from 'routing-controllers';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { DocumentMasterService } from '../services/DocumentMasterService';
import { DocumentImageService } from '../services/DocumentImageService';
import { DocumentTypeService } from '../services/DocumentTypeService';
import { DocumentTypeSuggestionService } from '../services/DocumentTypeSuggestionService';
import { TemplateTypeService } from '../services/TemplateTypeService';
import { TemplateTypeSuggestionService } from '../services/TemplateTypeSuggestionService';
import { ImageClassifier } from '../services/ImageClassifier';
import { Inject } from 'typedi';

class BaseDocument {
    @IsNotEmpty()
    @IsUUID()
    public image_id: string;
}

class DocumentClassifyChange extends BaseDocument {

    @IsNotEmpty()
    public document_type_id: number;
}

class TemplateClassifyChange extends BaseDocument {

    @IsNotEmpty()
    public template_type_id: number;
}

class ProcessAnnotation extends BaseDocument {
    @IsNotEmpty()
    public process_annotation: string;
}

class Annotation extends BaseDocument {
    @IsNotEmpty()
    public annotation: string;
}

@JsonController('image')
export class ImageController {

    @Inject()
    private DocumentMasterService: DocumentMasterService;

    @Inject()
    private DocumentImageService: DocumentImageService;

    @Inject()
    private ImageClassifier: ImageClassifier;

    @Inject()
    private DocumentTypeService: DocumentTypeService;

    @Inject()
    private DocumentTypeSuggestionService: DocumentTypeSuggestionService;

    @Inject()
    private TemplateTypeService: TemplateTypeService;

    @Inject()
    private TemplateTypeSuggestionService: TemplateTypeSuggestionService;

    @Post('/update-image-document-classify')
    @HttpCode(StatusCodes.OK)
    public async updateImageDocument(@Body() body: DocumentClassifyChange, @Res() response: express.Response): Promise<any> {

        const image_id = body.image_id;
        const document_type_id = body.document_type_id;
        const result = await this.DocumentImageService.updateDocumentClassify(image_id, document_type_id);
        const message = (result) ? { success: 'The document classify has been updated successfully.' } : { error: 'Oops! we can not find the image.' };
        return response.status(StatusCodes.OK).json({ result: message });

    }

    @Post('/update-image-template-classify')
    @HttpCode(StatusCodes.OK)
    public async updateImageTemplate(@Body() body: TemplateClassifyChange, @Res() response: express.Response): Promise<any> {

        const image_id = body.image_id;
        // const page_no = body.page_no;
        const template_type_id = body.template_type_id;

        const result = await this.DocumentImageService.updateTemplateClassify(image_id, template_type_id);

        const message = (result) ? { success: 'The template classify has been updated successfully.' } : { error: 'Oops! we can not find the image.' };
        return response.status(StatusCodes.OK).json({ result: message });
    }

    // update of annotation
    @Post('/annotation')
    @HttpCode(StatusCodes.OK)
    public async annotation(@Body() body: Annotation, @Res() response: express.Response): Promise<any> {
        const image_id = body.image_id;
        const annotation = body.annotation;
        const result = await this.DocumentImageService.updateAnnotation({ image_id, annotation });

        return response.status(StatusCodes.OK).json({ result });

    }

    // update of process annotation
    @Post('/process-annotation')
    @HttpCode(StatusCodes.OK)
    public async processAnnotation(@Body() body: ProcessAnnotation, @Res() response: express.Response): Promise<any> {
        const image_id = body.image_id;
        const process_annotation = body.process_annotation;
        // at the time of update the process annotation mark the image as complete
        const result = await this.DocumentImageService.updateProcessAnnotation({ image_id, process_annotation });

        // get the document id
        const document_image = await this.DocumentImageService.getImage({image_id});
        if(document_image !== undefined)
        {
            const document_id = document_image.document_id;
           
            // check how many incomplete image
            const total_incomplete_image = await this.DocumentImageService.getTotalDocumentStatus(document_id, 0);
           
            // if there are no incomplete image then need to complete the document
            if(total_incomplete_image === 0)
            {
                // mark the document as complete
                await  this.DocumentMasterService.updateDocumentStatus(document_id, 1);
            }
        }

        return response.status(StatusCodes.OK).json({ result });

    }

    // not needed now
    @Post('/document-classifier')
    @HttpCode(StatusCodes.OK)
    public async documentClassifier(@Body() body: BaseDocument, @Res() response: express.Response): Promise<any> {

        const image_id = body.image_id;

        const result = await this.DocumentImageService.getImage({ image_id });
        let image_path: any;
        let new_result: any;
        if (result !== undefined) {
            image_path = `${process.env.STORAGE_BASE_URL}${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}original-file/${result.file_name}`;
            new_result = await this.ImageClassifier.documentClassifier(image_path);

            // test purpose
            if (new_result.success) {
                for (let i = 0; i <= 4; i++) {
                    if (new_result.top3[i] !== undefined) {
                        const document_type_id = await this.DocumentTypeService.findOrInsert({ type_name: new_result.top3[i].class });
                        await this.DocumentTypeSuggestionService.insert({ image_id: 1, type_id: document_type_id, confidence: new_result.top3[i].confidence });
                    }

                }
            }
        }

        return response.status(StatusCodes.OK).json({ result: new_result });
    }

    // not needed now
    @Post('/template-classifier')
    @HttpCode(StatusCodes.OK)
    public async templateClassifier(@Body() body: BaseDocument, @Res() response: express.Response): Promise<any> {

        const image_id = body.image_id;

        const result = await this.DocumentImageService.getImage({ image_id });
        let image_path: any;
        let new_result: any;
        if (result !== undefined) {
            image_path = `${process.env.STORAGE_BASE_URL}${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}original-file/${result.file_name}`;
            new_result = await this.ImageClassifier.templateClassifier(image_path);

            // test purpose
            if (new_result.success) {
                for (let i = 0; i <= 4; i++) {
                    if (new_result.top3[i] !== undefined) {
                        const template_type_id = await this.TemplateTypeService.findOrInsert({ type_name: new_result.top3[i].class });
                        await this.TemplateTypeSuggestionService.insert({ image_id: 1, type_id: template_type_id, confidence: new_result.top3[i].confidence });
                    }

                }
            }
        }

        return response.status(StatusCodes.OK).json({ result: new_result });

    }
}
