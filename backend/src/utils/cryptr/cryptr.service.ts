import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import * as generateNewPassword from 'generate-password';

@Injectable()
export class CryptrService extends Cryptr {
  constructor(readonly config: ConfigService) {
    super(config.get('ENCRYPT_KEY')!, {
      encoding: 'base64',
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });
  }
  generatePassword(option: generateNewPassword.GenerateOptions) {
    const password = generateNewPassword.generate(
      option, // Avoid characters that look alike (e.g., 'l' and '1')
    );
    return password;
  }
}
