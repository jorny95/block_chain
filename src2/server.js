// 내용을 전달해주는것이 주 목적이기에 핵심적인 아이는 ws
// 내가 갖고있는 결과물을 보내주는 아이

/*
    프로토콜(데이터 통신 방법의 종류) => http://  localhost:3000
    http는 요청을 보내면 문서가 만들어진다
    
    문서의 형태
    
    start line
    header
    body

    프로토콜 => ws://    localhost:3001
*/


const { listenerCount } = require('ws');
const WebSocket = require('ws');

// 내 자신을 WS서버로 만들겠다.

let sockets = []
function wsInit() {
    const server = new WebSocket.Server({ port:6005 })
    console.log(1)
    server.on("connection",(ws)=>{
        init(ws)
        //ws.on("message",()=>{})
        //ws.send("text~~")

        // console.log(2)
        // ws.on("message", (message)=>{
        //     console.log(3)
        //     console.log(`received: ${message}`);
        // });

        // ws.send('jihyun'); //내가 보낼 내용을 send 메서드 안에 담음
        // console.log(4)
    })
}

function init(ws){
    sockets.push(ws)
    initMessageHandler(ws)
    initErrorHandler(ws)
} 

function initErrorHandler(ws){
    ws.on("close",()=>CloseConnection(ws))
    ws.on("error",()=>CloseConnection(ws))
}

function CloseConnection(ws){
    console.log(`Connection Close ${ws}`)
    sockets.splice(sockets.indexOf(ws), 1)
}

const MessageAction = {
    QUERY_LAST:0,
    QUERY_ALL:1,
    RESPONSE_BLOCK:2
}

function initMessageHandler(ws){
    ws.on("message", (data)=>{
        const message = JSON.parse(data)
        //{type: 'msg', data: '안녕하세요'}
        switch(message.type){
            case MessageAction.QUERY_LAST:
                console.log(message.data)
                console.log("msg를 출력한다")
            break;
            case MessageAction.QUERY_ALL:
                console.log(message.data)
                console.log("msg를 출력한다")
            break;
            case MessageAction.RESPONSE_BLOCK:
                handleBlockResponse()
            break;
        }
    })
}

function handleBlockResponse(){

}

wsInit()

module.exports = {
    wsInit
}