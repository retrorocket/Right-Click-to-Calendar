import { expDefault } from '../app/assets/js/expdefault';

test("デフォルト正規表現テスト_詳細スイッチ無効", () => {
  expect(expDefault("2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48")).toStrictEqual(
    {
      "detail": "",
      "start": {
        "tf": true,
        "year": 2020,
        "month": 8,
        "day": "9",
        "hour": 4,
        "min": "45",
      },
      "end": {
        "tf": true,
        "year": 2020,
        "month": 8,
        "day": "21",
        "hour": 4,
        "min": "48",
      },
      "title": "テスト",
      "location": "あいうえお",
      "selected_text": "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48",
    }
  )
});

test("デフォルト正規表現テスト_詳細スイッチ有効", () => {
  localStorage.setItem("detailSwitch", true);
  expect(expDefault("2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48")).toStrictEqual(
    {
      "detail": "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48",
      "start": {
        "tf": true,
        "year": 2020,
        "month": 8,
        "day": "9",
        "hour": 4,
        "min": "45",
      },
      "end": {
        "tf": true,
        "year": 2020,
        "month": 8,
        "day": "21",
        "hour": 4,
        "min": "48",
      },
      "title": "テスト",
      "location": "あいうえお",
      "selected_text": "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48",
    }
  )
});
