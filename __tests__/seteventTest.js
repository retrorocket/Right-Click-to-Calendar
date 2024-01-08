document.body.innerHTML =
  "<form>" +
  '<legend>イベント設定 <a class="btn btn-secondary btn-sm" id="create-cal" href="#">カレンダーを表示</a></legend>' +
  '<input type="text" class="form-control" id="tit" placeholder="イベントのタイトル">' +
  '<input type="date" class="form-control" id="from-date" required>' +
  '<input type="time" class="form-control" id="from-time">' +
  '<input type="date" class="form-control" id="to-date" required>' +
  '<input type="time" class="form-control" id="to-time">' +
  '<input class="form-check-input" type="checkbox" id="allday">' +
  '<input type="text" class="form-control" id="location" placeholder="イベントの開催場所">' +
  '<textarea class="form-control" rows="3" id="detail"></textarea>' +
  '<textarea class="form-control" rows="3" id="main-text"></textarea>' +
  '<select class="form-control" id="selected-calendar"></select>' +
  '<input class="form-check-input" type="checkbox" id="to-timezone">' +
  '<select class="form-control" id="timezone-list"></select>' +
  '<button type="button" class="btn btn-primary" id="sub">Submit</button>';
("</form>");

const setevent = require("../app/assets/js/setevent");

test("イベントをフォームにセットする_詳細スイッチ無効", () => {
  setevent.convertSelectedTextToForm(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );

  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("detail").value).toEqual("");
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual("2020-09-10");
  expect(document.getElementById("from-time").value).toEqual("04:45");
  expect(document.getElementById("to-date").value).toEqual("2020-09-22");
  expect(document.getElementById("to-time").value).toEqual("04:48");
});

test("イベントをフォームにセットする_詳細スイッチ有効", () => {
  localStorage.setItem("detailSwitch", true);
  setevent.convertSelectedTextToForm(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );

  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("detail").value).toEqual(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual("2020-09-10");
  expect(document.getElementById("from-time").value).toEqual("04:45");
  expect(document.getElementById("to-date").value).toEqual("2020-09-22");
  expect(document.getElementById("to-time").value).toEqual("04:48");
});

test("イベントをフォームにセットする_開始日が異常", () => {
  localStorage.removeItem("detailSwitch");
  const now = luxon.DateTime.now();
  setevent.convertSelectedTextToForm(
    "2020年0月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年0月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("detail").value).toEqual("");
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual(
    now.toFormat("yyyy-MM-dd")
  );
  expect(document.getElementById("from-time").value).toEqual("04:45");
  expect(document.getElementById("to-date").value).toEqual("2020-09-22");
  expect(document.getElementById("to-time").value).toEqual("04:48");
});

test("イベントをフォームにセットする_開始時が異常", () => {
  localStorage.removeItem("detailSwitch");
  const now = luxon.DateTime.now();
  setevent.convertSelectedTextToForm(
    "2020年9月9日 28:95　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年9月9日 28:95　テスト\n場所 あいうえお\n2020年9月21日 28:48"
  );
  expect(document.getElementById("detail").value).toEqual("");
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual("2020-09-10");
  expect(document.getElementById("from-time").value).toEqual(
    now.toFormat("HH:mm")
  );
  expect(document.getElementById("to-date").value).toEqual("2020-09-22");
  expect(document.getElementById("to-time").value).toEqual("04:48");
});

test("イベントをフォームにセットする_終了日が異常", () => {
  localStorage.removeItem("detailSwitch");
  const now = luxon.DateTime.now();
  setevent.convertSelectedTextToForm(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年0月21日 28:48"
  );
  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年0月21日 28:48"
  );
  expect(document.getElementById("detail").value).toEqual("");
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual("2020-09-10");
  expect(document.getElementById("from-time").value).toEqual("04:45");
  expect(document.getElementById("to-date").value).toEqual(
    now.toFormat("yyyy-MM-dd")
  );
  expect(document.getElementById("to-time").value).toEqual("04:48");
});

test("イベントをフォームにセットする_終了時が異常", () => {
  localStorage.removeItem("detailSwitch");
  const now = luxon.DateTime.now();
  setevent.convertSelectedTextToForm(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:98"
  );
  expect(document.getElementById("tit").value).toEqual("テスト");
  expect(document.getElementById("main-text").value).toEqual(
    "2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:98"
  );
  expect(document.getElementById("detail").value).toEqual("");
  expect(document.getElementById("location").value).toEqual("あいうえお");

  expect(document.getElementById("from-date").value).toEqual("2020-09-10");
  expect(document.getElementById("from-time").value).toEqual("04:45");
  expect(document.getElementById("to-date").value).toEqual("2020-09-22");
  expect(document.getElementById("to-time").value).toEqual(
    now.toFormat("HH:mm")
  );
});
