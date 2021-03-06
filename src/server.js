const express = require('express')
const bc = require('./block')
const ws = require('./network')
const wl = require('./wallet')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.get("/blocks",(req,res)=>{
    res.send(bc.getBlocks())
})

app.get("/version",(req,res)=>{
    res.send(bc.getVersion())
})

// Blocks 배열에 {} 추가하는게 목적
// curl => 앞으로 http통신을 할것이다
// -X [request method]: -X GET, -X POST, -X PUT
// JSON형태로 데이터를 넘겨주는게 베스트
// -H "Content-Type:application/json"
// -d : data의 약자, body내용 , -d "{\"data\":[\"Hello world!\"]}"
// curl -X POST -H "Content-Type:application/json" -d "{\"data\":[\"Hello world\"]}" http://localhost:3000/mineBlock 
app.post("/mineBlock",(req,res)=>{
    const data = req.body.data
    const result = bc.mineBlock(data)
    if(result == false ) {
        res.send(`mineBlock failed`)
        res.status(400).send('블럭추가에 오류가 발생되었습니다')
    } else {
        res.send(result)
    }
})

//express 클라이언트 
//websocket 서버

// peers -> 현재 가지고 있는 소켓리스트 getSockets GET
// curl http://localhost:3000/peers
app.get("/peers",(req,res)=>{
    res.send(ws.getSockets().map( socket => {
        return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
    }))
})
// addPeers -> 내가 보낼 주소값에 소켓을 생성하는 작업 connectionToPeers POST
//[]
// curl -X POST -H "Content-Type:application/json" -d "{\"peers\":[\"ws://192.168.0.43:6005\"]}" http://localhost:3000/addPeers
//192.168.0.43:6005
app.post("/addPeers",(req,res)=>{
    const peers = req.body.peers
    ws.connectionToPeers(peers)
    res.send('success')
})

//curl http://localhost:3000/stop
app.get("/stop",(req,res)=>{
    res.send("server stop")
    process.exit(0)
})
// curl http://localhost:3000/address
app.get(`/address`,(req,res)=>{
    const address = wl.getPublicFromWallet()
    res.send({address})
})

wl.initWallet()

ws.wsInit()
app.listen(port, ()=>{
    console.log(`server start port ${port}`)
})

/*

블록 가져오기
간단한 기록들 버전
중단

peer 

*** 윈도우
set 변수명=값
set 변수명

*** mac or linux
export 변수명=값
env | grep 변수명

*/