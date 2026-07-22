import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappTasksService } from './whatsapp-tasks.service';

@Module({
  providers: [WhatsappService, WhatsappTasksService],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
