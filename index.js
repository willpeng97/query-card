import { QueryCard } from "./QueryCard.js";

document.addEventListener("DOMContentLoaded", () => {
  const card1 = new QueryCard({
    SID: "366647515707003", //智能查詢SID，必須用資料表函式
    TABLE_NAME: "GET_GAS_CHART_DATA", //資料表函式的名稱
    containerId: "cardWrapper1",
    category: "REPORT_TIME", //x軸欄位
    styles: { height: "400px"} //卡片最外層元素的樣式，必須定義高度不然會掛，預設為100%
  });
  card1.init()
});