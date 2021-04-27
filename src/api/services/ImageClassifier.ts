import { Service } from 'typedi';
import axios from 'axios';

@Service()
export class ImageClassifier {

    public async documentClassifier(val: any): Promise<any> {
        const new_data = JSON.stringify({ file: val });
        const config: any = {
            method: 'post',
            url: process.env.IMAGE_DOCUMENT_CLASSIFY_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            data: new_data,
        };

        try {
            const process1 = await axios(config);
            return process1.data;
        } catch (error) {
            console.log(error);
        }

    }

    public async templateClassifier(val: any): Promise<any> {
        const new_data = JSON.stringify({ file: val });
        const config: any = {
            method: 'post',
            url: process.env.IMAGE_TEMPLATE_CLASSIFY_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            data: new_data,
        };

        try {
            const process1 = await axios(config);
            return process1.data;
        } catch (error) {
            console.log(error);
        }
    }

}
