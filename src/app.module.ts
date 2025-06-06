import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60, // segundos
        limit: 20,
      },
    ]),
    CompanyModule,
    ProductModule,
    AuthModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
