// 按需引入 ECharts
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册
echarts.use([
  PieChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

// 初始化
const chart = echarts.init(document.getElementById('main')!);

// 画饼图 用的教学里的ts模板，然后动态获取这个学的，有的函数还不是很清楚
const STORAGE_KEY = 'myResourceCards';
function loadResourceData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  /*默认数据*/
  if (!raw) {
    return [
      { value: 4, name: '学习区' },
      { value: 2, name: '娱乐区' },
      { value: 3, name: '竞赛区' },
    ];
  }
  //*统计各分区卡片数，不是很掌握的，学的*/
  return Object.entries(JSON.parse(raw) as Record<string, unknown[]>).map(
    ([cate, list]) => ({
      value: (list as { length: number }).length,
      name: cateName(cate),
    })
  );
}

/*分区英文名-中文*/
function cateName(en: string) {
  const map: Record<string, string> = {
    study: '学习区',
    entertainment: '娱乐区',
    competition: '竞赛区',
  };
  return map[en] || en;
}

function redrawPie() {
  const pieData = loadResourceData();
  chart.setOption({
    title: { text: '资源概览' },
    tooltip: {},
    legend: { data: pieData.map((d) => d.name) },
    series: [{ type: 'pie', radius: '60%', data: pieData }],
  });
}
redrawPie();

/*想要动态实现但是失败


window.addEventListener('storage', redrawPie);

let bc: BroadcastChannel | undefined;
try {
  bc = new BroadcastChannel('res_chart');
  bc.onmessage = () => redrawPie();
} catch (_) {
}
 */
