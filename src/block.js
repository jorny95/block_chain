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

//다음블럭의 Header와 Body를 만들어주는 함수
function nextBlock(data){
    // header 
    const preBlock = getLastBlock()
    const version = getVersion()
    const index = preBlock.header.index + 1
    const previousHash = createHash(preBlock)
    /*
        이전 해쉬값
        previousHash=SHA256(version + index + previousHash + timestamp + merkleRoot)
    */
    const time = getCurrentTime()

    const merkleTree = merkle("sha256").sync(data)
    const merkleRoot = merkleTree.root() || '0'.repeat(64)
    
    const header = new BlockHeader(version,index,previousHash,time,merkleRoot)
    return new Block(header,data)
}

function createHash(block){
    const {
        version,
        index,
        previousHash,
        time,
        merkleRoot
    } = block.header
    const blockString = version + index + previousHash + time + merkleRoot
    const Hash = CryptoJs.SHA256(blockString).toString()
    return Hash
}

function addBlock(data){
    //new header -> new block (header, body)
    //block 조건
    //push 하기 전에 검증

    const newBlock = nextBlock(data)


    if(isValidNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock); 
        return true;
    } 
    return false;
}

/* etc
1: 타입검사
*/

function isValidNewBlock(currentBlock, previousBlock){
    isValidType(currentBlock)
    return true
}

function isValidType(block){
    console.log(block)
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

addBlock(["hello1"])
addBlock(["hello2"])
addBlock(["hello3"])
console.log(Blocks)