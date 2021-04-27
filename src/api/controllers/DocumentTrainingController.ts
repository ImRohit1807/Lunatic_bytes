
import { Get, Post, Delete, QueryParams, HttpCode, JsonController, Res, UploadedFiles } from 'routing-controllers';
// import { Get, Post, Body, HttpCode, JsonController, Res, UploadedFiles } from 'routing-controllers';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { DocumentMasterService } from '../services/DocumentMasterService';
import { DocumentProcessService } from '../services/DocumentProcessService';
import { DocumentTypeSuggestionService } from '../services/DocumentTypeSuggestionService';
import { TemplateTypeSuggestionService } from '../services/TemplateTypeSuggestionService';
import { DocumentImageService } from '../services/DocumentImageService';
import { ImageRegionService } from '../services/ImageRegionService';

class BaseDocument {
    @IsNotEmpty({
        message: 'Document Id should not be empty.',
    })
    @IsUUID()
    public document_id: string;
}

@JsonController('document')
export class DocumentTrainingController {

    @Inject()
    private DocumentProcessService: DocumentProcessService;

    @Inject()
    private DocumentMasterService: DocumentMasterService;

    @Inject()
    private DocumentTypeSuggestionService: DocumentTypeSuggestionService;

    @Inject()
    private TemplateTypeSuggestionService: TemplateTypeSuggestionService;

    @Inject()
    private DocumentImageService: DocumentImageService;

   @Inject()
   private ImageRegionService: ImageRegionService;

    @Post('/file')
    @HttpCode(StatusCodes.OK)
    public async saveFile(@UploadedFiles('document') files: any[], @Res() response: express.Response): Promise<any> {

        const partner_id = 18;
        const result: any = [];
        for (const val of files) {
            const new_result = await this.DocumentProcessService.pdfUpload(val, partner_id);
            result.push(new_result);
        }
        return response.status(StatusCodes.OK).json({ result });

    }
    @Get('/all-files')
    @HttpCode(StatusCodes.OK)
    public async getAllDocument(@QueryParams() query, @Res() response: express.Response): Promise<any> {

        // console.log(req.headers);

        const page = query.page;
        const limit = query.limit;
        const partner_id = 18;

        const result = await this.DocumentMasterService.findAll(partner_id, page, limit);

        return response.status(StatusCodes.OK).json({ result });

    }
    

    @Get('/file')
    @HttpCode(StatusCodes.OK)
    public async getDocument(@QueryParams() query: BaseDocument, @Res() response: express.Response): Promise<any> {

        const document_id = query.document_id;
        //const partner_id = 18;

        const result = await this.DocumentMasterService.find(document_id);

        let new_result: any;
        for (let i = 0; i < result.length; i++) {
            new_result = {
                id: result[i].public_id,
                original_file_name: result[i].original_file_name,
                previous_document_id: await this.DocumentMasterService.previousDocument(result[i].id),
                next_document_id: await this.DocumentMasterService.nextDocument(result[i].id),
                is_complete: result[i].is_complete,
            };
            new_result.images = [];

            for (let j = 0; j < result[i].images.length; j++) {
                // console.log(result[i].images);
                const image_name = result[i].images[j].file_name;
                const document_type_id = result[i].images[j].document_type_id;
                const document_type_name = (document_type_id != null) ? result[i].images[j].documentType.type_name : null;

                const document_confidence = result[i].images[j].document_confidence;
                const template_type_id = result[i].images[j].template_type_id;

                const template_type_name = (template_type_id != null) ? result[i].images[j].templateType.type_name : null;
                const template_confidence = result[i].images[j].template_confidence;
                const image_signature_url = await this.DocumentProcessService.readImagePublic(image_name);
                const document_type_suggestion = await this.DocumentTypeSuggestionService.getSuggestion(result[i].images[j].id);
                const template_type_suggestion = await this.TemplateTypeSuggestionService.getSuggestion(result[i].images[j].id);
                new_result.images.push({
                    image_id: result[i].images[j].public_id, // Number(result[i].images[j].id)
                    page_no: Number(result[i].images[j].page_no),
                    image_path: image_signature_url,
                    document_type_id,
                    document_type_name,
                    document_confidence,
                    template_type_id,
                    template_type_name,
                    template_confidence,
                    document_classify_suggestion: document_type_suggestion,
                    template_classify_suggestion: template_type_suggestion,
                    annotation: JSON.parse(result[i].images[j].annotation),
                    process_annotation: JSON.parse(result[i].images[j].process_annotation),
                    is_complete: result[i].images[j].is_complete,
                });
            }
        }
        return response.status(StatusCodes.OK).json({ result: new_result });
    }

    // redirect to specific document from where user start to review
    @Get('/start-review')
    @HttpCode(StatusCodes.OK)
    public async startReviewDocument(@Res() response: express.Response): Promise<any> {

        // check there are any incomplete document or not.
        const get_public_id = await this.DocumentMasterService.start_review_document();           
        

        return response.status(StatusCodes.OK).json({ result: {id: get_public_id} });

    }

    // check how many files are completed and how many are incomplete files
    @Get('/file-status')
    @HttpCode(StatusCodes.OK)
    public async getFileStatus(@Res() response: express.Response): Promise<any> {
       const incomplete_file =  await this.DocumentMasterService.getTotalDocumentStatus(0);
       const complete_file =  await this.DocumentMasterService.getTotalDocumentStatus(1);
        
        return response.status(StatusCodes.OK).json({ result: {incomplete_file, complete_file }});

    }

    @Delete('/file')
    @HttpCode(StatusCodes.OK)
    public async deleteDocument(@QueryParams() query: BaseDocument, @Res() response: express.Response): Promise<any> {

        const document_id = query.document_id;
        const get_document = await this.DocumentMasterService.find(document_id);
        let message: any;
        if(get_document.length === 0)
        {
            message = { error: 'Oops! we did not find the documet.'};
        } else {

            for (let i of get_document) {
                const document_id = i.id;
                const document_file = i.new_file_name;
                // delete the pdf document
                await this.DocumentProcessService.deleteFileFromBucket(`${process.env.PDF_DIRECTORY}original-file/${document_file}`);
                console.log(document_id);
                   
                for (let j of i.images) {                    
                    const image_id = j.id;
                    const document_image_file = j.file_name;
                    // delete the document image
                    await this.DocumentProcessService.deleteFileFromBucket(`${process.env.PDF_IMAGE_DIRECTORY}original-file/${document_image_file}`);
                    
                                       
                    const get_region_image = await this.ImageRegionService.findAllbyImageId(image_id);
                    for (let k of get_region_image)
                    {
                        const image_region_id = k.id;
                        const image_region_file = k.file_name;
                        
                        // delete the region image
                        await this.DocumentProcessService.deleteFileFromBucket(`${process.env.PDF_IMAGE_DIRECTORY}region-file/${image_region_file}`);
                        
                        // delete from database
                        await this.ImageRegionService.deleteImageRegion(image_region_id); 
                    }
                    // delete from docoment type suggestion
                    await this.DocumentTypeSuggestionService.deleteDocomentSuggestionImageId(image_id);

                    // delete from template type suggestion
                    await this.TemplateTypeSuggestionService.deleteTemplateSuggestionImageId(image_id);

                    // delete the document image from database
                    await this.DocumentImageService.deleteImage(image_id);
                    
                }

                // delete the document
                this.DocumentMasterService.delete(document_id);
            }
            message = { success: 'You have deleted the document successfully.'};
        }

        return response.status(StatusCodes.OK).json({ result: message });
    }
}
