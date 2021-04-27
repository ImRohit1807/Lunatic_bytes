import { Get, Post, Put, Body, HttpCode, JsonController, QueryParams, Res } from 'routing-controllers';
import { IsNotEmpty } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { TemplateTypeService } from '../services/TemplateTypeService';

class BaseTemplate {
    @IsNotEmpty({
        message: 'Template type name should not be empty.',
    })
    public type_name: string;
}

class UpdateTemplate extends BaseTemplate{
    @IsNotEmpty()
    public template_type_id: number;
}

@JsonController('template-type')
export class TemplateTypeController {

    @Inject()
    private TemplateTypeService: TemplateTypeService;

    @Get()
    @HttpCode(StatusCodes.OK)
    public async getAllTemplateType(@Res() response: express.Response): Promise<any> {

        const result = await this.TemplateTypeService.findAll();
        const new_result = [];
        for (const v of result) {
            new_result.push({
                id: v.id,
                type_name: v.type_name,
            });
        }
        return response.status(StatusCodes.OK).json({ result: new_result });

    }

    // get all my templates
    @Get('/my')
    @HttpCode(StatusCodes.OK)
    public async getMyTemplateType(@QueryParams() query, @Res() response: express.Response): Promise<any> {

        const page = query.page;
        const limit = query.limit;
        const search_keyword = query.search_keyword;

        const partner_id = 18;
        const result = await this.TemplateTypeService.findMyTemplate(partner_id, page, limit, search_keyword);
        
        return response.status(StatusCodes.OK).json({ result });

    }

    @Post()
    @HttpCode(StatusCodes.OK)
    public async createTemplateType(@Body() body: BaseTemplate, @Res() response: express.Response): Promise<any> {

        const type_name = body.type_name;
        const partner_id = 18;
        const result = await this.TemplateTypeService.insert({ type_name, partner_id });

        return response.status(StatusCodes.OK).json({ result });
    }

    @Put()
    @HttpCode(StatusCodes.OK)
    public async updateTemplateType(@Body() body: UpdateTemplate, @Res() response: express.Response): Promise<any> {

        const type_name = body.type_name;
        const template_type_id = body.template_type_id;
        const partner_id = 18;
        const result = await this.TemplateTypeService.update({ type_name, template_type_id, partner_id });

        return response.status(StatusCodes.OK).json({ result });
    }
}
