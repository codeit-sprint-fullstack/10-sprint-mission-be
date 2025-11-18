# 프론트엔드와 백엔드 연결 가이드

## 1. 백엔드 서버 실행

```bash
# 개발 모드로 실행 (nodemon 사용)
npm run dev

# 또는 프로덕션 모드
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pandamarket

# Server Port
PORT=3000

# CORS Origin (여러 포트를 허용하려면 쉼표로 구분)
# 예: CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 3. API 엔드포인트

모든 API는 `/api` 경로로 시작합니다.

### 기본 URL
```
http://localhost:3000/api
```

### API 목록

#### 1. 상품 등록
- **Method**: `POST`
- **URL**: `/api/products`
- **Request Body**:
```json
{
  "name": "상품명",
  "description": "상품 설명",
  "price": 10000,
  "tags": ["태그1", "태그2"]
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "상품명",
    "description": "상품 설명",
    "price": 10000,
    "tags": ["태그1", "태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. 상품 상세 조회
- **Method**: `GET`
- **URL**: `/api/products/:id`
- **Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "상품명",
    "description": "상품 설명",
    "price": 10000,
    "tags": ["태그1", "태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. 상품 수정
- **Method**: `PATCH`
- **URL**: `/api/products/:id`
- **Request Body** (수정할 필드만 포함):
```json
{
  "name": "수정된 상품명",
  "price": 15000
}
```
- **Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "수정된 상품명",
    "description": "상품 설명",
    "price": 15000,
    "tags": ["태그1", "태그2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. 상품 삭제
- **Method**: `DELETE`
- **URL**: `/api/products/:id`
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "상품이 삭제되었습니다."
}
```

#### 5. 상품 목록 조회
- **Method**: `GET`
- **URL**: `/api/products`
- **Query Parameters**:
  - `offset`: 페이지네이션 오프셋 (기본값: 0)
  - `limit`: 페이지 크기 (기본값: 20, 최대: 100)
  - `sort`: 정렬 방식 (`recent` 또는 `old`, 기본값: `recent`)
  - `keyword`: 검색 키워드 (name, description에서 검색)
- **Example**: `/api/products?offset=0&limit=20&sort=recent&keyword=노트북`
- **Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "product_id_1",
      "name": "상품명1",
      "price": 10000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "product_id_2",
      "name": "상품명2",
      "price": 20000,
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 50,
    "hasMore": true
  }
}
```

## 4. 프론트엔드에서 API 호출하기

### JavaScript (Fetch API) 예제

```javascript
const API_BASE_URL = 'http://localhost:3000/api';

// 상품 목록 조회
async function getProductList(offset = 0, limit = 20, sort = 'recent', keyword = '') {
  try {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      sort,
      keyword,
    });
    
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
}

// 상품 상세 조회
async function getProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('상품 조회 실패:', error);
    throw error;
  }
}

// 상품 등록
async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('상품 등록 실패:', error);
    throw error;
  }
}

// 상품 수정
async function updateProduct(productId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('상품 수정 실패:', error);
    throw error;
  }
}

// 상품 삭제
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('상품 삭제 실패:', error);
    throw error;
  }
}
```

### Axios 사용 예제

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 상품 목록 조회
export async function getProductList(offset = 0, limit = 20, sort = 'recent', keyword = '') {
  try {
    const response = await apiClient.get('/products', {
      params: { offset, limit, sort, keyword },
    });
    return response.data.data;
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
}

// 상품 상세 조회
export async function getProduct(productId) {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error('상품 조회 실패:', error);
    throw error;
  }
}

// 상품 등록
export async function createProduct(productData) {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data.data;
  } catch (error) {
    console.error('상품 등록 실패:', error);
    throw error;
  }
}

// 상품 수정
export async function updateProduct(productId, updateData) {
  try {
    const response = await apiClient.patch(`/products/${productId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('상품 수정 실패:', error);
    throw error;
  }
}

// 상품 삭제
export async function deleteProduct(productId) {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('상품 삭제 실패:', error);
    throw error;
  }
}
```

### React 예제

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { offset: 0, limit: 20, sort: 'recent' },
      });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, productData);
      if (response.data.success) {
        // 목록 새로고침
        fetchProducts();
      }
    } catch (err) {
      console.error('상품 등록 실패:', err);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      <h1>상품 목록</h1>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>가격: {product.price}원</p>
        </div>
      ))}
    </div>
  );
}
```

## 5. 에러 처리

모든 API는 다음과 같은 에러 응답 형식을 사용합니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

### 주요 HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

## 6. CORS 설정 확인

프론트엔드가 다른 포트에서 실행되는 경우, 백엔드의 `.env` 파일에서 `CORS_ORIGIN`에 프론트엔드 URL을 추가하세요:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

또는 개발 환경에서는 모든 origin을 허용하도록 설정할 수 있습니다 (보안상 프로덕션에서는 권장하지 않음).

## 7. 테스트

브라우저나 Postman을 사용하여 API를 테스트할 수 있습니다:

```bash
# 서버 상태 확인
curl http://localhost:3000/

# 상품 목록 조회
curl http://localhost:3000/api/products

# 상품 등록
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 상품",
    "description": "테스트 설명",
    "price": 10000,
    "tags": ["테스트"]
  }'
```

