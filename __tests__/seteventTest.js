import { convertSelectedTextToForm } from '../app/assets/js/setevent';

test("イベントをフォームにセットする", () => {

  document.body.innerHTML =
    '<form>'
    + '<input type="text" class="form-control" id="tit" placeholder="イベントのタイトル">'
    + '<input type="date" class="form-control" id="from-date" required>'
    + '<input type="time" class="form-control" id="from-time">'
    + '<input type="date" class="form-control" id="to-date" required>'
    + '<input type="time" class="form-control" id="to-time">'
    + '<input class="form-check-input" type="checkbox" id="allday">'
    + '<input type="text" class="form-control" id="location" placeholder="イベントの開催場所">'
    + '<textarea class="form-control" rows="3" id="detail"></textarea>'
    + '<textarea class="form-control" rows="3" id="main-text"></textarea>'
    + '<select class="form-control" id="selected-calendar"></select>'
  '</form>';

  convertSelectedTextToForm("2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48");

  expect($("#tit").val()).toEqual("テスト");
  expect($("#main-text").val()).toEqual("2020年9月9日 28:45　テスト\n場所 あいうえお\n2020年9月21日 28:48");
  expect($("#detail").val()).toEqual("");
  expect($("#location").val()).toEqual("あいうえお");

  expect($("#from-date").val()).toEqual("2020-09-10");
  expect($("#from-time").val()).toEqual("04:45");
  expect($("#to-date").val()).toEqual("2020-09-22");
  expect($("#to-time").val()).toEqual("04:48");

});
