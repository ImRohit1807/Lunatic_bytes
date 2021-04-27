import { PartnerContact } from '../../models/PartnerDetailModels';
import { PartnerDetails } from '../requests/PartnerManagement';

export class PartnerContactDetailResponse extends PartnerContact {
    public partner: PartnerDetails;
}
