import { Service } from 'typedi';
import { Not } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { RegionTypeRepo } from '../respositories/RegionTypeRepo';

@Service()
export class RegionTypeService {

    constructor(@OrmRepository() private regionTypeRepo: RegionTypeRepo) {
    }

    public async findOrInsert(val: any): Promise<any> {

        let result: any;
        const check_region_type  = await this.regionTypeRepo.findOne({ where: { type_name: val.type_name, status_id: Not('3') } });
        if (check_region_type !== undefined) {
            result = check_region_type;
        } else {
            result = await this.regionTypeRepo.save(val);
        }

        return result.id;
    }

    public async findById(id: number): Promise<any> {
        const result = await this.regionTypeRepo.findOne({ where: {id}});
        return result;
    }

    public async findByName(type_name: string): Promise<any> {
        const result = await this.regionTypeRepo.findOne({ where: {type_name}});
        return result;
    }
}
