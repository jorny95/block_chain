const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')

/* 사용법 */
//const tree = merkle("sha256").sync([]) //배열을 넣어야함, 배열 안에 객체 넣는 것 가능, tree구조로 만들어줌
//tree.root()

class BlockHeader {
    constructor( version, index, previousHash, time, merkleRoot ){
        this.version = version // 1 {version:1}
        this.index = index // 2 {version:1, index:2} // 포인트!
        this.previousHash = previousHash // 마지막 블록을 가져올 수 있어야함 -> 그 블록에서 header의 정보만 들고 올줄 알아야함 -> 전부 다 string으로 연결할 줄 알아야함 -> 그것을 SHA256으로 변환할줄 알아야함
        this.time = time
        this.merkleRoot = merkleRoot
    }
}

//const header = new BlockHeader(1,2,3,4,5)
//console.log(header)

// {
//     version:1,
//     index:2,
//     previousHash:3,
//     time:4,
//     merkleRoot:5
// }

class Block {
    constructor(header,body){
        this.header = header;
        this.body = body
    }
}

// const blockchain = new Block(new BlockHeader(1,2,3,4,5),['hello'])
// console.log(blockchain)

let Blocks = [createGenesisBlock()]

function getBlocks(){
    return Blocks
}

function getLastBlock() {
    return Blocks[Blocks.length -1]
}

function createGenesisBlock(){
    // 1. header만들기
    // 5개의 인자값을 만들어야됨
    const version = getVersion() //1.0.0
    const index = 0
    const time = getCurrentTime()
    const previousHash = '0'.repeat(64)
    const body = ['hello block']

    const tree = merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const header = new BlockHeader(version,index,previousHash,time,root)
    return new Block(header,body)
}

// const block = [createGenesisBlock()]
// console.log(block)

function addBlock(){
    //new header -> new block (header, body)
}

function getVersion(){
    const {version} = JSON.parse(fs.readFileSync("../package.json"))
    console.log(version)
    return version

    //const package = fs.readFileSync("../package.json")
    //console.log(package.toString("utf8"))
    //console.log(JSON.parse(package).version)
    //return JSON.parse(package).version
}

function getCurrentTime(){
    console.log( Math.ceil(new Date().getTime()/1000) )
    return Math.ceil(new Date().getTime()/1000)
}


console.log(Blocks)