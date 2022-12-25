// changeJSON
let csvJson = "";
let dataCSVJson = {};

// 所有人數
let allMemberCount = 0;

// 未填寫表單成員
let notFillOutArray = [];

// 基隆離營
let goKeelungArray = [];

// 基隆入營
let fromKeelungArray = [];

// 桃園離營
let goTaoyuanArray = [];

// 桃園入營
let fromTaoyuanArray = [];

// 苗栗離營
let goMiaoliArray = [];

// 苗栗入營
let fromMiaoliArray = [];

// 台中離營
let goTaichungArray = [];

// 台中入營
let fromTaichungArray = [];

// 自行出營
let goSelfArray = [];

// 自行入營
let fromSelfArray = [];

// 輸出項目(你的學號?)
let outPutKeyText = "";

window.onload = (event) => {
  main();
}

const select = (DOM) => document.querySelector(DOM);

select('#CarTextBtn').addEventListener('click', () => {
  select('#CarTextarea').select();
  document.execCommand("copy");
  alert("複製成功！");
})

select('#SelfTextBtn').addEventListener('click', () => {
  select('#SelfTextarea').select();
  document.execCommand("copy");
  alert("複製成功！");
})

function main() {

  const inputFile = document.querySelector("input[type='file']");

  inputFile.onchange = (event) => {

    // 取得要輸出的key
    outPutKeyText = document.getElementById("NumberKeyInput").value;

    // 取得總人數
    allMemberCount = parseInt(document.getElementById("AllMemberCountInput").value);
    // 建立總人數名單
    notFillOutArray = [];
    for (let i = 1; i <= allMemberCount; i += 1) {
      notFillOutArray.push(i.toString().padStart(3, '0'));
    }

    const file = inputFile.files[0];

    const fileReader = new FileReader();
    fileReader.readAsText(file, "utf-8");
    if (!outPutKeyText) {
      fileReader.abort();
    }
    fileReader.onload = (event) => {
      // console.log(event, fileReader);
      document.getElementById("file-name").innerHTML = file.name;
      csvJson = csvJSON(fileReader.result);

      // 檢查名單是否重複
      dataCSVJson = checkAllMemberInArray(csvJson);
      console.log(dataCSVJson);

      outputJSON(dataCSVJson);
    }
  }
}

// 檢查名單是否重複
function checkAllMemberInArray(tempJson) {

  let repeatAry = [];

  for (key in tempJson) {

    if (notFillOutArray.indexOf(tempJson[key][outPutKeyText]) !== -1) {
      notFillOutArray.splice(notFillOutArray.indexOf(tempJson[key][outPutKeyText]), 1);
    }
    else {
      if (parseInt(tempJson[key][outPutKeyText]) <= allMemberCount) {
        console.log(`重複號碼 : ${tempJson[key][outPutKeyText]}`);
        repeatAry.push(tempJson[key][outPutKeyText]);
      }
    }
  }
  // 刪除重複名單中最早的填寫資料
  for (let i = 0; i <= repeatAry.length; i += 1) {
    for (key in tempJson) {
      if (repeatAry[i] === tempJson[key][outPutKeyText]) {
        tempJson.splice(key, 1);
        break;
      }
    }
  }
  return tempJson;
}

function outputJSON(data) {

  goKeelungArray = addPlaceArrayFunc(data, "基隆 $250", 1);
  fromKeelungArray = addPlaceArrayFunc(data, "基隆 $250", 2);

  goTaoyuanArray = addPlaceArrayFunc(data, "桃園 $200", 1);
  fromTaoyuanArray = addPlaceArrayFunc(data, "桃園 $200", 2);

  goMiaoliArray = addPlaceArrayFunc(data, "苗栗 $200", 1);
  fromMiaoliArray = addPlaceArrayFunc(data, "苗栗 $200", 2);

  goTaichungArray = addPlaceArrayFunc(data, "台中 $250", 1);
  fromTaichungArray = addPlaceArrayFunc(data, "台中 $250", 2);

  goSelfArray = addPlaceArrayFunc(data, "不搭乘離營車，將自行出營", 1);
  fromSelfArray = addPlaceArrayFunc(data, "不搭乘入營車，將自行回營", 2);

  let startDate = document.getElementById("startDate").value.slice(5).replace('-', '/');
  let endDate = document.getElementById("endDate").value.slice(5).replace('-', '/');

  let carText =
    `${document.getElementById("battalion").value}：

●${startDate} 休假，總人數${goKeelungArray.length + goTaoyuanArray.length + goMiaoliArray.length + goTaichungArray.length}人

1.基隆：${goKeelungArray.length}員

  學號如下：${goKeelungArray.join("、")}

2.桃園：${goTaoyuanArray.length}員

  學號如下：${goTaoyuanArray.join("、")}

3.苗栗：${goMiaoliArray.length}員

  學號如下：${goMiaoliArray.join("、")}

4.臺中：${goTaichungArray.length}員 

  學號如下：${goTaichungArray.join("、")}


●${endDate} 收假，總人數${fromKeelungArray.length + fromTaoyuanArray.length + fromMiaoliArray.length + fromTaichungArray.length}人

1.基隆：${fromKeelungArray.length}員

  學號如下：${fromKeelungArray.join("、")}

2.桃園：${fromTaoyuanArray.length}員

  學號如下：${fromTaoyuanArray.join("、")}

3.苗栗：${fromMiaoliArray.length}員

  學號如下：${fromMiaoliArray.join("、")}

4.臺中：${fromTaichungArray.length}員

  學號如下：${fromTaichungArray.join("、")}`


  let selfText = `自行出營：${goSelfArray.length}員

學號如下：${goSelfArray.join("、")}


自行入營：${fromSelfArray.length}員

學號如下：${fromSelfArray.join("、")}
`

  document.getElementById("CarTextarea").value = carText;
  document.getElementById("SelfTextarea").value = selfText;

  document.getElementById("notInList").innerHTML = notFillOutArray.join("、");
}

function addPlaceArrayFunc(data, placeText, addType) {

  let typeText = "";

  if (addType === 1) {
    typeText = "離營下車的地點";
  }
  if (addType === 2) {
    typeText = "回營上車的地點";
  }

  let tempAry = data.filter(data => data[typeText] === placeText).map(data => data[outPutKeyText]).sort();
  return tempAry;
}

function csvJSON(csv) {
  // Split data into lines and separate headers from actual data
  // using Array spread operator
  const [headerLine, ...lines] = csv.split(/\r?\n(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);

  for (let i in lines) {
    lines[i] = JSON.parse(JSON.stringify(lines[i].replace(/\r\n/g, '').replace(/\r/g, '').replace(/\n/g, '')));
  }

  // Use common line separator, which parses each line as the contents of a JSON array
  const parseLine = (line) => JSON.parse(`[${line}]`);

  // Split headers line into an array
  const headers = parseLine(headerLine);

  // Create objects from parsing lines
  // There will be as much objects as lines
  const result = lines
    .map((line, index) =>

      // Split line with JSON
      parseLine(line)

        // Reduce values array into an object like: { [header]: value } 
        .reduce(
          (object, value, index) => ({
            ...object,
            [headers[index]]: value,
          }),
          {}
        )
    );
  return result;
}