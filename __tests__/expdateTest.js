import { expDate } from "../app/assets/js/expdate";

test("ユーザ設定正規表現テスト_詳細スイッチ無効", () => {

  localStorage.setItem("exp_str", "(\\d+).+?(\\d{1,2}).+?(\\d{1,2}).+?(\\d{1,2}):(\\d{1,2}) (.+) 場所:(.+)");
  localStorage.setItem("start_year", 1);
  localStorage.setItem("start_mon", 2);
  localStorage.setItem("start_day", 3);
  localStorage.setItem("start_hour", 4);
  localStorage.setItem("start_min", 5);
  localStorage.setItem("end_year", 1);
  localStorage.setItem("end_mon", 2);
  localStorage.setItem("end_day", 3);
  localStorage.setItem("end_hour", 4);
  localStorage.setItem("end_min", 5);
  localStorage.setItem("detail", 6);
  localStorage.setItem("title", 6);
  localStorage.setItem("location", 7);

  expect(expDate("2019年4月12日 12:44 映画公開日 場所:東宝系映画館")).toStrictEqual(
    {
      "start": {
        "year": "2019",
        "month": 3,
        "day": "12",
        "hour": "12",
        "min": "44",
      },
      "end": {
        "year": "2019",
        "month": 3,
        "day": "12",
        "hour": "12",
        "min": "44",
      },
      "title": "映画公開日",
      "location": "東宝系映画館",
      "detail": "映画公開日",
      "selected_text": "2019年4月12日 12:44 映画公開日 場所:東宝系映画館",
    }
  )

});

test("ユーザ設定正規表現テスト_詳細スイッチ有効", () => {

  localStorage.setItem("exp_str", "(\\d+).+?(\\d{1,2}).+?(\\d{1,2}).+?(\\d{1,2}):(\\d{1,2}) (.+) 場所:(.+)");
  localStorage.setItem("start_year", 1);
  localStorage.setItem("start_mon", 2);
  localStorage.setItem("start_day", 3);
  localStorage.setItem("start_hour", 4);
  localStorage.setItem("start_min", 5);
  localStorage.setItem("end_year", 1);
  localStorage.setItem("end_mon", 2);
  localStorage.setItem("end_day", 3);
  localStorage.setItem("end_hour", 4);
  localStorage.setItem("end_min", 5);
  localStorage.setItem("detail", 6);
  localStorage.setItem("title", 6);
  localStorage.setItem("location", 7);
  localStorage.setItem("detailSwitch", true);

  expect(expDate("2019年4月12日 12:44 映画公開日 場所:東宝系映画館")).toStrictEqual(
    {
      "start": {
        "year": "2019",
        "month": 3,
        "day": "12",
        "hour": "12",
        "min": "44",
      },
      "end": {
        "year": "2019",
        "month": 3,
        "day": "12",
        "hour": "12",
        "min": "44",
      },
      "title": "映画公開",
      "location": "東宝系映画館",
      "detail": "映画公開日",
      "selected_text": "2019年4月12日 12:44 映画公開日 場所:東宝系映画館",
    }
  )

});
