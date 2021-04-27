import {IsBoolean, IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class FaxInboxCreateRequest {

    @IsNumber()
    @IsNotEmpty({message: 'TO detail should not be empty'})
    public to: number;

    @IsNumber()
    @IsNotEmpty({message: 'FROM detail should not be empty'})
    public from: number;

    @IsString()
    public fileName: string;

    @IsString()
    public tiffFileName: string;

    @IsNumber()
    public pages: number;

    @IsString()
    public sendFaxNumber: string;

    @IsString()
    public sendEmailId: string;

    @IsBoolean()
    public referred: boolean;

    @IsString()
    public statusFaxInbox: string;

    @IsString()
    public dotFaxInbox: string;

    @IsBoolean()
    public saveRetry: boolean;

    @IsBoolean()
    public active: boolean;

}
