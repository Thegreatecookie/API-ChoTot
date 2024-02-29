import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import { Public } from './configs/configuration';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Public()
  @Get('provinces')
  getProvinces() {
    var obj = JSON.parse(fs.readFileSync('values/provinces.json', 'utf8'));


    return obj?.province?.map((province) => {
      return {
        label: province.name,
        value: province.idProvince,
      };
    });
  }

  @Public()
  @Get('districts')
  getDistricts(@Query('province') province: number) {
    var obj = JSON.parse(fs.readFileSync('values/provinces.json', 'utf8'));
    return obj?.district
      ?.filter((district) => district.idProvince === province)
      ?.map((district) => {
        return {
          label: district.name,
          value: district.idProvince,
        };
      });
  }
  @Public()
  @Get('district')
  getDisctrict(@Query('name') name: string) {
    var obj = JSON.parse(fs.readFileSync('values/provinces.json', 'utf8'));
    const data = obj?.province
      ?.filter((province) => province.name === name)
      ?.map((province) => {
        return {
          id: province.idProvince,
        };
      });
      return data;
  }

  @Public()
  @Get('brands')
  getBrands() {
    var obj = JSON.parse(fs.readFileSync('values/motorbike.json', 'utf8'));

    return obj?.brand?.map((brand) => {
      return {
        label: brand.name,
        value: brand.idBrand,
      };
    });
  }

  @Public()
  @Get('models')
  getModels(@Query('brand') brand: number) {
    var obj = JSON.parse(fs.readFileSync('values/motorbike.json', 'utf8'));

    return obj?.model
      ?.filter((model) => model.idBrand === brand)
      ?.map((model) => {
        return {
          label: model.name,
          value: model.idBrand,
        };
      });
  }

  @Public()
  @Get('model')
  getModel(@Query('brand') name: string) {
    var obj = JSON.parse(fs.readFileSync('values/motorbike.json.json', 'utf8'));
    
    const data = obj?.brand
      ?.filter((brand) => brand.name === name)
      ?.map((brand) => {
        return {
          id: brand.idbrand,
        };
      });
      return data;
  }
}
