//npm install ws

const WebSocket = require('ws')
const wsPORT = process.env.WS_PORT || 6005
const bc = require('./block')

//한개의 컴퓨터에 두개의 포트를 열어놓는 것

// 전역변수 peer
let sockets = []

function getSockets(){
    return sockets
}

const MessageAction = {
    QUERY_LAST:0, // 말그대로 블록의 마지막의 내용을 찾는것
    QUERY_ALL:1, // 내가 가지고 있는 블록의 노드들을 다 처리하는 공간
    RESPONSE_BLOCK:2, //실질적으로 블록을 추가할지말지 결정하는 메서드
}

//reducer 만들겁니다.
function initMessageHandler(ws){
    ws.on("message",data=>{
        const message = JSON.parse(data)
        switch(message.type){
            case MessageAction.QUERY_LAST:
                write(ws,responseLastMsg())
            break;

            case MessageAction.QUERY_ALL:
                write(ws,responseBlockMsg())
            break;
            
            case MessageAction.RESPONSE_BLOCK:
                //요기서 실행함...
                handleBlockResponse(message) //여기서의 message는 객체
            break;
    }})
}
//data형태는 객체형식으로 할것

//socket event javascript -> event ? async await

function queryAllMsg(){
    return {
        type: MessageAction.QUERY_ALL, //전체블록을 보내야하는 이유가? 서버의 블록개수가 맞는지 틀린지를 확인하기 위해서 
        data: null
    }
}

function queryBlockMsg(){
    return {
        type: MessageAction.QUERY_LAST,
        data: null
    }
}

function responseLastMsg(){
    return {
        type: MessageAction.RESPONSE_BLOCK,
        data: JSON.stringify([bc.getLastBlock()]) //마지막 블럭을 어떻게 가져올까요?? block.js파일에서 만들었던 함수 이용!
    }
}

function responseBlockMsg(){
    return {
        type: MessageAction.RESPONSE_BLOCK,
        data: JSON.stringify(bc.getBlocks()) //결과값이 배열이기때문에 배열로 또 감싸줄 필요x
    }
}

function handleBlockResponse(message){
    const receivedBlocks = JSON.parse(message.data); //받은 블록
    const lastBlockReceived = receivedBlocks[receivedBlocks.length -1] //받은 블록의 마지막 블록
    const lastBlockHeld = bc.getLastBlock() // 가지고 있는 블록의 마지막

    //블록 최신화 체크
    if(lastBlockReceived.header.index > lastBlockHeld.header.index) {
        console.log(
            "블록의 갯수 \n" +
            `내가 받은 블록의 index값 ${lastBlockReceived.header.index}\n` +
            `내가 가지고 있는 블럭의 index값 ${lastBlockHeld.header.index}\n`
        )
        // 연결점이 어느정도인가?
        if(bc.createHash(lastBlockHeld) === lastBlockReceived.header.previousHash){
            console.log(`마지막 하나만 비어있는 경우에는 하나만 추가합니다`)
            if(bc.addBlock(lastBlockReceived)) {
                broadcast(responseLastMsg())
            }
        } else if (receivedBlocks.length === 1) {
            console.log(`피어로부터 블록을 연결해야합니다.`)
            broadcast(queryAllMsg())
        } else {
            console.log(`블록 최신화를 진행합니다`)
            //블럭을 최신화하는 코드를 또 작성
            bc.replaceBlock(receivedBlocks)
        }
    } else {
        console.log('블록이 이미 최신화입니다.')
    }
}

//최초의 접속

function initErrorHandler(ws){
    ws.on("close",()=>{closeConnection(ws)})
    ws.on("error",()=>{closeConnection(ws)})
}

function closeConnection(ws){
    console.log(`Connection close ${ws.url}`)
    sockets.splice(sockets.indexOf(ws),1)
}

function wsInit(){
    const server = new WebSocket.Server({port:wsPORT})
    // server 내가 받은 소켓
    server.on("connection",(ws)=>{ 
        console.log(ws)
        init(ws) // 소켓 키값
    })
}

function write(ws,message){
    ws.send(JSON.stringify(message))
}

function broadcast(message){
    sockets.forEach(socket =>{
        write(socket,message)
    })
}

function connectionToPeers(newPeers){ //배열로 들어간다
    // http://localhost:3000 http://localhost:3001
    // http://localhost:3005
    //['http://localhost:30005','http://localhost:3001']

    newPeers.forEach(peer=>{ //주소값 ws://localhost:7001 ,프로토콜 http 아니고 ws
        
        const ws = new WebSocket(peer)
        ws.on("open",()=>{
            init(ws)
        })
        ws.on("error",()=>{
            console.log("connection failed")
        })
    })
}

function init(ws){
    sockets.push(ws)
    initMessageHandler(ws)
    initErrorHandler(ws)
    write(ws,queryBlockMsg())
    //ws.send(JSON.stringfy({type:MessageAction.QUERY_LAST,data:null}))
    //write(ws,{type:M})
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers,
    responseLastMsg
}
