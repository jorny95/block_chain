// class 문법
// node 환경에서

// 블록체인 ?
// 체인 블록 ? 노드 ?

/*
    // 암호
    // 알고리즘
    // 통신(탈중앙)

    객체 (제네시스 블록, 연결되어있지 않은 블록)
    {
        name: ingoo,
        id: web7722,
        key:0
        address
    } 

    {
        name: 익균,
        id: i,
        key:web7722
        address
    }

    {
        name: 미희,
        id: m,
        key:i
        address
    }
*/

const block = {
    MagicNumber: "0xD9B4BEF9",
    BlockSize: "4mb",
    header: {
        version:"1.0.0",
        HashPreBlock:0x000000000, //제네시스블럭은 하드코딩으로 증명함
        HashMerkleRoot:`SHA256`,
        timestamp:`시간`, // 유닉스 기준일 1970년 1월 1일 자정부터 0초 현재 오늘날까지 총 몇초인가.
        # bits:`작업증명 난이도를 정하는 `, //실습에서는 상세설명 생략
        Nonce: `난수` //4byte 양수
    },
    body: ["hello world!"] //객체가 될수도, 배열이 될수도
}

//block의 형태는 고정된 형식이 있는게 아니라 우리가 마음대로 생성할 수 있음

/* http request message */
