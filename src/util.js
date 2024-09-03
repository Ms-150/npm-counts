const dateMap = {
  week: "last-week",
  month: "last-month",
  year: "last-year",
};

export const getDownload = async (packageName, dateKey) => {
  const period = dateMap[dateKey];
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
    console.error("Failed to fetch download data:", error.message);
    throw error;
  }
};
