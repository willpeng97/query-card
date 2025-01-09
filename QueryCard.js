// 依賴套件: echart、bootstrap(bundle)、tabulator、fontawesome，若html中沒有引用就會掛
const offlineMode = true //使用本地資料測試 mockData.json
const default_ip = window.default_ip || "localhost";
const default_Api_Name = window.default_Api_Name || "DCMATE_MEMS_API"

export class QueryCard {
  constructor({
    SID,
    isFuncTable = false,
    TABLE_NAME,
    containerId,
    category,
    seriesFields=[],
    title="Query Card",
    tableOnly=false,
    type="line",
    stack=false,
    timeUnit="day",
    queryDate=new Date().toISOString().split('T')[0],
    queryMonth=new Date().toISOString().split('T')[0].slice(0,7),
    styles={}
  })
  {
    this.SID = SID;
    this.isFuncTable = isFuncTable
    this.TABLE_NAME = TABLE_NAME;
    this.containerId = containerId; // 容器ID
    this.chart = null;
    this.table = null;
    this.title = title; // 標題
    this.category = category
    this.seriesFields = seriesFields;
    this.tableOnly = tableOnly;
    this.type = type.toLowerCase();
    this.stack = stack;
    this.timeUnit = timeUnit.toLowerCase()
    this.queryDate = queryDate
    this.queryMonth = queryMonth
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
          boundaryGap: type === "line" ? false : true,
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

    // 創建卡片結構
    let cardElement = document.createElement('div');
    cardElement.className = 'query-card card shadow-sm';
    Object.assign(cardElement.style, this.styles);

    cardElement.innerHTML = `
      <div class="card-header py-1">
        <div class="row align-items-center justify-content-between">
          <div class="col-3 col-md-auto px-1">
            <div class="col-form-label fw-bold text-truncate" title="${this.title}">${this.title}</div>
          </div>
          <div class="col-auto d-flex align-items-center justify-content-end gap-2 px-1">
            <div>
              <select id="${this.containerId}-timeUnitInput" class="form-select form-select-sm">
                <option value="day" ${this.timeUnit === "day" ? "selected" : ""}>日</option>
                <option value="month" ${this.timeUnit === "month" ? "selected" : ""}>月</option>
              </select>
            </div>
            <div style="display: ${this.timeUnit === "day" ? "" : "none"}">
              <input type="date" id="${this.containerId}-queryDateInput" value="${this.queryDate}" class="form-control form-control-sm">
            </div>
            <div style="display: ${this.timeUnit === "month" ? "" : "none"}">
              <input type="month" id="${this.containerId}-queryMonthInput" value="${this.queryMonth}" class="form-control form-control-sm">
            </div>
            <div style="display:${this.seriesFields.length <= 1|this.tableOnly ? "none" : ""}">
              <input type="checkbox" class="btn-check" id="${this.containerId}-isStack" autocomplete="off" ${this.stack ? "checked" : ""}>
              <label class="btn btn-sm border-0 btn-outline-secondary" for="${this.containerId}-isStack"><i class="fa-solid fa-layer-group"></i></label><br>
            </div>
            <div class="btn-group btn-group-sm" role="group" aria-label="Toggle Chart and Table" style="display:${this.tableOnly ? "none" : ""}">
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
              <li style="display: ${this.tableOnly ? "none" : ""}"><h6 class="dropdown-header py-0 ps-2">chart type</h6></li>
              <li style="display: ${this.tableOnly ? "none" : ""}">
                <div class="btn-group ms-2 mt-2" role="group">
                  <button type="button" class="btn btn-outline-primary btn-sm" id="${this.containerId}-lineChartBtn">Line</button>
                  <button type="button" class="btn btn-outline-primary btn-sm" id="${this.containerId}-barChartBtn">Bar</button>
                </div>
              </li>
              <li style="display: ${this.tableOnly ? "none" : ""}"><hr class="dropdown-divider"></li>
              <li>
                <div class="form-check form-switch ms-2">
                  <input class="form-check-input" type="checkbox" id="${this.containerId}-isAutoUpdate" name="darkmode" value="yes">
                  <label class="form-check-label" for="${this.containerId}-isAutoUpdate">auto update</label>
                </div>
                <div class="ms-2 mt-2 d-flex align-items-center" id="updateIntervalContainer" style="display: none;">
                  <label for="updateInterval" class="form-label me-2 mb-0" style="font-size: 0.9rem;">Interval (sec):</label>
                  <input type="number" id="${this.containerId}-updateInterval" class="form-control form-control-sm shadow-none" style="width: 60px;" min="1" value="30">
                </div>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li style="display: ${this.tableOnly ? "none" : ""}"><button class="dropdown-item" id="${this.containerId}-downloadImage"><i class="fa-solid fa-download text-secondary"></i> download Image</button></li>
              <li><button class="dropdown-item" id="${this.containerId}-downloadData"><i class="fa-solid fa-download text-secondary"></i> download Data</button></li>
            </div>

          </div>
        </div>
      </div>
      <div class="card-body pt-1">
        <div id="${this.containerId}-content" class="h-100">
          <div id="${this.containerId}-chart" class="h-100" style="display: ${this.tableOnly ? "none" : ""}"></div>
          <div id="${this.containerId}-tableWrapper" style="display: ${this.tableOnly ? "" : "none"}; height:calc(${cardElement.style.height} - 64px)"></div>
        </div>
      </div>
    `;

    
    // 將卡片插入到容器
    container.appendChild(cardElement);

    // 切換時間
    const timeUnitInput = cardElement.querySelector(`#${this.containerId}-timeUnitInput`);
    const queryDateInput = cardElement.querySelector(`#${this.containerId}-queryDateInput`);
    const queryMonthInput = cardElement.querySelector(`#${this.containerId}-queryMonthInput`);
    timeUnitInput.addEventListener('change', () => {
      this.timeUnit = timeUnitInput.value
      switch(this.timeUnit){
        case "day":
          queryDateInput.parentElement.style.display = '';
          queryMonthInput.parentElement.style.display = 'none';
          break;
        case "month":
          queryMonthInput.parentElement.style.display = '';
          queryDateInput.parentElement.style.display = 'none';
          break;
      }
      this.update()
    });
    queryDateInput.addEventListener('change', () => {
      this.queryDate = queryDateInput.value
      this.update()
    });
    queryMonthInput.addEventListener('change', () => {
      this.queryMonth = queryMonthInput.value
      this.update()
    });

    // 切換圖or表
    const chartRadio = cardElement.querySelector(`#${this.containerId}-chartRadio`);
    const tableRadio = cardElement.querySelector(`#${this.containerId}-tableRadio`);
    const chartElement = cardElement.querySelector(`#${this.containerId}-chart`);
    const tableElement = cardElement.querySelector(`#${this.containerId}-tableWrapper`);

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
    const downloadImage = cardElement.querySelector(`#${this.containerId}-downloadImage`);
    const downloadData = cardElement.querySelector(`#${this.containerId}-downloadData`);
    downloadImage.addEventListener('click', () => this.downloadImage());
    downloadData.addEventListener('click', () => this.downloadXlsx());

    // 切換堆疊按鈕
    const isStack = cardElement.querySelector(`#${this.containerId}-isStack`);
    isStack.addEventListener('click', () => {
      if(isStack.checked){
        this.option.series.forEach((dataSet)=>{
          dataSet.stack = "stacked"
          dataSet.areaStyle.opacity = 0.3
        })
        this.chart.setOption(this.option);
        this.stack = true
      }else{
        this.option.series.forEach((dataSet)=>{
          dataSet.stack = null
          dataSet.areaStyle.opacity = 0.1
        })
        this.chart.setOption(this.option);
        this.stack = false
      }
    });


    // 切換圖表類型
    const barChartBtn = cardElement.querySelector(`#${this.containerId}-barChartBtn`);
    const lineChartBtn = cardElement.querySelector(`#${this.containerId}-lineChartBtn`);
    barChartBtn.addEventListener('click', () => {
      this.option.series.forEach((dataSet)=>{
        dataSet.type = "bar"
      })
      this.option.xAxis[0].boundaryGap = true
      this.chart.setOption(this.option);
      this.type = "bar" //保存物件屬性
    });
    lineChartBtn.addEventListener('click', () => {
      this.option.series.forEach((dataSet)=>{
        dataSet.type = "line"
      })
      this.option.xAxis[0].boundaryGap = false
      this.chart.setOption(this.option);
      this.type = "line" //保存物件屬性
    });

    // 切換自動更新
    const isAutoUpdate = cardElement.querySelector(`#${this.containerId}-isAutoUpdate`);
    const updateInterval = cardElement.querySelector(`#${this.containerId}-updateInterval`);
    let autoUpdateInterval = null
    isAutoUpdate.addEventListener('change', () => {
      if (isAutoUpdate.checked) {
        autoUpdateInterval = setInterval(()=>{
          this.update()
        },updateInterval.value * 1000)
      } else {
        clearTimeout(autoUpdateInterval)
      }
    });
    updateInterval.addEventListener('change', () => {
      if (isAutoUpdate.checked) {
        clearTimeout(autoUpdateInterval)
        autoUpdateInterval = setInterval(()=>{
          this.update()
        },updateInterval.value * 1000)
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
        this.option.grid.top = '8';
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
    window.dispatchEvent(new Event('resize')); //手動觸發一次
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

    if(!this.tableOnly){
      // 4. 處理成echart格式
      const chartData = this.dataProcessing(gridData)
  
      // 5. 更新圖表
      this.option.xAxis[0].data = chartData.xAxisData;
      this.option.series = chartData.seriesData;
      this.chart.setOption(this.option);
    }

    // 6. 關閉loading畫面
    this.chart.hideLoading()
  }

  setTable(gridData) {
    this.table = new Tabulator(`#${this.containerId}-tableWrapper`, {
      data:gridData, //assign data to table
      layout:"fitDataStretch", //fit columns to width of table (optional)
      autoColumns: true, // 自动生成列
    });
  }

  dataProcessing(gridData){
    // const seriesFields = Object.keys(gridData[0]).filter(key => key !== this.category);
    const colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40",
            "#D83F87","#00B3A9","#2E97FF","#EAC435","#6A4C93","#EF6C00",];
  
    let chartData = {
      xAxisData:gridData.map(row => row[this.category]),
      seriesData:this.seriesFields.map((field, index) => {
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

    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': this.SID,
        'TokenKey': "WEYU54226552"
        // 可以添加其他必要的请求头信息
    });
  
    let conditions;
    switch(this.timeUnit){
      case "day":
        conditions = {
          "Field": [this.category],
          "Oper": ["BETWEEN"],
          "Value": [`${this.queryDate} 00:00:00' AND '${this.queryDate} 23:59:59`]
        }
        break;
      case "month":
        // 取得這個月的第一天
        const firstDayThisMonth = new Date(`${this.queryMonth}-01`); // "2024-01-01"
        // 取得下個月的第一天
        const firstDayNextMonth = new Date(firstDayThisMonth.getFullYear(), firstDayThisMonth.getMonth() + 1, 1); // "2024-02-01"
        conditions = {
          "Field": [this.category],
          "Oper": ["BETWEEN"],
          "Value": [`${firstDayThisMonth.toLocaleString('en-ca').split(',')[0]}' AND '${firstDayNextMonth.toLocaleString('en-ca').split(',')[0]}`]
        }
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

    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetFunctionGrid';

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
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    this.table.download("xlsx", `${this.title}_data_${formattedDate}.xlsx`, {sheetName:"sheet1",compress:false}); //download a xlsx file using SheetJS properties
  }
}