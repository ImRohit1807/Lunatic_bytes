import { Inject, Service } from 'typedi';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DocumentMasterService } from '../services/DocumentMasterService';
import { DocumentImageService } from '../services/DocumentImageService';
import { ImageClassifier } from '../services/ImageClassifier';

import { DocumentTypeService } from '../services/DocumentTypeService';
import { DocumentTypeSuggestionService } from '../services/DocumentTypeSuggestionService';

import { TemplateTypeService } from '../services/TemplateTypeService';
import { TemplateTypeSuggestionService } from '../services/TemplateTypeSuggestionService';
import { ImageRegionService } from '../services/ImageRegionService';
import { RegionTypeService } from '../services/RegionTypeService';

@Service()
export class DocumentProcessService {

  @Inject()
  private DocumentMasterService: DocumentMasterService;

  @Inject()
  private DocumentImageService: DocumentImageService;

  @Inject()
  private ImageClassifier: ImageClassifier;

  @Inject()
  private DocumentTypeService: DocumentTypeService;

  @Inject()
  private DocumentTypeSuggestionService: DocumentTypeSuggestionService;

  @Inject()
  private TemplateTypeService: TemplateTypeService;

  @Inject()
  private TemplateTypeSuggestionService: TemplateTypeSuggestionService;

  @Inject()
  private ImageRegionService: ImageRegionService;

  @Inject()
  private RegionTypeService: RegionTypeService;

  private serviceKeys: any = path.join(__dirname, '../../../credentials/keys.json');
  private blobStream: any;
  private data: any;

