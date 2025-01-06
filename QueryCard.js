// 依賴套件: echart、bootstrap

export class QueryCard {
  constructor({ containerId, title = "Query Card", styles = {} }) {
    this.containerId = containerId; // 容器ID
    this.chart = null;
    this.title = title; // 標題
    this.cardElement = null; // 儲存卡片元素
    this.cardData = null; // 卡片資料
    this.styles = styles; // 卡片樣式
    this.option = {
      grid: {
        top: "10%",
        left: "1%",
        right: "1%",
        bottom: "0%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: 'cross',
          crossStyle: {
          color: '#999'
          },
          label:{
          precision: 0 //取到整數
          }
        }
      },
      legend: {
        top:"top"
      },
      dataZoom: [
        {
          type: 'inside', // 啟用滾輪縮放
          start: 0,  // 初始顯示的起始位置（百分比）
          end: 100   // 初始顯示的結束位置（百分比）
        }
      ],
      xAxis: [
        {
          type: "category",
          data: [],
          boundaryGap:false,
          axisPointer: {
            shadowStyle: {
              color: "rgba(0, 0, 0, 0.08)", // 自定義陰影顏色
            },
            lineStyle: {
              width:2
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value"
        },
      ],
      series: []
    };
  }

  // 初始化卡片
  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found.`);
      return;
    }

    // 创建卡片结构
    this.cardElement = document.createElement('div');
    this.cardElement.className = 'query-card card shadow-sm mb-3';
    this.cardElement.style.height = this.styles.height

    this.cardElement.innerHTML = `
      <div class="card-header">
        <h5 class="card-title mb-0">${this.title}</h5>
      </div>
      <div class="card-body">
        <div id="${this.containerId}-chart" class="h-100"></div>
      </div>`
    ;

    // 将卡片插入到容器中
    container.appendChild(this.cardElement);

    // 初始化图表
    const chartWrapper = document.getElementById(`${this.containerId}-chart`)
    this.chart = echarts.init(chartWrapper);
  }

  setData(chartData) {
    if (!this.chart) {
      console.error("Chart has not been initialized. Call init() first.");
      return;
    }

    this.option.xAxis[0].data = chartData.xAxisData;
    this.option.series = chartData.seriesData;

    // 更新圖表
    this.chart.setOption(this.option);
  
  }
}
