const props = PropertiesService.getScriptProperties().getProperties();

// GMOコイン設定
const GMO_APIKEY = props.GMO_APIKEY;
const GMO_SECRET = props.GMO_SECRET;

const COIN = props.COIN; // 通貨 BTC/ETH
const AMOUNT = parseInt(props.AMOUNT); // 注文額(円)
const DISCOUNT = 0.999; // 指値注文時の価格からの値下げ率

const PUBLIC = "https://api.coin.z.com/public";
const PRIVATE = "https://api.coin.z.com/private";

// メイン処理================================================

function main() {
  myBalance = getBalance();
  // Logger.log(myBalance);
  if (myBalance > AMOUNT) {
    order();
  } else {
    const strBody = `残高不足です\n残高${Number(myBalance).toFixed(0)}円`;
    notifyLine(strBody);
  }
}

// 現在価格取得
function getCurrentPrice() {
  const path = "/v1/ticker?symbol=";
  const url = PUBLIC + path + COIN;
  const method = "GET";
  const data = fetchJSON(url, method, true).data;
  Logger.log(`${COIN}現在価格: ${data[0].last}`);
  return data[0].last;
}

// 注文
function order() {
  // 小数何桁までの数量を注文するか。最小取引数量によって変わる。
  const decimalPlaces = () => {
    if (COIN === "BTC") return 4;
    if (COIN === "ETH") return 2;
    return 4;
  };
  const path = "/v1/order";
  const url = PRIVATE + path;
  const method = "POST";
  const currentPrice = parseFloat(getCurrentPrice());
  const body = {
    symbol: COIN,
    side: "BUY",
    executionType: "LIMIT",
    price: (currentPrice * DISCOUNT).toFixed(0),
    size: (AMOUNT / currentPrice).toFixed(decimalPlaces()),
  };
  const result = fetchJSON(url, method, false, path, body);

  const message = `${COIN}を${AMOUNT}円分注文しました\n価格: ${
    body.price
  }\n数量: ${body.size}\n結果: ${JSON.stringify(result)}`;
  notifyLine(message);
  Logger.log(message);
  Logger.log(result);
}

// 残高取得
function getBalance() {
  const path = "/v1/account/assets";
  const url = PRIVATE + path;
  const nowBalance = fetchJSON(url, "GET", false, path).data;
  Logger.log("日本円残高: ", nowBalance[0].amount);
  return nowBalance[0].amount;
}

// 取引所のWebAPIへアクセス
function fetchJSON(url, method, isPublic, path, _body) {
  const nonce = Date.now().toString(),
    body = JSON.stringify(_body);
  if (isPublic) {
    var options = {
      method: method,
    };
  } else {
    if (method === "POST") {
      var options = {
        method: method,
        payload: body,
        headers: {
          "API-KEY": GMO_APIKEY,
          "API-TIMESTAMP": nonce,
          "API-SIGN": createSignature(nonce, method, path, body),
          "Content-Type": "application/json",
        },
      };
    } else {
      var options = {
        method: method,
        headers: {
          "API-KEY": GMO_APIKEY,
          "API-TIMESTAMP": nonce,
          "API-SIGN": createSignature(nonce, method, path),
          "Content-Type": "application/json",
        },
      };
    }
  }
  return JSON.parse(UrlFetchApp.fetch(url, options));
}

// 取引所のログイン認証用の署名作成
function createSignature(nonce, method, path, body) {
  function tohex(signature) {
    return signature.reduce(function (str, chr) {
      chr = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr.length === 1 ? "0" : "") + chr;
    }, "");
  }
  const text =
    typeof body === "undefined"
      ? nonce + method + path
      : nonce + method + path + body; //pathの結合できないため直書き
  const signature = Utilities.computeHmacSha256Signature(text, GMO_SECRET);
  return tohex(signature);
}
