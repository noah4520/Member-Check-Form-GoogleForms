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
    outPutKeyText = document.getElementById("IdKeyInput").value;
    // 取得輸出分組順序的key
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

  /*
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
  */

  let carText =
    `${document.getElementById("battalion").value}：

●${startDate} 休假，總人數${data[0].memberCount}人\n\n`;

  let selfText = "";
  let listNum = 1;

  // data[0]對應輸出分組順序1
  data[0]["data"].forEach(data => {
    if (data["place"].slice(0, 2) === "不搭") {
      selfText +=
        `自行出營：${data["id"].length}員

學號如下：${data["id"].sort().join("、")}\n\n`;
      return;
    }
    else {
      carText +=
        `${listNum++}. ${data["place"].slice(0, 2)}： ${data["id"].length}員
            
學號如下：${data["id"].sort().join("、")}\n\n`;
    }
  });

  carText += `●${endDate} 收假，總人數${data[1].memberCount}人\n\n`;
  listNum = 1;

  // data[1]對應輸出分組順序2
  data[1]["data"].forEach(data => {
    if (data["place"].slice(0, 2) === "不搭") {
      selfText +=
        `自行入營：${data["id"].length}員
      
學號如下：${data["id"].sort().join("、")}`;
      return;
    }
    else {
      carText +=
        `${listNum++}. ${data["place"].slice(0, 2)}： ${data["id"].length}員
            
學號如下：${data["id"].sort().join("、")}\n\n`;
    }
  });

  document.getElementById("CarTextarea").value = carText;
  document.getElementById("SelfTextarea").value = selfText;

  document.getElementById("notInList").innerText = notFillOutArray.join("、");
}

/*
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
*/

function outputArrayFunc(data) {

  let campAry = [];
  let tempObj = {};
  // 分別對不同的輸出分組順序進行分組
  for (key in groupByKeyAry) {
    let memberCount = 0;
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

    //計算除了自行出入以外的總人數
    tempObj.forEach(data => {

      if (data["place"].slice(0, 2) === "不搭") {
        return;
      }
      else {
        memberCount += data["id"].length;
      }
    });
    campAry.push({ data: tempObj, memberCount: memberCount });
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