//npm install merkletreejs
//npm install crypto-js
//npm install merkle

const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')

console.log( SHA256('JIHYUN').toString() ) //SHA256으로 암호화할 글자 입력



const testSet = ['a','b','c'].map( v=> SHA256(v))
console.log(testSet)

const tree = new MerkleTree(testSet, SHA256)
console.log(tree.toString())

const root = tree.getRoot()  // 최상위 노드 가져오는거

console.log(root.toString('hex')) //인코딩 hex로 해야함


const testRoot = 'a'
const leaf = SHA256(testRoot)
const proof = tree.getProof(leaf)
console.log(tree.verify(proof,leaf,root))
