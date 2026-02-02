// ingest.js
import { ChromaClient } from 'chromadb';

const client = new ChromaClient();

async function setup() {
  // 1. 'company_knowledge'라는 이름의 저장소(Collection) 만들기
  const collection = await client.getOrCreateCollection({
    name: "company_knowledge",
  });

  // 2. 사내 지식 데이터 추가 (예시)
  await collection.add({
    ids: ["id1", "id2"],
    metadatas: [{ source: "office_guide" }, { source: "office_guide" }],
    documents: [
      "건전지는 탕비실 세 번째 서랍에 있습니다.",
      "신규 입사자 환영 회식은 매달 마지막 주 금요일입니다."
    ],
  });

  console.log("✅ 사내 지식이 ChromaDB에 성공적으로 저장되었습니다!");
}

setup();