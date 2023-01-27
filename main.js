// changeJSON
let csvJson = "";
let dataCSVJson = {};
let outputCSVJson = {};

// 所有人數
let allMemberCount = 0;

// 未填寫表單成員
let notFillOutArray = [];

// 輸出項目(你的學號?)
let outPutKeyText = "";

// 對輸出項目分組
let groupByKeyAry = [];

window.onload = (event) => {

  new ClipboardJS('#CarTextBtn');
  // new ClipboardJS('#SelfTextBtn');

  new Sortable(document.getElementById("LeaveCampList"), {
    filter: "#ListTitle",
    ghostClass: 'blue-background-class',
    animation: 150,
  });

  new Sortable(document.getElementById("BackCampList"), {
    ghostClass: 'blue-background-class',
    animation: 150,
  });

  main();
}

function main() {

  const inputFile = document.querySelector("input[type='file']");

  inputFile.onchange = (event) => {

    document.getElementById("LeaveCampList").innerText = "";
    document.getElementById("BackCampList").innerText = "";

    // 取得要輸出的key
    outPutKeyText = document.getElementById("IdKeyInput").value;
    // 取得輸出分組順序的key
    groupByKeyAry = [];
    for (let key of document.getElementsByClassName("GroupByKeyInput")) {
      groupByKeyAry.push(key.value);
    }

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

      // 篩選需要輸出的項目與資料分組
      outputCSVJson = outputArrayFunc(dataCSVJson);
      console.log(outputCSVJson);

      outputJSON(outputCSVJson);
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

  let startDate = document.getElementById("startDate").value.slice(5).replace('-', '/');
  let endDate = document.getElementById("endDate").value.slice(5).replace('-', '/');

  let carText =
    `${document.getElementById("battalion").value}：

●${startDate} 休假\n\n`;

  document.getElementById("LeaveListTitle").innerText = carText;

  // data[0]對應出營方式
  data[0].forEach(data => {

    carText =
      `${data["place"]}： ${data["id"].length}員
            
    學號如下：${data["id"].sort().join("、")}\n\n`;
    createDivList(carText, "LeaveCamp");
  });

  carText = `\n●${endDate} 收假\n\n`;
  document.getElementById("BackListTitle").innerText = carText;

  // data[1]對應回營方式
  data[1].forEach(data => {
    carText =
      `${data["place"]}： ${data["id"].length}員
            
    學號如下：${data["id"].sort().join("、")}\n\n`;
    createDivList(carText, "BackCamp");
  });

  document.getElementById("notInList").innerText = notFillOutArray.join("、");
}

//建立新的可拉動 div 區塊
function createDivList(content, addType) {

  let typeText = "";

  switch (addType) {
    case 'LeaveCamp': {
      typeText = "LeaveCampList";
      break;
    }
    case 'BackCamp': {
      typeText = "BackCampList";
      break;
    }
  }

  const li = document.createElement("li");
  li.className = ("list-item");
  li.style = "white-space: pre-wrap;";
  li.append(content);
  document.getElementById(typeText).appendChild(li);
}

function outputArrayFunc(data) {

  let campAry = [];
  let tempObj = {};
  // 分別對不同的輸出分組順序進行分組
  for (key in groupByKeyAry) {

    tempObj = (data.map(data => ({ place: data[groupByKeyAry[key]], id: data[outPutKeyText] }))
      .reduce((groupByPlace, data) => {

        const index = groupByPlace.findIndex(AryItem => AryItem.place === data.place);

        if (index === -1) {
          groupByPlace.push({
            place: data.place,
            id: [data.id],
          });
        }
        else {
          groupByPlace[index].id.push(data.id);
        }
        return groupByPlace;
      }, []));
    campAry.push(tempObj);
  }

  return campAry;
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