import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PRINTING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL not found in environment variables');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'print_jobs',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
