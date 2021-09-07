const WebSocket = require('ws');

const ws = new WebSocket("ws://localhost:6005")

ws.on("open", ()=>{
    write(ws,queryBlockMsg())
    write(ws,queryAllMsg())
})

const MessageAction = {
    QUERY_LAST:0,
    QUERY_ALL:1,
    RESPONSE_BLOCK:2
}

function queryBlockMsg(){
    return {
        type:MessageAction.QUERY_LAST,
        data:null
    }
}

function queryAllMsg(){
    return {
        type:MessageAction.QUERY_ALL,
        data:null
    }
}

function write(ws,message){
    ws.send(JSON.stringify(message))
}

ws.on("message",(message)=>{
    console.log(`received: ${message}`)
})