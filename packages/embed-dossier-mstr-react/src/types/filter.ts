/**
 * This file contains the types for the filter that we use for applying filters to the dossier.
 *
 * For more information, please refer to the MicroStrategy SDK documentation.
 * @see https://microstrategy.github.io/embedding-sdk-docs/add-functionality/filters
 */

export interface GeneralFilterItems {
  value: string;
  name: string;
  selected: boolean;
}

interface QualType {
  type: "highest" | "lowest" | "highest percent" | "lowest percent";
}

export interface FilterSelection {
  value?: string;
  name?: string;
}

export interface FilterTypeInfo {
  items: GeneralFilterItems[];
  supportMultiple: boolean;
}

export interface FilterTypeInfoSlider extends FilterTypeInfo {
  indexInfo: {
    itemsLength: number;
    from: number;
    to: number;
  };
}

export interface FilterTypeInfoCalendar {
  from: string;
  to: string;
  maxDate: string;
  minDate: string;
}

export interface FilterTypeInfoMetricQualByValue {
  operator:
    | "equals"
    | "not equals"
    | "greater"
    | "greater equal"
    | "less"
    | "less equal"
    | "between"
    | "not between"
    | "in"
    | "not in"
    | "is null"
    | "is not null";
  from?: string;
  to?: string;
  value?: string;
}

export interface FilterTypeInfoMetricQualByRank {
  qualType: QualType;
  value: string;
}

export interface FilterTypeInfoMetricSliderByValue {
  indexInfo: {
    itemsLength: number;
    itemsStep: number;
    from: number;
    to: number;
  };
  min: number;
  max: number;
  from: number;
  to: number;
}

export interface FilterTypeInfoMetricSliderByRank {
  indexInfo: {
    itemsLength: number;
    itemsStep: number;
    value: number;
  };
  min: number;
  max: number;
  qualType: QualType;
  value: number;
}

export interface FilterListType {
  filterKey: string;
  filterName: string;
  filterType: "attributeSelector" | "attributeSearchSelector";
  filterDetail:
    | FilterTypeInfo
    | FilterTypeInfoSlider
    | FilterTypeInfoCalendar
    | FilterTypeInfoMetricQualByValue
    | FilterTypeInfoMetricQualByRank
    | FilterTypeInfoMetricSliderByValue
    | FilterTypeInfoMetricSliderByRank;
  isExclude: boolean;
}

export interface Filter {
  key: string;
  name: string;
}

export interface SelectionFilter {
  id: string;
  name: string;
}

export interface FilterCreation {
  key: string;
  name: string;
  selections: SelectionFilter[];
}

export interface FilterJson {
  filterInfo: {
    key: string;
  };
  selections?: FilterSelection[] | FilterSelection | number | number[];
  date?: {
    from: string;
    to: string;
  };
  exp?: {
    operator:
      | "equals"
      | "not equals"
      | "greater"
      | "greater equal"
      | "less"
      | "less equal"
      | "between"
      | "not between"
      | "in"
      | "not in"
      | "is null"
      | "is not null";
    firstValue?: string;
    lastValue?: string;
    qualType?: "highest" | "lowest" | "highest percent" | "lowest percent";
    range?: number[];
    value?: number;
  };
  holdSubmit?: boolean;
}
