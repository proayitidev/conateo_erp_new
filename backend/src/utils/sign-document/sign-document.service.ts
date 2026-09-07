import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { IFileStorage } from '../file-manager/interface/file-manager.interface.js';
import formData from 'form-data';
import axios from 'axios';
import 'dotenv/config';
import { env } from 'prisma/config';
import { successWrapper } from '../common/successwrapper.js'
import { basename } from 'path';

@Injectable()
export class SignDocumentService {
    constructor(private readonly prisma: PrismaService, @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage) { }

    async signDocument(userId: number, documentId: number) {
        try {
            const document = await this.prisma.documents.findUnique({
                where: {
                    id: documentId
                }
            })
            if (!document) {
                throw new NotFoundException('Document_not_found')
            }
            const buffer = await this.fileManager.getFile({ file: { fileName: `${document.path}`, directory: 'numerisation' }, }, true)
            const form = new formData();

            form.append('pdf', buffer, {
                filename: `${document.path}`,
                contentType:
                    'application/pdf',
            });
            form.append("onetimeToken", "61feee589947af79ce2da2fd.b24aac55eb10d41106b23f99212da18e.991dd792c335bca26307f8b57d868bf50315ce1f0999a5b128f47034edce2a1260ad7acd")

            const response = await axios.post(
                `${env('DIGITAL_DOCUEMNT_URL')}/signature/sign-document`,
                form,
                {
                    headers: form.getHeaders({
                        'x-api-key': env('DIGITAL_DOCUMENT_API')
                    }),
                    responseType: "arraybuffer"
                }
            );

            const path = await this.fileManager.updateFileToRoot({
                buffer: Buffer.from(response.data),
                fileName: `${document.path}`,
                directory: 'numerisation',
            }, { fileName: `${document.path}`, directory: 'numerisation' })
            console.log("the path is here", path)

            await this.prisma.documents.update({
                where: { id: document.id }, data: {
                    path: basename(path)
                }
            })
            return successWrapper(HttpStatus.OK, 'Document signed successfully', { id: documentId })
        } catch (error) {
            console.log("the error is here", error)
        }

    }

}
