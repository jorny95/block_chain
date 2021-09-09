// secp256k1 알고리즘 암호화 => 더 자세히 알기 위해선 검색해보기
// elliptic -> npm i elliptic
const fs = require('fs')
const ecdsa = require('elliptic')
//console.log(ecdsa)
const ec = new ecdsa.ec("secp256k1") 
//console.log(ec)

const privateKeyLocation = "wallet/"+(process.env.PRIVATE_KEY || "default")
const privateFile = `${privateKeyLocation}/private_key`

console.log(ec.genKeyPair().getPrivate().toString(16).toUpperCase())

// 랜덤 키값
// SHA256 -> 복호화 안되는 단방향 암호화 A -> 0100

// 이번엔 랜덤한 키값을 반환해준다.
// 중복될 수 있는 가능성?

function generatorPrivateKey(){
    const KeyPair = ec.genKeyPair()
    const privateKey = KeyPair.getPrivate()
    return privateKey.toString(16).toUpperCase()
}

//node server

//특정폴더 = wallet/default
// wallet/default existsSync -> true,false
//wallet 있는지
//있다 wallet/default 생성안함
//없다 wallet/default 생성
//mkdir

// node server.js
// http://localhost:3000/address
// > keyfile 읽어서 보여줄겁니다.
// > node server.js가 실행되면, 특정 폴더에 특정파일에
// > 결과물이 나올 수 있도록 할겁니다.
// > keyfile

console.log( generatorPrivateKey() )

function initWallet(){
    if(!fs.existsSync("wallet/")){
        fs.mkdirSync("wallet/")
    }

    if(!fs.existsSync(privateKeyLocation)){
        fs.mkdirSync(privateKeyLocation)
    }
    if(!fs.existsSync(privateFile)){
        console.log(`주소값 키값을 생성중입니다...`)
        const newPrivateKey = generatorPrivateKey()
        // 첫번째 인자값은 경로 + 파일명
        // 두번째 인자값은 파일내용
        fs.writeFileSync(privateFile,newPrivateKey)
        console.log(`개인 키 생성이 완료되었습니다.`)
    }
}

initWallet()

function getPrivateFromWallet(){
    const buffer = fs.readFileSync(privateFile)
    return buffer.toString()
}

function getPublicFromWallet(){
    const privateKey = getPrivateFromWallet()
    const key = ec.keyFromPrivate(privateKey,"hex")
    return key.getPublic().encode("hex")
}

// console.log(getPrivateFromWallet())
// console.log(getPublicFromWallet())

getPrivateFromWallet()

// AWS pem -> RSA 인증방식
// 공개키 비밀키

// generator 

module.exports = {
    initWallet,
    getPublicFromWallet

}
