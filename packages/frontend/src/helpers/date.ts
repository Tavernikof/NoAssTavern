import _isNil from "lodash/isNil";

export type DateLike = number | string | Date | null | undefined;

export const parseDate = (date: DateLike): Date | null => {
  if (_isNil(date)) return null;
  if (!(date instanceof Date)) {
    if (typeof date === "string") {
      // фикс кривой даты для safari "2019-12-06 00:00:00" -> "2019-12-06T00:00:00"
      date = date.replace(" ", "T");
      // Если приходит дата со временем без ТЗ (заканчивается на время), надо добавить ТЗ UTC
      if (date.match(/\d\d:\d\d:\d\d$/)) date = date + ".000Z";
    }
    date = new Date(date);
  }
  if (Number.isNaN(Number(date))) return null;
  return date;
};