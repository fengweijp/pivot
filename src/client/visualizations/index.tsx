import { List } from 'immutable';
import { Manifest } from '../../common/models/index';

import { Totals } from './totals/totals';
import { Table } from './table/table';
import { LineChart } from './line-chart/line-chart';
import { BarChart } from './bar-chart/bar-chart';
import { Geo } from './geo/geo';

export var visualizations: List<Manifest> = List([
  Totals,
  Table,
  LineChart,
  BarChart,
  Geo
]);