  public async pdfUpload(val: any, partner_id: number): Promise<any> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });
    // public id of document
    const public_id = uuidv4();
    const new_document_name = uuidv4() + '.pdf';
    const bucket = storage.bucket(process.env.BUCKET_NAME);

    let new_result: any;

    this.blobStream = bucket.file(`${process.env.PDF_DIRECTORY}original-file/${new_document_name}`);

    try {

      await this.blobStream.save(val.buffer);

      const document_master = await this.DocumentMasterService
        .addDocument({ public_id, original_file_name: val.originalname, new_file_name: new_document_name, partner_id });
      new_result = {
        id: public_id,
        original_file_name: val.originalname,

      };

      const document_id = await document_master.id;

      this.documentExtractImage(new_document_name, document_id);

      return new_result;

     
    } catch (error) {
      console.log(error);
    }
  }

  public async documentExtractImage(new_document_name: any, document_id: number): Promise<void> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    
    this.data = JSON.stringify({ file: `${process.env.BUCKET_NAME}/${process.env.PDF_DIRECTORY}original-file/${new_document_name}` });
    const config: any = {
      method: 'post',
      url: process.env.PDF_IMAGE_CONVERSION_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: this.data,
    };

    try {
      const process1: any = await axios(config);
      const image_link: any = process1.data;
      if (image_link.success) {

        for await (const image_val of image_link.output) {
          const new_page_no = image_val.page + 1;
          const new_image_name = uuidv4() + '_' + new_page_no + '.png';
          const imageStream = bucket.file(`${process.env.PDF_IMAGE_DIRECTORY}original-file/${new_image_name}`);
          try {

            const process2: any = await axios({
              method: 'get',
              url: image_val.url,
              // responseType: 'stream',
              responseType: 'arraybuffer',
            });
            try {

              // await process2.data.pipe(imageStream);
              await imageStream.save(process2.data);
              // public id of image
              const image_public_id = uuidv4();
              const image_id = await this.DocumentImageService.addImage({
                public_id: image_public_id, document_id,
                page_no: new_page_no, file_name: new_image_name,
              });

              // image full path
              const image_full_path = `${process.env.STORAGE_BASE_URL}${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}original-file/${new_image_name}`;

              // fetch the document classifier
              const document_classifier = await this.ImageClassifier.documentClassifier(image_full_path);
              if (document_classifier.success) {
                for (let i = 0; i <= 3; i++) {
                  if (document_classifier.top3[i] !== undefined) {
                    const document_type_id = await this.DocumentTypeService.findOrInsert({ type_name: document_classifier.top3[i].class });
                    await this.DocumentTypeSuggestionService.insert({
                      image_id, type_id: document_type_id,
                      confidence: document_classifier.top3[i].confidence,
                    });

                    // update the top document classify to document image
                    if (i === 0) {
                      await this.DocumentImageService.updateDocumentClassifyImage(image_id, {
                        document_type_id,
                        document_confidence: document_classifier.top3[i].confidence,
                      });
                    }
                  }
                }
              }

              // fetch template classifier
              const template_classifier = await this.ImageClassifier.templateClassifier(image_full_path);
              console.log(template_classifier);
              if (template_classifier.success) {
                for (let i = 0; i <= 3; i++) {
                  if (template_classifier.top3[i] !== undefined) {
                    const template_type_id = await this.TemplateTypeService.
                      findOrInsert({ type_name: template_classifier.top3[i].class });
                    console.log(template_type_id);

                    await this.TemplateTypeSuggestionService.insert({
                      image_id, type_id: template_type_id,
                      confidence: template_classifier.top3[i].confidence,
                    });
                    // update the top template classify to document image
                    if (i === 0) {
                      await this.DocumentImageService.updateTemplateClassifyImage(image_id,
                        { template_type_id, template_confidence: template_classifier.top3[i].confidence });
                    }
                  }
                }
              }
            } catch (error) {
              console.log(error);
            }
          } catch (error) {
            console.log(error);
          }

        }
        
      }
    } catch (error) {
      console.log(error);
    }
  }

  // the following function is not using. it is a back up.
  public async pdfExtractImage_backup(val: any, partner_id: number): Promise<any> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });
    // public id of document
    const public_id = uuidv4();
    const new_document_name = uuidv4() + '.pdf';
    const bucket = storage.bucket(process.env.BUCKET_NAME);

    let new_result: any;

    this.blobStream = bucket.file(`${process.env.PDF_DIRECTORY}original-file/${new_document_name}`);

    try {

      await this.blobStream.save(val.buffer);

      const document_master = await this.DocumentMasterService
        .addDocument({ public_id, original_file_name: val.originalname, new_file_name: new_document_name, partner_id });
      new_result = {
        id: public_id,
        original_file_name: val.originalname,

      };

      this.data = JSON.stringify({ file: `${process.env.BUCKET_NAME}/${process.env.PDF_DIRECTORY}original-file/${new_document_name}` });
      const config: any = {
        method: 'post',
        url: process.env.PDF_IMAGE_CONVERSION_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        data: this.data,
      };

      try {
        const process1: any = await axios(config);
        const image_link: any = process1.data;
        if (image_link.success) {

          for await (const image_val of image_link.output) {
            const new_page_no = image_val.page + 1;
            const new_image_name = uuidv4() + '_' + new_page_no + '.png';
            const imageStream = bucket.file(`${process.env.PDF_IMAGE_DIRECTORY}original-file/${new_image_name}`);
            try {

              const process2: any = await axios({
                method: 'get',
                url: image_val.url,
                // responseType: 'stream',
                responseType: 'arraybuffer',
              });
              try {

                // await process2.data.pipe(imageStream);
                await imageStream.save(process2.data);
                // public id of image
                const image_public_id = uuidv4();
                const image_id = await this.DocumentImageService.addImage({
                  public_id: image_public_id, document_id: document_master.id,
                  page_no: new_page_no, file_name: new_image_name,
                });

                // image full path
                const image_full_path = `${process.env.STORAGE_BASE_URL}${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}original-file/${new_image_name}`;

                // fetch the document classifier
                const document_classifier = await this.ImageClassifier.documentClassifier(image_full_path);
                if (document_classifier.success) {
                  for (let i = 0; i <= 3; i++) {
                    if (document_classifier.top3[i] !== undefined) {
                      const document_type_id = await this.DocumentTypeService.findOrInsert({ type_name: document_classifier.top3[i].class });
                      await this.DocumentTypeSuggestionService.insert({
                        image_id, type_id: document_type_id,
                        confidence: document_classifier.top3[i].confidence,
                      });

                      // update the top document classify to document image
                      if (i === 0) {
                        await this.DocumentImageService.updateDocumentClassifyImage(image_id, {
                          document_type_id,
                          document_confidence: document_classifier.top3[i].confidence,
                        });
                      }
                    }
                  }
                }

                // fetch template classifier
                const template_classifier = await this.ImageClassifier.templateClassifier(image_full_path);
                console.log(template_classifier);
                if (template_classifier.success) {
                  for (let i = 0; i <= 3; i++) {
                    if (template_classifier.top3[i] !== undefined) {
                      const template_type_id = await this.TemplateTypeService.
                        findOrInsert({ type_name: template_classifier.top3[i].class });
                      console.log(template_type_id);

                      await this.TemplateTypeSuggestionService.insert({
                        image_id, type_id: template_type_id,
                        confidence: template_classifier.top3[i].confidence,
                      });
                      // update the top template classify to document image
                      if (i === 0) {
                        await this.DocumentImageService.updateTemplateClassifyImage(image_id,
                          { template_type_id, template_confidence: template_classifier.top3[i].confidence });
                      }
                    }
                  }
                }
              } catch (error) {
                console.log(error);
              }
            } catch (error) {
              console.log(error);
            }

          }
          return new_result;
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // public image for 24 hours
  public async readImagePublic(val: any): Promise<any> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });

    const image_content = await storage
      .bucket(process.env.BUCKET_NAME)
      .file(`${process.env.PDF_IMAGE_DIRECTORY}original-file/${val}`);

    try {
      const url = await image_content.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      return url[0];

    } catch (error) {
      console.log(error);
    }

  }
  /*
  public async readImage(val: any): Promise<any> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });

    const image_content = await storage
      .bucket(process.env.BUCKET_NAME)
      .file(`${process.env.PDF_IMAGE_DIRECTORY}original-file/${val}`);
    try {
      const image_conents = await image_content.download();
      return image_conents;
    } catch (error) {
      console.log(error);
    }

  }
  */

  public async imageExtractRegion(val: any): Promise<any> {
    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });
    const file = val.file;
    const image_id = val.image_id;
    const region_type_id = val.region_type_id;
    const public_id = val.image_region_public_id;
    const extension = await this.getFileExtension(file.originalname);
    const new_image_name = uuidv4() + '.' + extension;
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    let final_result: any;
    this.blobStream = bucket.file(`${process.env.PDF_IMAGE_DIRECTORY}region-file/${new_image_name}`);
    // upload the image
    await this.blobStream.save(file.buffer);
    // send to the python endpoint
    const image_path = `${process.env.BUCKET_NAME}/${process.env.PDF_IMAGE_DIRECTORY}region-file/${new_image_name}`;

    const new_data = JSON.stringify({ file: image_path });
    const config: any = {
      method: 'post',
      url: process.env.IMAGE_REGION_EXTRACT_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: new_data,
    };

    let output: any;
    try {

      const process1: any = await axios(config);
      if (process1.data.success) {
        output = JSON.stringify(process1.data.output);
      } else {
        output = null;
      }
    } catch (error) {
      console.log(error);
    }
    // insert to image_region table
    await this.ImageRegionService.insert({ public_id, image_id, file_name: new_image_name, region_type_id, return_data: output });
    const region_type_result = await this.RegionTypeService.findById(region_type_id);
    final_result = {
      id: public_id,
      region_type_id,
      region_type_name: region_type_result.type_name,
      output: JSON.parse(output),
    };
    return final_result;
  }

  public async getFileExtension(val: any): Promise<any> {
    const arr = val.split('.');
    const extension = arr[arr.length - 1];
    return extension;
  }

  public async deleteFileFromBucket(file_name: any): Promise<any> {

    const storage = new Storage({
      keyFilename: this.serviceKeys,
    });

    const check_file =await  storage.bucket(process.env.BUCKET_NAME).file(file_name).exists();
    
    if(check_file)
    {
       
      try {
        await  storage.bucket(process.env.BUCKET_NAME).file(file_name).delete();
      }catch (error) {
        console.log(error);
      }  
    
    }
    
    return true;    

  }
}
