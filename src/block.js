const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')
const random = require('random')
const {hexToBinary} = require('./util')

/* 사용법 */
//const tree = merkle("sha256").sync([]) //배열을 넣어야함, 배열 안에 객체 넣는 것 가능, tree구조로 만들어줌
//tree.root()

const BLOCK_GENERATION_INTERVAL = 10 //초
const BLOCK_ADJUSTMENT_INTERVAL = 10 //블록이 10개가 넘을때마다 난이도를 변경시키는 것

class BlockHeader {
    constructor( version, index, previousHash, time, merkleRoot, difficulty, nonce ){
        this.version = version // 1 {version:1}
        this.index = index // 2 {version:1, index:2} // 포인트!
        this.previousHash = previousHash // 마지막 블록을 가져올 수 있어야함 -> 그 블록에서 header의 정보만 들고 올줄 알아야함 -> 전부 다 string으로 연결할 줄 알아야함 -> 그것을 SHA256으로 변환할줄 알아야함
        this.time = time
        this.merkleRoot = merkleRoot

        this.difficulty = difficulty // 난이도
        this.nonce = nonce // 몇번 시도했는지?

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
    const version = "1.0.0" //1.0.0
    const index = 0
    const time = 1630907567
    const previousHash = '0'.repeat(64)
    const body = ['hello block']

    const tree = merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const difficulty = 0
    const nonce = 0

    const header = new BlockHeader(version,index,previousHash,time,root,difficulty,nonce)
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
    const difficulty = getDifficulty(getBlocks()) // <- 함수를 만들어서

    const merkleTree = merkle("sha256").sync(data)
    const merkleRoot = merkleTree.root() || '0'.repeat(64)
    
    const header = findBlock(version,index,previousHash,time,merkleRoot,difficulty)
    return new Block(header,data)
}

function getDifficulty(blocks){
    // 시간 
    const lastBlock = blocks[blocks.length-1]
    if(lastBlock.header.index % BLOCK_ADJUSTMENT_INTERVAL === 0
        && lastBlock.header.index != 0
        ) {
        //난이도를 조정하는 코드
        return getAdjustedDifficulty(lastBlock,blocks)
    }
    return lastBlock.header.difficulty
}

function getAdjustedDifficulty(lastBlock,blocks){
    // block 10단위로 끊는다.
    // 게시판의 페이징처럼 이전의 값
    // lastblock 난이도
    const prevAdjustmentBlock = blocks[blocks.length - BLOCK_ADJUSTMENT_INTERVAL]
    const timeToken = lastBlock.header.time - prevAdjustmentBlock.header.time
    const timeExpected = BLOCK_ADJUSTMENT_INTERVAL * BLOCK_GENERATION_INTERVAL

    if(timeToken < timeExpected/2){
        return prevAdjustmentBlock.header.difficulty + 1
    } else if (timeToken > timeExpected * 2) {
        return prevAdjustmentBlock.header.difficulty -1
    } else {
        return prevAdjustmentBlock.header.difficulty
    }
}

function findBlock(version,index,previousHash,time,merkleRoot,difficulty){
    let nonce = 0
    while(true){
        // 이 상태에서는 BLOCK이 없어요
        // 이곳에서 createHeaderHash함수 호출 할 예정
        let hash = createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce)
        console.log(hash)
        if(hashMatchDifficulty(hash,difficulty)){ //우리가 앞으로 만들 header의 HASH값의 앞자리 0이 몇개인가?
            return new BlockHeader(version,index,previousHash,time,merkleRoot,difficulty,nonce)
        }
        nonce++
    }
}

function hashMatchDifficulty(hash,difficulty){
    // 0000 4개냐 1개냐
    const hashBinary = hexToBinary(hash)
    const prefix = '0'.repeat(difficulty)
    return hashBinary.startsWith(prefix)
}

function createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce){
    let txt = version+index+previousHash+time+merkleRoot+difficulty+nonce
    return CryptoJs.SHA256(txt).toString().toUpperCase()
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
// Blocks push 1번
function addBlock(newBlock){ //블럭이 성공적으로 넣어지는 시점을 잡는 것
    //new header -> new block (header, body)
    //block 조건
    //push 하기 전에 검증

    if(isValidNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock); 
        console.log(newBlock)
        return true;
    } 
    return false;
}

function mineBlock(blockData){
    const newBlock = nextBlock(blockData) //object block {header, body}
    if(addBlock(newBlock)){
        const nw = require('./network')
        nw.broadcast(nw.responseLastMsg())
        return newBlock
    } else {
        return null
    }
}


