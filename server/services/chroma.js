/**
 * ChromaDB 벡터 DB 연동
 */
import { ChromaClient } from 'chromadb';
import { COLLECTION_NAME, RAG_TOP_K } from '../config.js';

const chromaClient = new ChromaClient();

export async function addToChromaDB(id, answer, refLink = '', attachmentUrl = '', attachmentName = '') {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    await collection.add({
      ids: [`knowledge_${id}`],
      documents: [answer],
      metadatas: [{ refLink: refLink || '', attachmentUrl: attachmentUrl || '', attachmentName: attachmentName || '', source: 'knowledge' }],
    });
    return true;
  } catch (err) {
    console.error('ChromaDB 추가 오류:', err.message);
    return false;
  }
}

export async function updateInChromaDB(id, answer, refLink = '', attachmentUrl = '', attachmentName = '') {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    await collection.update({
      ids: [`knowledge_${id}`],
      documents: [answer],
      metadatas: [{ refLink: refLink || '', attachmentUrl: attachmentUrl || '', attachmentName: attachmentName || '', source: 'knowledge' }],
    });
    return true;
  } catch (err) {
    console.error('ChromaDB 수정 오류:', err.message);
    return false;
  }
}

export async function deleteFromChromaDB(id) {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    await collection.delete({ ids: [`knowledge_${id}`] });
    return true;
  } catch (err) {
    console.error('ChromaDB 삭제 오류:', err.message);
    return false;
  }
}

export async function searchKnowledge(question) {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    const result = await collection.query({ queryTexts: [question], nResults: RAG_TOP_K });
    const docs = (result.documents && result.documents[0]) || [];
    const metadatas = (result.metadatas && result.metadatas[0]) || [];
    return docs
      .filter((d) => d != null && d.trim() !== '')
      .map((doc, i) => ({ text: doc, metadata: metadatas[i] || {} }));
  } catch (err) {
    console.error('ChromaDB 검색 오류:', err.message);
    return [];
  }
}
