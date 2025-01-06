import { QueryCard } from "./QueryCard.js";

const card1 = new QueryCard({
  containerId: "cardWrapper1",
  styles: { height: "300px" }
});
card1.init()

const chartData = await fetch("./mockData.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // 将响应解析为 JSON
    })
    .then((data) => {
      return data
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });


card1.setData(chartData)