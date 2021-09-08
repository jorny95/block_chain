const  CryptoJs = require('crypto-js')


let a = "0000helloworld!"

// javascript String -> startswith

//console.log(a.startsWith("0000"))

console.log(CryptoJs.SHA256(a).toString().toUpperCase())
// 1314042ECF8C8A7702AABA1C82D560B5A262FF3E922BB117FA81F2B002FC37B9
// 16진수 -> 2진수랑 친구
// 내 결과물 -> SHA256 (16진수) -> 2진수
