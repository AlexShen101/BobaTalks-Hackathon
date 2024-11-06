import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

/**
 * Generates an embedding vector for the given text using OpenAI's embedding model
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} A 1536-dimensional vector representing the text
 * @throws {Error} If embedding generation fails
 */
export async function generateEmbedding(text) {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Upserts (creates or updates) a vector in Pinecone
 * @param {string|number} eventId - The unique identifier for the event
 * @param {number[]} embedding - The embedding vector
 * @param {Object} metadata - Additional metadata to store with the vector
 * @throws {Error} If upsertion fails
 */
export async function upsertToPinecone(eventId, embedding, metadata) {
  try {
    await index.upsert([{
      id: eventId.toString(),
      values: embedding,
      metadata
    }]);
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
}

/**
 * Searches for similar events in Pinecone using vector similarity
 * @param {string} query - The search query to find similar events for
 * @param {number} topK - The number of similar events to return (default: 5)
 * @returns {Promise<Array>} Array of matching events with their similarity scores
 * @throws {Error} If search operation fails
 */
export async function searchSimilarEvents(query, topK = 5) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });

    return searchResults.matches;
  } catch (error) {
    console.error('Error searching in Pinecone:', error);
    throw error;
  }
}

/**
 * Deletes a vector from Pinecone by its ID
 * @param {string|number} eventId - The ID of the event to delete
 * @throws {Error} If deletion fails
 */
export async function deleteFromPinecone(eventId) {
  try {
    await index.deleteOne(eventId.toString());
  } catch (error) {
    console.error('Error deleting from Pinecone:', error);
    throw error;
  }
}