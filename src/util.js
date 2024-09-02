// 定义映射表
const dateMap = {
  周: "last-week",
  月: "last-month",
  年: "last-year",
};

export const getDownload = async (packageName, date) => {
  const period = dateMap[date];
  try {
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/${period}/${packageName}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取下载数据失败:", error.message);
    throw error;
  }
};
