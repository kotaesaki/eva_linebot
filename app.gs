//LINE Developersで取得したアクセストークンを入れる
var CHANNEL_ACCESS_TOKEN = 'ACCESS_TOKEN'; 

var ss = SpreadsheetApp.openById('SPREAD_SHEET_ID');
var sh = ss.getSheetByName("dictionary");
//ポストで送られてくるので、送られてきたJSONをパース
function doPost(e) {
  if( typeof e === "undefined"){
    return;
  }else{
    var json = JSON.parse(e.postData.contents);
  }
  replyFromSheet(json);
}

function replyFromSheet(data){
  var replyUrl = "https://api.line.me/v2/bot/message/reply";
//シートの最終行を取得する
  var lastRow = sh.getLastRow();
  //シートの全受信語句と返信語句を二次元配列で取得する
  var wordList = sh.getRange(1,1,lastRow,2).getValues();
  //受信したメッセージ情報を変数に格納する
  var reply_token　= data.events[0].replyToken; //reply token
  var text = data.events[0].message.text; //ユーザーが送信した語句
 
  //返信語句を格納するための空配列を宣言する
  var replyTextList = [];
  
  if(text == '用語一覧'){
    var list = sh.getRange(93,3,1,1).getValues();
    console.log(list);
    replyTextList.push(list[0][0]);
  }else{
    //LINEで受信した語句がシートの受信語句と同じ場合、返信語句をreplyTextにpushする
    for(var i = 1; i < wordList.length; i++) {
      if(wordList[i][0].indexOf(text) > -1) {
      　replyTextList.push(wordList[i][1]);
      }
    }
  }
  if(replyTextList.length < 1){
    replyTextList.push('申し訳ございません。\n検索結果が見つかりませんでした。\n登録用語一覧を確認してください。');
  }
  //LINEで受信した語句がシートの受信語句と一致しない場合、関数を終了する
  if(replyTextList.length > 5) {
    var messageLength = 5;
  } else {
    var messageLength = replyTextList.length;
  }
  
  //"messages"に渡す配列を格納するための空配列を宣言する
  //[{"type": "text", "text": "返信語句その1"},{"type": "text", "text": "返信語句その2"}....]
  var messageArray = [];
  
  //replyTextListに格納されている返信語句を最大5つ、messageArrayにpushする
  for(var j = 0; j < messageLength; j++) {
    messageArray.push({"type": "text", "text": replyTextList[j]});
  }
  
  var headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
  };
  
  var postData = {
    "replyToken": reply_token,
    "messages": messageArray
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };
    
  //LINE Messaging APIにデータを送信する
  UrlFetchApp.fetch(replyUrl, options);
}
