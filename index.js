require('dotenv').config();
const fs = require('fs');
const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const S3SyncClient = require('s3-sync-client');
const Cvlc = require('cvlc');

const removableStoragePath = '/media/pi';

const player = new Cvlc();

fs.watch(removableStoragePath, async (eventType, filename) => {
	try {
		const files = await fs.promises.readdir(removableStoragePath);
		if (files[0] && eventType === 'rename') {
			const fullDevicePath = removableStoragePath + '/' + files[0];
			const stat = await fs.promises.lstat(fullDevicePath);
			if (stat.isDirectory()) {
				player.play('./assets/sd-card-detected.mp3', ()=>{
					
				});
				await sleep(2500);
				const removableStorageFiles = await fs.promises.readdir(fullDevicePath);
				if (removableStorageFiles.length > 0) {
					player.play('./assets/file-upload.mp3', ()=>{});
					await sleep(3500);
					await syncLocalDirToS3(fullDevicePath);
					player.play('./assets/upload-complete.mp3', ()=>{});
					await sleep(5500);
				}
				console.log(removableStorageFiles);
			}
		}
	} catch (err) {
		console.error(err);
	}
});

async function syncLocalDirToS3(localPath) {
	const s3Client = new S3Client({
		endpoint: process.env.S3_ENDPOINT,
		region: process.env.S3_REGION,
		credentials: {
			accessKeyId: process.env.S3_KEY,
			secretAccessKey: process.env.S3_SECRET
		}
	});
	const { sync } = new S3SyncClient({ client: s3Client });

	// aws s3 sync /path/to/local/dir s3://mybucket2
	await sync(localPath, process.env.S3_BUCKET);
	//await sync('/path/to/local/dir', 's3://mybucket2', { partSize: 100 * 1024 * 1024 }); // uses multipart uploads for files higher than 100MB
}

function sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function exitHandler(signal) {
	player.destroy();
	process.exit(0);
}

process.on('uncaughtException', exitHandler);
process.on('unhandledRejection', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('SIGINT', exitHandler);
