import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ReactDOM } from "../config/react-source";

@Injectable()
export class ReactService {
  getReactDefinitionFile(): string {
    const filePath = join(__dirname, '..', 'config', 'react-source.d.ts');
    const fileContent = readFileSync(filePath, 'utf-8');
    return fileContent;
  }
}
