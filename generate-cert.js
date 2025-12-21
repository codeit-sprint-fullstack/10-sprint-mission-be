// 자체 서명 인증서 생성 스크립트
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certDir = path.join(__dirname, 'certs');

// certs 디렉토리 생성
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

try {
    // OpenSSL로 자체 서명 인증서 생성
    console.log('자체 서명 인증서 생성 중...');
    
    execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout "${path.join(certDir, 'key.pem')}" -out "${path.join(certDir, 'cert.pem')}" -days 365 -nodes -subj "/C=KR/ST=Seoul/L=Seoul/O=Dev/CN=localhost"`,
        { stdio: 'inherit', shell: true }
    );
    
    console.log('\n✅ 인증서 생성 완료!');
    console.log(`인증서 위치: ${certDir}`);
    console.log('\n이제 npm run dev를 실행하면 HTTPS 서버가 시작됩니다.');
} catch (error) {
    console.error('\n❌ OpenSSL이 설치되어 있지 않거나 오류가 발생했습니다.');
    console.error('\n해결 방법:');
    console.log('1. OpenSSL 설치:');
    console.log('   - Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   - 또는 Git Bash에 포함된 OpenSSL 사용');
    console.log('\n2. 설치 후 다음 명령어 실행:');
    console.log(`   openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"`);
    console.log('\n또는 Git Bash에서 실행:');
    console.log(`   mkdir -p certs`);
    console.log(`   openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"`);
    process.exit(1);
}
