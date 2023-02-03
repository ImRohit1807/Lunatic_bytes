
import { HttpCode, JsonController, Post, Res } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import { Inject } from 'typedi';
import { UserService } from '../services/UserService';

@JsonController('user')
export class UserController {

    @Inject()
    private userService: UserService;

    @Post('/test')
    @HttpCode(StatusCodes.OK)
    public async saveUser(@Res() response: express.Response): Promise<any> {
        console.log('test-->');
        const result = await this.userService.saveUser();
        return response.status(StatusCodes.OK).json({ result });
    }
}
