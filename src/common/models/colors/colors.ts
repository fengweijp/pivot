import { Class, Instance, isInstanceOf, isImmutableClass } from 'immutable-class';
import { $, Set, valueFromJS, valueToJS, FilterAction, LimitAction } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';

const NULL_COLOR = '#666666';
//const OTHERS_COLOR = '#AAAAAA';
const NORMAL_COLORS = [
  '#2D95CA',
  '#EFB925',
  '#DA4E99',
  '#4CC873',
  '#745CBD',
  '#EA7136',
  '#E68EE0',
  '#218C35',
  '#B0B510',
  '#904064'
];

function valuesToJS(values: Lookup<any>): Lookup<any> {
  var valuesJS: Lookup<any> = {};
  for (var i = 0; i < NORMAL_COLORS.length; i++) {
    if (!hasOwnProperty(values, i)) continue;
    valuesJS[i] = valueToJS(values[i]);
  }
  return valuesJS;
}

function valueEquals(v1: any, v2: any): boolean {
  if (v1 === v2) return true;
  if (!v1 !== !v2) return false;
  if (v1.toISOString && v2.toISOString) return v1.valueOf() === v2.valueOf();
  if (isImmutableClass(v1)) return v1.equals(v2);
  return false;
}

function valuesEqual(values1: Lookup<any>, values2: Lookup<any>): boolean {
  if (!Boolean(values1) === Boolean(values2)) return false;
  if (values1 === values2) return true;
  if (!values1 !== !values2) return false;
  if (typeof values1 !== typeof values2) return false;
  for (var i = 0; i < NORMAL_COLORS.length; i++) {
    var v1 = values1[i];
    var v2 = values2[i];
    if (hasOwnProperty(values1, i) !== hasOwnProperty(values2, i)) return false;
    if (!valueEquals(v1, v2)) return false;
  }
  return true;
}

function cloneValues(values: Lookup<any>): Lookup<any> {
  var newValues: Lookup<any> = {};
  for (var i = 0; i < NORMAL_COLORS.length; i++) {
    if (!hasOwnProperty(values, i)) continue;
    newValues[i] = values[i];
  }
  return newValues;
}

export interface ColorsValue {
  dimension: string;
  values?: Lookup<any>;
  hasNull?: boolean;
  limit?: number;
}

export interface ColorsJS {
  dimension: string;
  values?: Lookup<any>;
  hasNull?: boolean;
  limit?: number;
}

var check: Class<ColorsValue, ColorsJS>;
export class Colors implements Instance<ColorsValue, ColorsJS> {

  static isColors(candidate: any): candidate is Colors {
    return isInstanceOf(candidate, Colors);
  }

  static fromLimit(dimension: string, limit: number): Colors {
    return new Colors({ dimension, limit });
  }

  static fromValues(dimension: string, values: any[]): Colors {
    var valueLookup: Lookup<any> = {};
    var hasNull = false;
    var n = Math.min(values.length, NORMAL_COLORS.length + 1);
    var i = 0;
    var j = 0;
    while (i < n) {
      var v = values[i];
      if (v === null) {
        hasNull = true;
      } else {
        valueLookup[j] = v;
        j++;
      }
      i++;
    }
    return new Colors({
      dimension,
      hasNull,
      values: valueLookup
    });
  }

  static fromJS(parameters: ColorsJS): Colors {
    var value: ColorsValue = {
      dimension: parameters.dimension,
      limit: parameters.limit
    };

    var valuesJS = parameters.values;
    if (valuesJS) {
      var hasNull = Boolean(parameters.hasNull);
      var values: Lookup<any> = {};
      for (var i = 0; i < NORMAL_COLORS.length; i++) {
        if (!hasOwnProperty(valuesJS, i)) continue;
        var vJS = valuesJS[i];
        if (vJS === null) {
          hasNull = true; // Back compat (there might be a null in values)
        } else {
          values[i] = valueFromJS(vJS);
        }
      }
      value.values = values;
      value.hasNull = hasNull;
    }

    return new Colors(value);
  }


  public dimension: string;
  public values: Lookup<any>;
  public hasNull: boolean;
  public limit: number;

