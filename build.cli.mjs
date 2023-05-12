/*
 * @author kaysaith
 * @date 2021/5/21
 */
import * as fileSystem from 'fs';
import { execSync } from 'child_process';

const packageJson = JSON.parse(fileSystem.readFileSync('package-origin.json'));

// 准备环境
if (process.argv[2] === 'test') {
  packageJson.environment = 'test';
} else {
  packageJson.environment = 'main';
}

// 打包海外还是中国
if (process.argv[3] === 'china') {
  packageJson.platform = 'cos';
  delete packageJson.dependencies['@aws-sdk/client-s3'];
  delete packageJson.dependencies['@aws-sdk/lib-storage'];
  delete packageJson.dependencies['@towify/aws-web-uploader'];
  delete packageJson.dependencies['@towify/data-engine-oversea'];
  delete packageJson.dependencies['@towify/data-driver-oversea'];
  [
    { src: './towify-build-resource-china/package-index/driver.ts', dist: './src/package-index/driver.ts' },
    { src: './towify-build-resource-china/package-index/data-engine.ts', dist: './src/package-index/data-engine.ts' },
    { src: './towify-build-resource-china/package-index/web-uploader.ts', dist: './src/package-index/web-uploader.ts' },
  ].forEach((path) => {
    const fileContent = fileSystem.readFileSync(path.src);
    fileSystem.writeFileSync(path.dist, fileContent);
  });
} else {
  packageJson.platform = 'aws';
  // TODO 暂时不移除，待处理好 node-kit-engine 对 cos 的依赖后再移除
  // delete packageJson.dependencies['cos-nodejs-sdk-v5'];
  delete packageJson.dependencies['@towify/cos-web-uploader'];
  delete packageJson.dependencies['@towify/data-engine-china'];
  delete packageJson.dependencies['@towify/data-driver-china'];
  [
    { src: './towify-build-resource-oversea/package-index/driver.ts', dist: './src/package-index/driver.ts' },
    { src: './towify-build-resource-oversea/package-index/data-engine.ts', dist: './src/package-index/data-engine.ts' },
    { src: './towify-build-resource-oversea/package-index/web-uploader.ts', dist: './src/package-index/web-uploader.ts' },
  ].forEach((path) => {
    const fileContent = fileSystem.readFileSync(path.src);
    fileSystem.writeFileSync(path.dist, fileContent);
  });
}

// 生成文件
fileSystem.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
// 更新 package 后 安装新包
execSync('yarn install', { stdio: 'inherit' });
