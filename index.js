import { QueryCard } from "./QueryCard.js";

document.addEventListener("DOMContentLoaded", () => {
  // type1. 一般查詢
  window.card1 = new QueryCard({
    title: "Query Card 1",
    SID: "352547489510325",
    containerId: "cardWrapper1",
    category: "CHECK_IN_TIME",
    seriesFields: ["NG_CODE_QTY"],
    styles: { height: "500px"}
  });
  // card1.init()

  // type2. Function Table查詢
  window.card2 = new QueryCard({
    title: "Query Card 2",
    SID: "366647515707003", //智能查詢SID，必須用資料表函式
    isFuncTable: true,
    TABLE_NAME: "GET_GAS_CHART_DATA", //資料表函式的名稱
    containerId: "cardWrapper2",
    category: "REPORT_TIME", //x軸欄位
    seriesFields: ["RK10","RK4","RK5","RK6","RK7","RK9","SP1000","SP1001","SP150","SP500","SP503"], //y軸欄位
    styles: { height: "400px"} //卡片最外層元素的樣式，必須定義高度不然會掛
  });

  card2.init()
});