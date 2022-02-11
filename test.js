//const Cvlc = require('cvlc');
const { exec } = require('child_process');

(async () => {
	//const player = new Cvlc();
	exec('python neopix-green.py');
	//exec('cvlc ./assets/sd-card-detected.mp3');
	//player.play('./assets/sd-card-detected.mp3', ()=>{});
	//player.destroy();
	await sleep(5500);
	process.exit(0);
})();

function sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

