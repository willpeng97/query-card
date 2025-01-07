import { QueryCard } from "./QueryCard.js";

document.addEventListener("DOMContentLoaded", () => {
  // 建立物件
  window.card1 = new QueryCard({
    title: "Query Card 1",
    SID: "366647515707003", //智能查詢SID，必須用資料表函式
    TABLE_NAME: "GET_GAS_CHART_DATA", //資料表函式的名稱
    containerId: "cardWrapper1",
    category: "REPORT_TIME", //x軸欄位
    styles: { height: "400px"} //卡片最外層元素的樣式，必須定義高度不然會掛
  });

  // 初始化實例
  card1.init()



  // 建立更多...
  window.card2 = new QueryCard({
    title: "Query Card 2",
    SID: "366647515707003",
    TABLE_NAME: "GET_GAS_CHART_DATA",
    containerId: "cardWrapper2",
    category: "REPORT_TIME",
    styles: { height: "400px"}
  });
  card2.init()
});