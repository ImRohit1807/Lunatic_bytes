import { UserEntity } from './../entities/UserEntity';
import { Service } from 'typedi';
import { UserRepo } from '../respositories/UserRepo';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Builder } from 'builder-pattern';

@Service()
export class UserService {
    constructor(@OrmRepository() private userRepo: UserRepo) { }

    public async saveUser(): Promise<any> {
        let userEntity = new UserEntity();
        userEntity = Builder(UserEntity)
        .name('testUname')
        .address('testAddress')
        .created_at(new Date())
        .update_at(new Date())
        .build();
        const result: any = await this.userRepo.save(userEntity);
        return result;
    }
}
