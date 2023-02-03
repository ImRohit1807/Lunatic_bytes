import { Service } from 'typedi';
@Service()
export class DocumentMasterService {
    constructor() { }

    public async findAll(): Promise<any> {
        return "test"
    }
}
