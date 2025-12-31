import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrinterConfigDto } from './dto/create-printer-config.dto';
import { UpdatePrinterConfigDto } from './dto/update-printer-config.dto';
import { CreatePrintJobDto } from './dto/create-print-job.dto';
import { PrinterConfig } from '../entities/printer-config.entity';
import { PrintJob, PrintJobStatus } from '../entities/print-job.entity';
import { Store } from '../entities/store.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PrintingService {
  constructor(
    @InjectRepository(PrinterConfig)
    private readonly printerConfigsRepository: Repository<PrinterConfig>,
    @InjectRepository(PrintJob)
    private readonly printJobsRepository: Repository<PrintJob>,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @Inject('PRINTING_SERVICE') private readonly printingClient: ClientProxy,
  ) {}

  private async validateStoreOwnership(tenantId: string, storeId: string) {
    const store = await this.storesRepository.findOne({
      where: { id: storeId, tenantId },
    });
    if (!store) {
      throw new NotFoundException('Store not found for this tenant');
    }
    return store;
  }

  async createConfig(tenantId: string, dto: CreatePrinterConfigDto) {
    const store = await this.validateStoreOwnership(tenantId, dto.storeId);
    const config = this.printerConfigsRepository.create({
      ...dto,
      storeId: store.id,
      store,
    });
    return this.printerConfigsRepository.save(config);
  }

  listConfigs(tenantId: string, storeId?: string) {
    const where: Record<string, any> = { store: { tenantId } };
    if (storeId) {
      where.storeId = storeId;
    }
    return this.printerConfigsRepository.find({
      where,
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateConfig(
    tenantId: string,
    id: string,
    dto: UpdatePrinterConfigDto,
  ) {
    const config = await this.printerConfigsRepository.findOne({
      where: { id, store: { tenantId } },
      relations: ['store'],
    });
    if (!config) {
      throw new NotFoundException(`Printer config with ID '${id}' not found`);
    }
    Object.assign(config, dto);
    return this.printerConfigsRepository.save(config);
  }

  async removeConfig(tenantId: string, id: string) {
    const config = await this.printerConfigsRepository.findOne({
      where: { id, store: { tenantId } },
      relations: ['store'],
    });
    if (!config) {
      throw new NotFoundException(`Printer config with ID '${id}' not found`);
    }
    await this.printerConfigsRepository.delete(id);
  }

  async enqueueJob(tenantId: string, dto: CreatePrintJobDto) {
    await this.validateStoreOwnership(tenantId, dto.storeId);
    if (dto.printerConfigId) {
      const config = await this.printerConfigsRepository.findOne({
        where: { id: dto.printerConfigId, store: { tenantId } },
        relations: ['store'],
      });
      if (!config) {
        throw new NotFoundException('Printer config not found for this tenant');
      }
    }

    const job = this.printJobsRepository.create({
      ...dto,
      status: PrintJobStatus.QUEUED,
      attempts: 0,
    });
    const saved = await this.printJobsRepository.save(job);
    this.printingClient.emit('print_job_created', saved);
    return saved;
  }

  async retryJob(tenantId: string, id: string) {
    const job = await this.printJobsRepository.findOne({
      where: { id, store: { tenantId } },
      relations: ['store'],
    });
    if (!job) {
      throw new NotFoundException(`Print job with ID '${id}' not found`);
    }
    job.status = PrintJobStatus.QUEUED;
    job.attempts = (job.attempts || 0) + 1;
    const saved = await this.printJobsRepository.save(job);
    this.printingClient.emit('print_job_created', saved);
    return saved;
  }

  listJobs(tenantId: string, storeId?: string) {
    const where: Record<string, any> = { store: { tenantId } };
    if (storeId) {
      where.storeId = storeId;
    }
    return this.printJobsRepository.find({
      where,
      relations: ['store', 'printerConfig'],
      order: { createdAt: 'DESC' },
    });
  }
}
