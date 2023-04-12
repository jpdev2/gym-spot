// converts Date object to string with format "mm/dd/yyyy"
export const dateToString = (date) => {
  const dcMonth = date.getMonth() + 1;
  const dcDate = date.getDate();
  const dcYear = date.getFullYear();

  const dc = `${dcMonth >= 10 ? dcMonth : `0${dcMonth}`}/${
    dcDate >= 10 ? dcDate : `0${dcDate}`
  }/${dcYear}`;

  return dc;
};
