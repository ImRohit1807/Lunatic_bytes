
import { Get,  HttpCode, JsonController, Res } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { DocumentMasterService } from '../services/DocumentMasterService';

@JsonController('document')
export class DocumentTrainingController {

    @Inject()
    private DocumentMasterService: DocumentMasterService;

    @Get('/all-files')
    @HttpCode(StatusCodes.OK)
    public async getAllDocument(@Res() response: express.Response): Promise<any> {
        const result = await this.DocumentMasterService.findAll();
        return response.status(StatusCodes.OK).json({ result });
    }


}
