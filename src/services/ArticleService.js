import fetch from 'node-fetch';

import { API_HOST } from '../constant/constant.js';

export function getArticleList(page, pageSize, keyword) {
  return fetch(`${API_HOST}/articles?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
    .then((fetchResult) => normalizeFetchResult(fetchResult))
    .then((normalizedFetchResult) => handleNormalizedFetchResult(normalizedFetchResult))
    .catch((error) => handleError(error));
}


export function getArticle(articleId) {
  return fetch(`${API_HOST}/articles/${articleId}`)
    .then((fetchResult) => normalizeFetchResult(fetchResult))
    .then((normalizedFetchResult) => handleNormalizedFetchResult(normalizedFetchResult))
    .catch((error) => handleError(error));
}


export function createArticle(title, content, image) {
  return fetch(`${API_HOST}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, image }),
  })
    .then((fetchResult) => normalizeFetchResult(fetchResult))
    .then((normalizedFetchResult) => handleNormalizedFetchResult(normalizedFetchResult))
    .catch((error) => handleError(error));
}


export function patchArticle(articleId, title, content, image) {
  return fetch(`${API_HOST}/articles/${articleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, image }),
  })
    .then((fetchResult) => normalizeFetchResult(fetchResult))
    .then((normalizedFetchResult) => handleNormalizedFetchResult(normalizedFetchResult))
    .catch((error) => handleError(error));
}


export function deleteArticle(articleId) {
  return fetch(`${API_HOST}/articles/${articleId}`, {
    method: 'DELETE',
  })
    .then((fetchResult) => normalizeFetchResult(fetchResult))
    .then((normalizedFetchResult) => handleNormalizedFetchResult(normalizedFetchResult))
    .catch((error) => handleError(error));
}


function normalizeFetchResult(response) {
  if(response.status === 204) {
    return { isSuccessful: response.ok, status: response.status, payload: null };
  }

  return response
    .json()
    .then((payload) => ({ isSuccessful: response.ok, status: response.status, payload }));
}

function handleNormalizedFetchResult(fetchResult) {
  if (fetchResult.isSuccessful === false) {
    const errorMessage = `[StatusCode ${fetchResult.status}] ${fetchResult.payload.message}`;
    throw new Error(errorMessage);
  }

  return fetchResult.payload;
}

function handleError(error) {
  console.error(error.message);

  throw error;
}
