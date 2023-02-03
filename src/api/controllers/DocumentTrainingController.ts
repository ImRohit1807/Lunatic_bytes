
import { HttpCode, JsonController, Post, Res } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { DocumentMasterService } from '../services/DocumentMasterService';

@JsonController('document')
export class DocumentTrainingController {

    @Inject()
    private DocumentMasterService: DocumentMasterService;

    @Post('/test')
    @HttpCode(StatusCodes.OK)
    public async saveUser(@Res() response: express.Response): Promise<any> {
        console.log("test-->")
        const result = await this.DocumentMasterService.saveUser();
        return response.status(StatusCodes.OK).json({ result });
    }


}
