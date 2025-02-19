const propaties = PropertiesService.getScriptProperties().getProperties();

// LINE通知設定
const LINE_CHANNEL_ACCESS_TOKEN = propaties.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = propaties.LINE_USER_ID;
const URL_LINE = "https://api.line.me/v2/bot/message/push";

// LINE Messaging APIにPOST
function notifyLine(postText) {
  const postData = {
    to: LINE_USER_ID,
    messages: [
      {
        type: "text",
        text: postText,
      },
    ],
  };
  try {
    const params = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + LINE_CHANNEL_ACCESS_TOKEN,
      },
      payload: JSON.stringify(postData),
    };
    UrlFetchApp.fetch(URL_LINE, params);
    //  console.log(res);
  } catch (error) {
    console.log(error);
  }
}
