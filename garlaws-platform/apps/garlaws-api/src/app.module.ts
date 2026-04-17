import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ServicesModule } from './modules/services/services.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PropertiesModule,
    ServicesModule,
    ComplianceModule,
    PaymentModule,
    SubscriptionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}