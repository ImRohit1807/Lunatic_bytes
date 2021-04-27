import { Get, QueryParams, HttpCode, JsonController, Res } from 'routing-controllers';
import { IsNotEmpty } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { DocumentTypeService } from '../services/DocumentTypeService';
import { DocumentRegionRelationService } from '../services/DocumentRegionRelationService';

class BaseDocumentType {
    @IsNotEmpty({
        message: 'Document Type Id should not be empty.',
    })
    public document_type_id: number;
}

@JsonController('document-type')
export class DocumentTypeController {

    @Inject()
    private DocumentTypeService: DocumentTypeService;

    @Inject()
    private DocumentRegionRelationService: DocumentRegionRelationService;

    @Get()
    @HttpCode(StatusCodes.OK)
    public async getAllDocumentType(@Res() response: express.Response): Promise<any> {

        const result = await this.DocumentTypeService.findAll();
        const new_result = [];
        for (const v of result) {
            new_result.push({
                id: v.id,
                type_name: v.type_name,
            });
        }
        return response.status(StatusCodes.OK).json({ result: new_result });

    }

    @Get('/regions')
    @HttpCode(StatusCodes.OK)
    public async getAllRegions(@Res() response: express.Response): Promise<any> {

        const result = await this.DocumentTypeService.getAllReigions();
        const new_result = [];
        for (const v of result) {
            const regions = [];
            for (const j of v.documentRegionRel) {
                regions.push({
                    region_type_id: j.region_type_id,
                    region_type_name: j.regionType.type_name,
                });
            }

            new_result.push({
                document_type_id: v.id,
                document_type_name: v.type_name,
                regions,
            });
        }
        return response.status(StatusCodes.OK).json({ result: new_result });
    }

    @Get('/regions-by-document-type')
    @HttpCode(StatusCodes.OK)
    public async getRegionsByDocumentId(@QueryParams() query: BaseDocumentType, @Res() response: express.Response): Promise<any> {

        const document_type_id = query.document_type_id;
        const result = await this.DocumentRegionRelationService.getReigionsByDcoumentId({ document_type_id });
        const new_result = [];
        for (const v of result) {
            new_result.push({
                region_type_id: v.region_type_id,
                region_type_name: v.regionType.type_name,
            });
        }
        return response.status(StatusCodes.OK).json({ result: new_result });
    }
}
