// 依賴套件: echart、bootstrap(bundle)、xlsx.full，若html中沒有引用就會掛
const offlineMode = false //使用本地資料測試 mockData.json

export class QueryCard {
  constructor({ 
    SID,
    isFuncTable = false,
    TABLE_NAME,
    containerId,
    category,
    fields=[],
    title="Query Card",
    type="line",
    stack=false,
    styles={}
  })
  {
    this.SID = SID;
    this.isFuncTable = isFuncTable
    this.TABLE_NAME = TABLE_NAME;
    this.containerId = containerId; // 容器ID
    this.chart = null;
    this.title = title; // 標題
    this.cardElement = null; // 儲存卡片元素
    this.category = category
    this.fields = fields;
    this.type = type;
    this.stack = stack;
    this.styles = styles; // 卡片樣式
    this.option = {
      grid: {
        top: "48",
        left: "8",
        right: "8",
        bottom: "0",
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
      <div class="card-header py-1">
        <div class="row g-3 align-items-center justify-content-between">
          <div class="col-auto">
            <div class="col-form-label fw-bold">${this.title}</div>
          </div>
          <div class="col-auto d-flex align-items-center gap-2">
            <div>
              <input type="checkbox" class="btn-check" id="${this.containerId}-isStack" autocomplete="off">
              <label class="btn btn-sm border-0 btn-outline-secondary" for="${this.containerId}-isStack"><i class="fa-solid fa-layer-group"></i></label><br>
            </div>
            <div class="btn-group btn-group-sm" role="group" aria-label="Toggle Chart and Table">
              <input 
                type="radio" 
                class="btn-check" 
                name="${this.containerId}-view" 
                id="${this.containerId}-chartRadio" 
                autocomplete="off" 
                checked
              >
              <label class="btn btn-outline-secondary shadow-none" for="${this.containerId}-chartRadio"><i class="fa-solid fa-chart-line"></i></label>

              <input 
                type="radio" 
                class="btn-check" 
                name="${this.containerId}-view" 
                id="${this.containerId}-tableRadio" 
                autocomplete="off"
              >
              <label class="btn btn-outline-secondary shadow-none" for="${this.containerId}-tableRadio"><i class="fa-solid fa-table-list"></i></label>
            </div>

            <button
              id="dropdownId"
              type="button"
              class="btn shadow-none border-0"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              title="更多選項"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownId" style="z-index:9999">
              <button class="dropdown-item" id="${this.containerId}-downloadImage"><i class="fa-solid fa-download text-secondary"></i> download Image</button>
              <button class="dropdown-item" id="${this.containerId}-downloadData"><i class="fa-solid fa-download text-secondary"></i> download Data</button>
            </div>

          </div>
        </div>
      </div>
      <div class="card-body pt-1">
        <div id="${this.containerId}-content" class="h-100">
          <div id="${this.containerId}-chart" class="h-100"></div>
          <div id="${this.containerId}-tableWrapper" class="overflow-auto" style="display: none; height:calc(${this.cardElement.style.height} - 64px)"></div>
        </div>
      </div>
    `;

    
    // 將卡片插入到容器
    container.appendChild(this.cardElement);

    // 切換邏輯
    const chartRadio = this.cardElement.querySelector(`#${this.containerId}-chartRadio`);
    const tableRadio = this.cardElement.querySelector(`#${this.containerId}-tableRadio`);
    const chartElement = this.cardElement.querySelector(`#${this.containerId}-chart`);
    const tableElement = this.cardElement.querySelector(`#${this.containerId}-tableWrapper`);

    chartRadio.addEventListener('change', () => {
      if (chartRadio.checked) {
        chartElement.style.display = '';
        tableElement.style.display = 'none';
      }
    });

    tableRadio.addEventListener('change', () => {
      if (tableRadio.checked) {
        chartElement.style.display = 'none';
        tableElement.style.display = '';
      }
    });

    // 下載按鈕
    const downloadImage = this.cardElement.querySelector(`#${this.containerId}-downloadImage`);
    const downloadData = this.cardElement.querySelector(`#${this.containerId}-downloadData`);
    downloadImage.addEventListener('click', () => this.downloadImage());
    downloadData.addEventListener('click', () => this.downloadXlsx());

    // 切換堆疊按鈕
    const isStack = this.cardElement.querySelector(`#${this.containerId}-isStack`);
    isStack.addEventListener('click', () => {
      if(isStack.checked){
        this.option.series.forEach((dataSet)=>{
          dataSet.stack = "stacked"
          dataSet.areaStyle.opacity = 0.3
        })
        this.chart.setOption(this.option);
      }else{
        this.option.series.forEach((dataSet)=>{
          dataSet.stack = null
          dataSet.areaStyle.opacity = 0.1
        })
        this.chart.setOption(this.option);
      }
    });

    // 初始化echart
    const chartWrapper = document.getElementById(`${this.containerId}-chart`)
    this.chart = echarts.init(chartWrapper);

    // 取得第一次資料
    this.update()

    // 響應式RWD
    window.addEventListener('resize', () => {
      if (window.innerWidth < 992) {
        this.option.grid.top = '0';
        this.option.grid.bottom = '48';
        this.option.legend.top = "bottom"
      } else {
        this.option.grid.top = '48';
        this.option.grid.bottom = '0';
        this.option.legend.top = "top"
      }
      this.chart.setOption(this.option); // 設定圖表選項
      this.chart.resize(); // 調整圖表大小
    });
  }

  // 更新卡片資料
  async update() {
    if (!this.chart) {
      console.error("Chart has not been initialized. Call init() first.");
      return;
    }
    // 1. 顯示loading畫面
    this.chart.showLoading()

    // 2. call API 取得資料
    let gridData = []
    if (this.isFuncTable){
      gridData = await this.getFuncGrid()
    } else {
      gridData = await this.getGrid()
    }

    // 3. 更新表格
    this.setTable(gridData)

    // 4. 處理成echart格式
    const chartData = this.dataProcessing(gridData)

    // 5. 更新圖表
    this.option.xAxis[0].data = chartData.xAxisData;
    this.option.series = chartData.seriesData;
    this.chart.setOption(this.option);

    // 6. 關閉loading畫面
    this.chart.hideLoading()
  }

  setTable(gridData) {
    const tableWrapper = document.getElementById(`${this.containerId}-tableWrapper`);
    tableWrapper.innerHTML = ''; // 清空容器內容
    
    // 動態生成表格標題
    const columns = Object.keys(gridData[0]); //取得所有欄位名
    const table = `
      <table id="${this.containerId}-table" class="table table-sm mb-0">
        <thead class="sticky-top">
          <tr>
            ${columns.map((column) => `<th>${column}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${gridData.map((row) => `
            <tr>
              ${columns.map((column)=>`<td>${row[column]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    tableWrapper.innerHTML = table;
  }

  dataProcessing(gridData){
    // const fields = Object.keys(gridData[0]).filter(key => key !== this.category);
    const colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40",
            "#D83F87","#00B3A9","#2E97FF","#EAC435","#6A4C93","#EF6C00",];
  
    let chartData = {
      xAxisData:gridData.map(row => row[this.category]),
      seriesData:this.fields.map((field, index) => {
        return {
          name: field, // 設定系列名稱
          type: this.type,
          stack: this.stack ? "stacked" : null,
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
            opacity: this.stack ? 0.3 : 0.1, // 調整區域透明度
          },
          data: gridData.map(row => row[field]), // 提取該欄位的數據
        };
      })
    }
  
    return chartData
  }

  // API取得數據
  // 1. 一般查詢 (GetGrid)
  async getGrid() {
    if (offlineMode){
      let mockData = await fetch("./mockData.json")
        .then((response)=>{
          return response.json()
        })
        .then((data)=>{
          return data
        })
      return mockData
    }

    let getGridURL = window.location.protocol+'//localhost/DCMATE_MEMS_API/api/GetGrid';
    // let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetFunctionGrid';

    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': this.SID,
        'TokenKey': "WEYU54226552"
        // 可以添加其他必要的请求头信息
    });
  
    let conditions = {
      // "Field": [],
      // "Oper": [],
      // "Value": []
    }

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
  // 2. function查詢 (GetFunctionGrid)
  async getFuncGrid() {
    if (offlineMode){
      let mockData = await fetch("./mockData.json")
        .then((response)=>{
          return response.json()
        })
        .then((data)=>{
          return data
        })
      return mockData
    }

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

  // 匯出資料
  downloadImage() {
    const url = this.chart.getDataURL({
      type: 'png', // 圖片格式
      pixelRatio: 2, // 圖片解析度
      backgroundColor: '#fff', // 背景顏色
    });
  
    // 創建一個隱藏的 a 標籤
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    link.download = `${this.title}_chart_${formattedDate}.png`; // 圖片名稱
    link.click();
  }
  downloadXlsx() {
    // 取得表格元素
    const table = document.getElementById(`${this.containerId}-table`);
    
    // 將表格轉換為工作簿物件
    const wb = XLSX.utils.table_to_book(table, { raw: true });
  
    // 遍歷所有的工作表並設定數字格式
    Object.keys(wb.Sheets).forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      Object.keys(ws).forEach(cellAddress => {
      if (ws[cellAddress].t === 's' && !isNaN(ws[cellAddress].v)) {
        // 如果儲存格是字串類型且內容是數字，轉為數字格式
        ws[cellAddress].t = 'n';
        ws[cellAddress].v = parseFloat(ws[cellAddress].v);
      }
      });
    });
  
    // 將工作簿保存為檔案
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    XLSX.writeFile(wb, `${this.title}_data_${formattedDate}.xlsx`);
  }
}