  constructor(parameters: ColorsValue) {
    this.dimension = parameters.dimension;
    if (!this.dimension) throw new Error('must have a dimension');
    this.values = parameters.values;
    this.hasNull = parameters.hasNull;
    this.limit = parameters.limit;
    if (!this.values && !this.limit) throw new Error('must have values or limit');
  }

  public valueOf(): ColorsValue {
    return {
      dimension: this.dimension,
      values: this.values,
      hasNull: this.hasNull,
      limit: this.limit
    };
  }

  public toJS(): ColorsJS {
    var js: ColorsJS = {
      dimension: this.dimension
    };
    if (this.values) js.values = valuesToJS(this.values);
    if (this.hasNull) js.hasNull = true;
    if (this.limit) js.limit = this.limit;
    return js;
  }

  public toJSON(): ColorsJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Colors: ${this.dimension}]`;
  }

  public equals(other: Colors): boolean {
    return Colors.isColors(other) &&
      valuesEqual(this.values, other.values) &&
      this.hasNull === other.hasNull &&
      this.limit === other.limit;
  }

  public numColors(): number {
    var { values, limit } = this;
    if (values) {
      return Object.keys(values).length + Number(this.hasNull);
    }
    return limit;
  }

  public toArray(): any[] {
    var { values, hasNull } = this;
    if (!values) return null;

    var vs: any[] = [];
    if (hasNull) vs.push(null);
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
      if (!hasOwnProperty(values, i)) continue;
      vs.push(values[i]);
    }

    return vs;
  }

  public toSet(): Set {
    if (!this.values) return null;
    return Set.fromJS(this.toArray());
  }

  public toHavingFilter(segmentName?: string): FilterAction {
    var { dimension, values } = this;
    if (!segmentName) segmentName = dimension;

    if (!values) return null;
    return new FilterAction({
      expression: $(segmentName).in(this.toSet())
    });
  }

  public toLimitAction(): LimitAction {
    return new LimitAction({
      limit: this.numColors()
    });
  }

  public toggle(v: any): Colors {
    return this.has(v) ? this.remove(v) : this.add(v);
  }

  public valueIndex(v: any): number {
    var { values } = this;
    if (!values) return -1;
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
      if (!hasOwnProperty(values, i)) continue;
      if (valueEquals(values[i], v)) return i;
    }
    return -1;
  }

  public nextIndex(): number {
    var { values } = this;
    if (!values) return 0;
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
      if (hasOwnProperty(values, i)) continue;
      return i;
    }
    return -1;
  }

  public has(v: any): boolean {
    if (v == null) return this.hasNull;
    return this.valueIndex(v) !== -1;
  }

  public add(v: any): Colors {
    if (this.has(v)) return this;
    var value = this.valueOf();

    if (v === null) {
      value.hasNull = true;
    } else {
      var idx = this.nextIndex();
      if (idx === -1) return this;
      value.values = value.values ? cloneValues(value.values) : {};
      value.values[idx] = v;
      delete value.limit;
    }

    return new Colors(value);
  }

  public remove(v: any): Colors {
    if (!this.has(v)) return this;
    var value = this.valueOf();

    if (v == null) {
      value.hasNull = false;
    } else {
      var idx = this.valueIndex(v);
      if (idx === -1) return this;
      value.values = cloneValues(value.values);
      delete value.values[idx];
      delete value.limit;
    }

    return new Colors(value);
  }

  public getColors(valuesToColor: any[]): string[] {
    var { values, limit, hasNull } = this;
    if (values) {
      return valuesToColor.map(value => {
        if (value === null && hasNull) return NULL_COLOR;
        var colorIdx = this.valueIndex(value);
        return colorIdx === -1 ? null : NORMAL_COLORS[colorIdx];
      });
    } else {
      var colors: string[] = [];
      var colorIdx = 0;
      for (var i = 0; i < valuesToColor.length; i++) {
        if (i < limit) {
          var v = valuesToColor[i];
          if (v === null) {
            colors.push(NULL_COLOR);
          } else {
            colors.push(NORMAL_COLORS[colorIdx]);
            colorIdx++;
          }
        } else {
          colors.push(null);
        }
      }
      return colors;
    }
  }
}
check = Colors;
