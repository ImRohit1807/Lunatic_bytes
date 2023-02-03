import { Service } from 'typedi';
@Service()
export class DocumentMasterService {
    constructor() { }

    public async saveUser(): Promise<any> {
        return "test"
    }
}
