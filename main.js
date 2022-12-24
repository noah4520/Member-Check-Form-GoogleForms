// changeJSON
let csvJson = "";
let newCsvJson = "";

// 基隆離營
let goKeelungArray = [];

// 基隆入營
let fromKeelungArray = [];

// 桃園離營
let goTaoyuanArray = [];

// 桃園入營
let fromTaoyuaArray = [];

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

// 未填表單

let notFillOutArray = [];

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
    const file = inputFile.files[0];

    const fileReader = new FileReader();
    fileReader.readAsText(file, "utf-8");

    fileReader.onload = (event) => {
      console.log(event, fileReader);
      document.getElementById('file-name').innerHTML = file.name;
      csvJson = csvJSON(fileReader.result);

      console.log(csvJson);

      newCsvJson = changeIdKey(csvJson);
      console.log(newCsvJson);

      outputJSON(newCsvJson);
    }
  }
}
/* 修改「你的學號?」欄位為「id」*/
function changeIdKey(data) {
  let result;
  for (key in data[0]) {
    if (key.indexOf('學號') !== -1) {
      result = data.map((
        { [key]: ID, ...data }) => (
        { id: ID, ...data }
      ));
      break;
    }
  }
  return result;
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

  notFillOutArray = notInList(data);

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
  document.getElementById("notInList").innerText = notFillOutArray.join("、");
}

function addPlaceArrayFunc(data, placeText, addType) {
  let typeText = "";

  if (addType === 1) {
    typeText = "離營下車的地點";
  }
  if (addType === 2) {
    typeText = "回營上車的地點";
  }

  let tempAry = data.filter(data => data[typeText] === placeText).map(data => data["id"]).sort();
  return tempAry;
}

/* 列出未填表單的學號 */
function notInList(data) {
  const headCount = parseInt(document.getElementById('HeadCountInput').value);
  let allIdArray = [];

  for (let i = 1; i <= headCount; i++) {
    let allIdObj = { "未填表單學號": i.toString().padStart(3, '0') };
    allIdArray.push(allIdObj);
  }
  const select = allIdArray.filter(ids => !data.find(data => ids["未填表單學號"] === data["id"]));
  const result = select.map(data => data["未填表單學號"]);
  return result;
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