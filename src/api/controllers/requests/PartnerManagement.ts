import {IsBoolean, IsNotEmpty, IsNumber, IsString, ValidateNested} from 'class-validator';
import { PartnerAppointmentConfig, PartnerContact, PartnerFaxConfig, PartnerFormConfig, PartnerInfinittConfig,
    PartnerLocation, PartnerOSCARConfig, PartnerOtherConfig, PartnerRingCentralConfig, PartnerSRFaxConfig
} from '../../models/PartnerDetailModels';

export class PartnerDetails {
    @IsNumber()
    @IsNotEmpty({message: 'Id should not be empty'})
    public id: number;
    @IsString()
    @IsNotEmpty({message: 'name should not be empty'})
    public name: string;
    @IsString()
    @IsNotEmpty({message: 'type should not be empty'})
    public type: string;
    @IsString()
    public key: string;
    @IsString()
    public group: string;
    @IsBoolean()
    public specialtyCOVID: boolean;
    @IsString()
    public fullName: string;
    @IsBoolean()
    public active: boolean;
    @IsString()
    public emrPathWay: string;
    @ValidateNested()
    public locations: PartnerLocation[];
    @ValidateNested()
    public formConfig: PartnerFormConfig;
    @ValidateNested()
    public faxConfig: PartnerFaxConfig;
    @ValidateNested()
    public appointmentConfig: PartnerAppointmentConfig;
    @ValidateNested()
    public contactDetail: PartnerContact;
    @ValidateNested()
    public oscarConfig: PartnerOSCARConfig;
    @ValidateNested()
    public infinittConfig: PartnerInfinittConfig;
    @ValidateNested()
    public ringCentralConfig: PartnerRingCentralConfig;
    @ValidateNested()
    public srFaxConfig: PartnerSRFaxConfig;
    @ValidateNested()
    public otherConfig: PartnerOtherConfig;
}
