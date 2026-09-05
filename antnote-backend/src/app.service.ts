import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'antnote-backend',
      description:
        'API server for antnote, a beginner-friendly stock investing app',
      docs: '/api/docs',
    };
  }
}
