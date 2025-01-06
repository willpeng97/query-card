// 依賴套件: echart、bootstrap，若html中沒有引用就會掛

export class QueryCard {
  constructor({ 
    SID,
    TABLE_NAME,
    containerId,
    category,
    title="Query Card",
    type="line",
    stack=false,
    styles={}
  })
  {
    this.SID = SID;
    this.TABLE_NAME = TABLE_NAME;
    this.containerId = containerId; // 容器ID
    this.chart = null;
    this.title = title; // 標題
    this.cardElement = null; // 儲存卡片元素
    this.cardData = null; // 卡片資料
    this.category = category
    this.type = type;
    this.stack = stack;
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
    this.cardElement.className = 'query-card card shadow-sm';
    Object.assign(this.cardElement.style, this.styles);

    this.cardElement.innerHTML = `
      <div class="card-header">
        <h5 class="card-title mb-0">${this.title}</h5>
      </div>
      <div class="card-body">
        <div id="${this.containerId}-chart" class="h-100"></div>
      </div>
    `;

    // 将卡片插入到容器中
    container.appendChild(this.cardElement);

    // 初始化图表
    const chartWrapper = document.getElementById(`${this.containerId}-chart`)
    this.chart = echarts.init(chartWrapper);

    // 取得第一次資料
    this.updateCard()

    // 響應式RWD
    window.addEventListener('resize', () => {
      if (window.innerWidth < 992) {
        this.option.grid.top = '0%';
        this.option.grid.bottom = '15%';
        this.option.legend.top = "bottom"
      } else {
        this.option.grid.top = '10%';
        this.option.grid.bottom = '0%';
        this.option.legend.top = "top"
      }
      this.chart.setOption(this.option); // 設定圖表選項
      this.chart.resize(); // 調整圖表大小
    });
  }

  // 更新卡片資料
  async updateCard() {
    if (!this.chart) {
      console.error("Chart has not been initialized. Call init() first.");
      return;
    }

    const gridData = await this.fetchData()
    console.log(gridData)
    const chartData = this.dataProcessing(gridData)
    console.log(chartData)

    this.option.xAxis[0].data = chartData.xAxisData;
    this.option.series = chartData.seriesData;

    // 更新圖表
    this.chart.setOption(this.option);
  
  }

  dataProcessing(gridData){
    const fields = Object.keys(gridData[0]).filter(key => key !== this.category);
    const colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40",
            "#D83F87","#00B3A9","#2E97FF","#EAC435","#6A4C93","#EF6C00",];
  
    let chartData = {
      xAxisData:gridData.map(row => row[this.category]),
      seriesData:fields.map((field, index) => {
        return {
          name: field, // 設定系列名稱
          type: this.type,
          stack: this.stack,
          smooth: true,
          barGap: 0,
          emphasis: {
            focus: "series",
          },
          itemStyle: {
            color: colors[index % colors.length], // 設置顏色
          },
          areaStyle: {
            color: colors[index % colors.length], // 設置區域顏色，可以和 line 顏色一致
            opacity: 0.3, // 調整區域透明度
          },
          data: gridData.map(row => row[field]), // 提取該欄位的數據
        };
      })
    }
  
    return chartData
  }

  // API取得數據
  async fetchData() {
    let getGridURL = window.location.protocol+'//localhost/DCMATE_MEMS_API/api/GetFunctionGrid';
    // let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetFunctionGrid';

    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': this.SID,
        'TokenKey': "WEYU54226552"
        // 可以添加其他必要的请求头信息
    });
  
    let conditions = {
      TABLE_NAME: this.TABLE_NAME,
      VALUE: ["2024-11-01","2024-11-30","day"],
      CON: {
        Field: [],
        Oper: [],
        Value: []
      }
    };

    // 构建请求体
    let requestBody = JSON.stringify(conditions);
  
    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };
  
    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);
  
        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if(data.result){
                return data.Grid_Data;
            }
        } else {
             throw new Error('获取Grid数据失败，状态码：' + response.status);
            
        }
    } catch (error) {
        console.error(error);
    }
  }
}
