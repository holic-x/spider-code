import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entites/Job';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "u_itc_platform",
      password: "xxx",
      database: "itc_platform",
      synchronize: true,
      logging: true,
      entities: [Job],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256 password',
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
