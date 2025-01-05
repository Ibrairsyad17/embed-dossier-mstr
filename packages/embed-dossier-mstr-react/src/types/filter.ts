export interface FilterItems {
  value: string;
  name: string;
  selected: boolean;
}

export interface FilterSelection {
  value: string;
}

export interface FilterTypeInfo {
  items: FilterItems[];
  supportMultiple: boolean;
}

export interface FilterListType {
  filterKey: string;
  filterName: string;
  filterType: string;
  filterDetail: FilterTypeInfo;
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
