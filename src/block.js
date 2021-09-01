const block = {
    MagicNumber: "0xD9B4BEF9",
    BlockSize: "4mb",
    header: {
        version:"1.0.0",
        HashPreBlock:0x000000000, //제네시스블럭은 하드코딩으로 증명함
        HashMerkleRoot:`SHA256`,
        timestamp:`시간`,
        bits:`작업증명 난이도를 정하는 `,
        Nonce: `난수` //4byte 양수
    },
    body: ["hello world!"] //객체가 될수도, 배열이 될수도
}
//block의 형태는 고정된 형식이 있는게 아니라 우리가 마음대로 생성할 수 있음

/* http request message */
