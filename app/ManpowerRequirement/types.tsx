// app/ManpowerItems/types.ts
export interface Item {
    id: number;
    itemNo: string | null;
    description: string;
    unit: string;
    unitRateSar: string; // from DB: numeric
  }
  
  export interface WidgetEntry extends Item {
    days: number;
    persons: number;
    totalHours: number;
    totalValue: number;
  }
  
  export interface Group {
    id: number;
    name: string;
  }