/* etc
1: 타입검사
*/

function isValidNewBlock(currentBlock, previousBlock){
    // currentBlock 에 대한 header, body DataType을 확인
    if(isValidType(currentBlock) == false){
        console.log(`invalid block structure ${JSON.stringify(currentBlock)}`)
        return false
    }
    //index값이 유효한지
    if(previousBlock.header.index + 1 !== currentBlock.header.index) {
        console.log(`invalid index`)
        return false
    }
    //previousHash
    /*
        어떻게 만들어졌는가?
        해당 블럭의 header의 내용을 글자로 합쳐서 SHA256 활용하여 암호화한 결과물
        previousHash 
        제네시스 블럭 기준  -> 2번째 블럭
    */

    if(createHash(previousBlock) !== currentBlock.header.previousHash){
        console.log(`invalid previousBlock`)
        return false
    }
    // body check
    /*
        current.header.merkleRoot -> body [배열]
        current.body => merkleTree root -> result !== current.header.merkleRoot
        굳이 왜...?
        body... 내용이 없으면 안됩니다.
        current.body.length !== 0 && (currentBlock.body가지고 만든 merkleRoot !== currentBlock.header.merkleRoot )
        current.body.length !== 0 && ( merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot )
    */
    if ( currentBlock.body.length !== 0 && ( merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot ) ){
        console.log(`invalid merkleRoot`)
        return false
    }

    return true
}

function isValidType(block){
    console.log(
    typeof(block.header.version) === "string" && //string
    typeof(block.header.index) === "number" &&  //number
    typeof(block.header.previousHash) === "string" &&  //string
    typeof(block.header.time) === "number" &&  // number
    typeof(block.header.merkleRoot) === "string" &&  //string
    typeof(block.body) === "object"  // object
    )

}

function replaceBlock(newBlocks) {
    // newBlocks : 내가 받은 전체 배열 => 내가 받은 전체 블록들
    // Blocks = newBlocks
    // 1. newBlocks내용을 검증
    // 2. 검증을 한번만 하지 않는다. 랜덤하게 한번만 할 수 있고, 두번할수도 있고, 세번할수도 있게 합니다. => 조건문에 랜덤 사용
    // 3. Blocks = newBlocks
    // 4. broadcast 날립니다. 

    if (isValidBlock(newBlocks) && newBlocks.length > Blocks.length && random.boolean()) {
        console.log(`Blocks 배열을 newBlocks로 교체합니다.`)
        const nw = require('./network')
        Blocks = newBlocks
        nw.broadcast(nw.responseLastMsg())
    } else {
        console.log(`메세지로부터 받은 블록배열이 맞지 않습니다.`)
    }
}

function getVersion(){
    const {version} = JSON.parse(fs.readFileSync("../package.json"))
    //console.log(version)
    return version

    //const package = fs.readFileSync("../package.json")
    //console.log(package.toString("utf8"))
    //console.log(JSON.parse(package).version)
    //return JSON.parse(package).version
}

function getCurrentTime(){
    //console.log( Math.ceil(new Date().getTime()/1000) )
    return Math.ceil(new Date().getTime()/1000)
}

/*
    일단 제네시스 블럭이 유효한지, 데이터가 바뀐적이 없는지
    2번째는 blocks 모든 배열을 검사할겁니다.
*/

function isValidBlock(Blocks){
    if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
        console.log(`genesis error`)
        return false
    }

    let tempBlocks = [Blocks[0]]
    for ( let i = 1; i<Blocks.length; i++ ){
        if(isValidNewBlock(Blocks[i],tempBlocks[i-1])) {
            tempBlocks.push(Blocks[i])
        } else {
            return false
        }
    }

    return true
}

//console.log(Blocks)

module.exports = {
    getBlocks,
    getLastBlock,
    addBlock,
    getVersion,
    replaceBlock,
    mineBlock,
    createHash
}

/*

blockchain 네트워크

P2P
-> 프루나
-> 소리바다
-> websocket

클라이언트 - 서버 -> http tcp

-------------------------
네트워크까지 끝나면 정말 간단한 블록체인

-----지분증명
-----합의알고리즘
-----트랜잭션 거래...
-----지갑생성

-----코인 빌드 1~2개
-----Dapp 비스무리하게


P2P 
-> WebSocket
-> socket.io
    - 기본기능 외 여러가지 또 만들어져있다.
-> ws
    - 접속에 대한것만 ex) boardcast , to , 


*/
