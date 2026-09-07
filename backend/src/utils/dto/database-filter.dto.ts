import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import {
  mergeWith,
  concat,
  isArray,
  set,
  get,
  reduce,
  forEach,
  join,
  compact,
} from 'lodash-es';
import { Prisma } from '../prisma/client.js';
enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class ColumnFilter {
  @IsString({ each: true })
  @IsNotEmpty()
  key: string | string[];

  @IsOptional()
  search?: number | number[] | string | string[];

  @IsString({ each: true })
  @IsOptional()
  searchKey?: string | string[];

  @IsOptional()
  @IsEnum(SortOrder, { each: true })
  order: SortOrder | SortOrder[];

  @IsBoolean({ each: true })
  @IsOptional()
  isDate: boolean | boolean[];

  @IsBoolean({ each: true })
  @IsOptional()
  searchable: boolean | boolean[];

  @IsEnum(Prisma.QueryMode)
  @IsOptional()
  mode?: Prisma.QueryMode | Prisma.QueryMode[];

  private getData(data: any, key: any, defValue?: any) {
    return isArray(data) ? get(data, key) : (data ?? defValue);
  }

  private joinKeys(value: any[]) {
    return join(compact(value), '.');
  }

  getValues(search: string | string[] | undefined): {
    value: any;
    orderBy: any;
  } {
    const result: { value: any; orderBy: any } = {
      value: undefined,
      orderBy: undefined,
    };
    const searchData = this.search ?? (this.searchable ? search : undefined);

    if (isArray(this.key)) {
      if (searchData) {
        forEach(this.key, (val, index) => {
          const pathRoot = this.joinKeys([`OR[${index}]`, val]);
          result.value = set(
            result.value ?? {},
            this.joinKeys([pathRoot, this.getData(this.searchKey, index, '')]),
            this.getData(searchData, index),
          );
          if (this.mode) {
            result.value = set(
              result.value ?? {},
              this.joinKeys([pathRoot, 'mode']),
              this.getData(this.mode, index),
            );
          }
        });
      }
      if (this.order) {
        forEach(this.order, (val, index) => {
          result.orderBy = set(result.orderBy ?? {}, this.key[index], val);
        });
      }
    } else {
      if (searchData) {
        if (isArray(this.searchKey)) {
          forEach(this.searchKey, (val, index) => {
            result.value = set(
              result.value ?? {},
              this.joinKeys([this.key, val]),
              searchData[index],
            )
          });
        
      } else {
        result.value = set(
          result.value ?? {},
          this.joinKeys([this.key, this.searchKey]),
          searchData,
        );
      }

      if (this.mode) {
        result.value = set(
          result.value ?? {},
          this.joinKeys([this.key, 'mode']),
          this.mode,
        );
      }
    }
    if (this.order) {
      result.orderBy = set(result.orderBy ?? {}, this.key, this.order);
    }
  }
    return result;
  }
}

export class DatabaseFilterDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Parse if it's a string
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    // Force the plain objects into ColumnFilter instances so methods exist
    return plainToInstance(ColumnFilter, parsed);
  })
  @Type(() => ColumnFilter)
  @IsOptional()
  columns?: ColumnFilter[];

  @Type(() => ColumnFilter)
  @IsOptional()
  orColumns?: ColumnFilter[];

  buildData(): { where: any; orderBy: any } {
    if (!this.columns) return { where: {}, orderBy: {} };
    return reduce(
      this.columns,
      (result: { where: any; orderBy: any }, column: ColumnFilter) => {
        const { value, orderBy } = column.getValues(this.search);
        if (value) {
          result.where = mergeWith(
            value,
            result.where,
            (objValue, srcValue) => {
              if (isArray(objValue)) {
                return concat(objValue, srcValue);
              }
            },
          );
        }
        if (orderBy) {
          result.orderBy = mergeWith(orderBy, result.orderBy);
        }
        return result;
      },
      {
        where: {},
        orderBy: {},
      },
    );
  }
}
