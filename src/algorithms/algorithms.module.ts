import { Module } from '@nestjs/common';
import { AlgorithmsService } from './algorithms.service';

@Module({
  providers: [AlgorithmsService]
})
export class AlgorithmsModule {}
