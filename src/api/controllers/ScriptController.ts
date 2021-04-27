import { Get, HttpCode, JsonController, Res, UseBefore, HeaderParam } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import * as path from 'path';
import fs from 'fs';
import { AuthenticationMiddleware } from 'security-util';
import { DocumentTypeService } from '../services/DocumentTypeService';
import { RegionTypeService } from '../services/RegionTypeService';
import { DocumentRegionRelationService } from '../services/DocumentRegionRelationService';

@JsonController('script')
@UseBefore(AuthenticationMiddleware)
export class ScriptController {

    @Inject()
    private DocumentTypeService: DocumentTypeService;

    @Inject()
    private RegionTypeService: RegionTypeService;

    @Inject()
    private DocumentRegionRelationService: DocumentRegionRelationService;

    @Get('/import-document-region')
    @HttpCode(StatusCodes.OK)
    public async getAllDocumentType(@Res() response: express.Response): Promise<any> {

        const document_region = path.join(__dirname, '../../../credentials/document-region.json');
        fs.readFile(document_region, 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            try {
                const new_data = JSON.parse(data);
                const keys = Object.keys(new_data);
                for (const v of keys) {
                    const document_type_id = await this.DocumentTypeService.findOrInsert({ type_name: v });
                    const child_value = new_data[v];

                    for (const j of child_value) {
                        const region_type_id = await this.RegionTypeService.findOrInsert({ type_name: j });
                        // insert the document and region relation
                        await this.DocumentRegionRelationService.insert({ document_type_id, region_type_id });
                    }

                }
            } catch (err) {
                console.error(err);
            }
        });
        return response.status(StatusCodes.OK).json({ result: 'ok' });
    }
    @Get('/check-token')
    @HttpCode(StatusCodes.OK)
    public async checkToken(@HeaderParam('x-partner-id', {required: true}) partnerId: string, @Res() response: express.Response): Promise<any> {
        
        return response.status(StatusCodes.OK).json({ result: partnerId });
    }
}
