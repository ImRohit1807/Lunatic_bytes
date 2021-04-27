import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { ImageRegionRepo } from '../respositories/ImageRegionRepo';

@Service()
export class ImageRegionService {

    constructor(@OrmRepository() private imageRegionRepo: ImageRegionRepo) {
    }

    public async insert(val: any): Promise<any> {

        const result = await this.imageRegionRepo.save(val);

        return result.id;
    }

    public async findAllbyImageId(image_id: number): Promise<any> {

        const result = await this.imageRegionRepo.find({ relations: ['regionType'], where: { image_id } });
        return result;
    }

    public async findbyId(region_id: string): Promise<any> {
        const result = await this.imageRegionRepo.findOne({ relations: ['regionType'], where: { public_id: region_id } });
        return result;
    }

    public async findbyImageIdAndRegionId(image_id: number, region_public_id: string): Promise<any> {
        const result = await this.imageRegionRepo.findOne({ relations: ['regionType'], where: { public_id: region_public_id, image_id } });
        return result;
    }

    public async updateProcessAnnotation(val: any): Promise<any> {

        const region_id = val.region_id;
        // const annotation = JSON.stringify(val.annotation);

        const result = await this.imageRegionRepo.findOne({ where: { public_id: region_id } });
        let message: any;
        if (result !== undefined) {
            // result.process_annotation = annotation;
            await this.imageRegionRepo.save(result);
            message = { success: 'Annotation has been updated successfully.' };
        } else {
            message = { error: 'Oops! Do not find the image region.' };
        }

        return message;
    }

    public async deleteImageRegion(region_id: number): Promise<void> {

        await this.imageRegionRepo.delete(region_id);
    }

}
