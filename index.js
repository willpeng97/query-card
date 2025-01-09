import { QueryCard } from "./QueryCard.js";

document.addEventListener("DOMContentLoaded", () => {
  // type1. 一般查詢
  window.card1 = new QueryCard({
    title: "QueryCard 1",
    SID: "352547489510325", //智能查詢SID
    containerId: "cardWrapper1", //外部容器id
    category: "CHECK_IN_TIME", //x軸欄位
    seriesFields: ["NG_CODE_QTY"], //y軸欄位,可多個
    styles: { height: "500px"}, //卡片最外層元素的樣式，必須定義高度不然會掛
    timeUnit: "day", // 時間單位 "day" or "month"
    queryDate: "2024-10-09", // 查詢日期，預設為當日
    // tableOnly: true, // 是否只顯示table
  });

  // type2. Function Table查詢
  window.card2 = new QueryCard({
    containerId: "cardWrapper2", 
    title: "QueryCard 2",
    SID: "366647515707003",
    isFuncTable: true, //是否為資料表函式
    TABLE_NAME: "GET_GAS_CHART_DATA", //資料表函式的名稱(若isFuncTable則必須填)
    category: "REPORT_TIME",
    seriesFields: ["RK10","RK4","RK5","RK6","RK7","RK9","SP1000","SP1001","SP150","SP500","SP503"],
    styles: { height: "400px"},
    type: "bar", // "line" or "bar"
    stack: true, // 預設是否為堆疊
    timeUnit: "month",
    queryMonth: "2024-11",
  });
});