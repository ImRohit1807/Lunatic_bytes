import { Get, Post, Body, UploadedFile, QueryParams, HttpCode, JsonController, Res } from 'routing-controllers';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { DocumentProcessService } from '../services/DocumentProcessService';
import { ImageRegionService } from '../services/ImageRegionService';
import { DocumentMasterService } from '../services/DocumentMasterService';
import { DocumentImageService } from '../services/DocumentImageService';
import { RegionTypeService } from '../services/RegionTypeService';


class BaseRegion {
    @IsNotEmpty()
    @IsUUID()
    public image_id: string;

    @IsNotEmpty()
    public region_id: string;

    @IsNotEmpty()
    public region_type_name: string;
}

class RegionByImage {
    @IsNotEmpty()
    @IsUUID()
    public image_id: string;
}

class RegionById {
    @IsNotEmpty()
    public region_id: string;
}

class DeleteImageRegion extends RegionById{

    @IsNotEmpty()
    @IsUUID()
    public image_id: string;

    @IsNotEmpty()
    public annotation: string;

    @IsNotEmpty()
    public process_annotation: string;

}

/*
class ProcessAnnotation extends RegionById {
    @IsNotEmpty()
    public annotation: string;
}
*/

@JsonController('image-region')
export class ImageRegionController {

    @Inject()
    private DocumentProcessService: DocumentProcessService;

    @Inject()
    private ImageRegionService: ImageRegionService;

    @Inject()
    private DocumentMasterService: DocumentMasterService;

    @Inject()
    private DocumentImageService: DocumentImageService;

    @Inject()
    private RegionTypeService: RegionTypeService;

    @Post('/file')
    @HttpCode(StatusCodes.OK)
    public async saveFile(@UploadedFile('image', { required: true }) file: any, @Body() body: BaseRegion, @Res() response: express.Response): Promise<any> {

        // const result: any = [];
        const image_public_id = body.image_id; // image from document
        const image_region_public_id = body.region_id;
        const region_type_name = body.region_type_name;
        const region_type_arr = await this.RegionTypeService.findByName(region_type_name);

        // get image id
        const get_image_detail = await this.DocumentImageService.getImage({ image_id: image_public_id });
        let result: any;
        if (region_type_arr === undefined) {
            result = { error: `Oops! The region type name doe's exist in the system.` };            
        }
        else if (get_image_detail === undefined) {
            result = { error: `Oops! The image doe's not exist in the system.` };
        } else {            
            const image_id = get_image_detail.id;
            const region_type_id = region_type_arr.id;
            const new_result = await this.DocumentProcessService.imageExtractRegion({ file, image_id, image_region_public_id, region_type_id });
            result = new_result;
        }

        return response.status(StatusCodes.OK).json({ result });
    }

    @Get('/get-all-regions')
    @HttpCode(StatusCodes.OK)
    public async getAllRegions(@QueryParams() query: RegionByImage, @Res() response: express.Response): Promise<any> {

        const image_public_id = query.image_id;
        // get image id
        const get_image_detail = await this.DocumentImageService.getImage({ image_id: image_public_id });
        let result: any;
        if (get_image_detail !== undefined) {
            const image_id = get_image_detail.id;
            const new_result = [];
            const image_region_array = await this.ImageRegionService.findAllbyImageId(image_id);
            for (const v of image_region_array) {
                new_result.push({
                    id: v.public_id,
                    region_type_id: v.region_type_id,
                    region_type_name: v.regionType.type_name,
                    output: JSON.parse(v.return_data),
                    // process_annotation: JSON.parse(v.process_annotation),
                });
            }

            result = new_result;
        } else {
            result = { error: 'Oops! The image id is not exist in the system.' };
        }
        return response.status(StatusCodes.OK).json({ result });
    }

    @Get('/get-region')
    @HttpCode(StatusCodes.OK)
    public async getRegionById(@QueryParams() query: RegionById, @Res() response: express.Response): Promise<any> {

        const region_id = query.region_id;
        const result = await this.ImageRegionService.findbyId(region_id);
        let new_result = {};
        if (result !== undefined) {
            new_result = {
                id: result.public_id,
                file_name: result.file_name,
                region_type_id: result.region_type_id,
                region_type_name: result.regionType.type_name,
                output: JSON.parse(result.return_data),
                // process_annotation: JSON.parse(result.process_annotation),
            };
        }

        return response.status(StatusCodes.OK).json({ result: new_result });

    }

    // delete of image region
    @Post('/delete')
    @HttpCode(StatusCodes.OK)
    public async deleteRegion(@Body() body: DeleteImageRegion, @Res() response: express.Response): Promise<any> {
        const image_public_id = body.image_id;
        const region_public_id = body.region_id;
        const annotation = body.annotation;
        const process_annotation = body.process_annotation;

        let message: any;
        const result_image = await this.DocumentImageService.getImage({image_id: image_public_id});
        if(result_image === undefined)
        {
            message = { error: 'Oops! Do not find the image.' };
        } else {
            const image_id = result_image.id;
            const document_id = result_image.document_id;
            const result_image_region = await this.ImageRegionService.findbyImageIdAndRegionId(image_id, region_public_id);
            if(result_image_region === undefined)
            {
                message = { error: 'Oops! Do not find the image region.' };
            } else {
                const region_id = result_image_region.id;
                const region_file_name = result_image_region.file_name;
                 
                
                // delete the region image
                await this.DocumentProcessService.deleteFileFromBucket(`${process.env.PDF_IMAGE_DIRECTORY}region-file/${region_file_name}`);

                // delete the image record
                await this.ImageRegionService.deleteImageRegion(region_id);
                message = { success: 'Region has been deleted successfully.' }; 
                
                // check how many image regions.
                // if there are no image region then the status of the image will be incomplete
                const total_region = await this.ImageRegionService.findAllbyImageId(image_id);
                let is_complete: any = null;
                if(total_region.length === 0)
                {
                    is_complete = 0;

                    // if one image is incomplete then the document should be incomplete.
                    await this.DocumentMasterService.updateDocumentStatus(document_id,is_complete);

                }

                // update annotation and process annotation
                await this.DocumentImageService.updateAnnotationAndProcessAnnotation(image_id, annotation, process_annotation, is_complete);

            }            
        }
        return response.status(StatusCodes.OK).json({ result: message });
    }

    // update of process annotation
    /*
    @Post('/process-annotation')
    @HttpCode(StatusCodes.OK)
    public async processAnnotation(@Body() body: ProcessAnnotation, @Res() response: express.Response): Promise<any> {
        const region_id = body.region_id;
        const annotation = body.annotation;
        const result = await this.ImageRegionService.updateProcessAnnotation({ region_id, annotation });

        return response.status(StatusCodes.OK).json({ result });

    }
    */
}
