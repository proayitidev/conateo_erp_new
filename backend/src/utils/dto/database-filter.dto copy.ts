/* eslint-disable @typescript-eslint/no-unsafe-return */
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  isArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { concat, mergeWith, reduce, set } from 'lodash-es';

export enum FilterMatchMode {
  startsWith = 'startsWith',
  contains = 'contains',
  notContains = 'notContains',
  endsWith = 'endsWith',
  equals = 'equals',
  notEquals = 'notEquals',
  in = 'in',
  lessThan = 'lessThan',
  lessThanOrEqual = 'lessThanOrEqual',
  greaterThan = 'greaterThan',
  greaterThanOrEqual = 'greaterThanOrEqual',
  between = 'between',
  dateIs = 'dateIs',
  dateIsNot = 'dateIsNot',
  dateBefore = 'dateBefore',
  dateAfter = 'dateAfter',
}
export enum FilterOperator {
  and = 'and',
  or = 'or',
}

class DatabaseFilterItem {
  @IsOptional()
  value: unknown;

  @IsEnum(FilterMatchMode)
  @IsOptional()
  matchMode?: FilterMatchMode;
  getValue() {
    if (this.value) {
      if (this.matchMode) {
        return {
          [this.matchMode]: this.value,
        };
      }
      return this.value;
    }
  }
}
export class DatabaseFilterItemWithConstraints {
  @IsNotEmpty()
  @IsEnum(FilterOperator)
  operator!: FilterOperator;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => DatabaseFilterItem)
  constraints!: DatabaseFilterItem[];

  buildValues(key: string) {
    const where: Record<string, any> = {};

    const opValues = this.constraints.reduce(
      (result: Record<string, any>[], value) => {
        const constrainsValue = value.getValue();
        if (constrainsValue) {
          result.push({ [key]: constrainsValue });
        }

        return result;
      },
      [],
    );
    where[this.operator.toUpperCase()] = opValues;

    return where;
  }
}
export class DatabaseFilterData {
  @IsNotEmpty()
  @IsString()
  key!: string;
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (value) {
      if ('operator' in value && 'constraints' in value) {
        return plainToInstance(DatabaseFilterItemWithConstraints, value);
      } else {
        return plainToInstance(DatabaseFilterItem, value);
      }
    }
  })
  @Type((opts) => {
    return 'operator' in (opts?.object.value ?? {})
      ? DatabaseFilterItemWithConstraints
      : DatabaseFilterItem;
  })
  value!: DatabaseFilterItemWithConstraints | DatabaseFilterItem;

  buildFilter() {
    const where: Record<string, any> = {};
    if (this.value instanceof DatabaseFilterItemWithConstraints) {
      Object.assign(where, this.value.buildValues(this.key));
    } else if (this.value instanceof DatabaseFilterItem) {
      set(where, this.key, this.value.getValue());
    }
    return where;
  }
}

export class DatabaseFilterNew {
  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsString({ each: true })
  globalFilterFields?: string[];

  @IsOptional()
  @ValidateNested()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Parse if it's a string
    const parsed = (
      typeof value === 'string' ? JSON.parse(value) : value
    ) as Record<string, any>;
    // Force the plain objects into ColumnFilter instances so methods exist
    return plainToInstance(DatabaseFilterItem, parsed);
  })
  @Type(() => DatabaseFilterItem)
  global?: DatabaseFilterItem;

  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const parsed: Record<string, any> = (
      typeof value === 'string' ? JSON.parse(value) : value
    ) as Record<string, Record<string, any>>;
    const result = reduce(
      parsed,
      (result: DatabaseFilterData[], value: Record<string, any>, key) => {
        if (value) {
          if ('operator' in value && 'constraints' in value) {
            result.push(
              plainToInstance(DatabaseFilterData, {
                key,
                value,
              }),
            );
          } else {
            result.push(
              plainToInstance(DatabaseFilterData, {
                key,
                value,
              }),
            );
          }
        }
        return result;
      },
      [],
    );
    // if (errors.length > 0) {
    //   throw new BadRequestException(errors);
    // }
    return result;
  })
  @Type(() => DatabaseFilterData)
  filters?: DatabaseFilterData[];

  buildFilters() {
    console.log('the global filters', this.globalFilterFields);
    const globalFilterResult = this.global?.getValue();
    const globalWhere: Record<string, any> = {};
    if (globalFilterResult) {
      const globalFilter = reduce(
        this.globalFilterFields || [],
        (result: Record<string, any>[], value) => {
          result.push({ [value]: globalFilterResult });
          return result;
        },
        [],
      );
      if (globalFilter.length > 0) {
        globalWhere.OR = globalFilter;
      }
    }
    return reduce(
      this.filters,
      (
        result: { where: Record<string, any>; orderBy: any },
        filter: DatabaseFilterData,
      ) => {
        const filterValue = filter.buildFilter();
        if (filterValue) {
          result.where = mergeWith(
            filterValue,
            result.where,
            (objValue, srcValue) => {
              if (isArray(objValue)) {
                return concat(objValue, srcValue);
              }
            },
          );
        }
        return result;
      },
      {
        where: { ...globalWhere },
        orderBy: {},
      },
    );
  }
}
