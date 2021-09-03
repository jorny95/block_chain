//npm install ws

const WebSocket = require('ws')
const wsPORT = process.env.WS_PORT || 7001

//한개의 컴퓨터에 두개의 포트를 열어놓는 것

// 전역변수 peer
let sockets = []

function getSockets(){
    return sockets
}

//socket event javascript -> event ? async await


//최초의 접속
function wsInit(){
    const server = new WebSocket.Server({port:wsPORT})
    // server 내가 받은 소켓
    server.on("connection",(ws)=>{
        console.log(ws)
        init(ws)
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
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers
}
