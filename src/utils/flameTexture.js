import Worley from "worleyjs";
import { makeNoise2D, makeNoise3D } from "open-simplex-noise";
import { makeCylinderSurface } from "fractal-noise";

const TEX_WIDTH = 128;
const TEX_HEIGHT = 128;
const MARGIN = Math.round(TEX_WIDTH / 5);

class FlameTex {
	mainTex = null;
	noiseTex = null;
	vorTex = null;
	canvas = null;
	noise = null;
	worleyNoise = null;
	offset = 0;
	length = TEX_HEIGHT * 4;
	noiseBorder = TEX_HEIGHT * 4 * 0.2;
	speed = 128;
	pointCount = 40;
	voronoiPoints = [];
	constructor(pixelRatio) {
		this.noise = makeNoise3D(Date.now());;
		this.noise = makeNoise3D(Date.now());;
		this.noiseTex = document.createElement('canvas');
		this.noiseTex.height = TEX_WIDTH;
		this.noiseTex.width = this.length;
		this.mainTex = document.createElement('canvas');
		this.mainTex.width = TEX_WIDTH;
		this.mainTex.height = TEX_HEIGHT;
		const canvas = document.createElement('canvas');
		canvas.width = TEX_WIDTH;
		canvas.height = TEX_HEIGHT;
		canvas.style.position = "absolute";
		canvas.style.top = 0;
		canvas.style.left = 0;
		canvas.style.width = `${TEX_WIDTH / pixelRatio}px`;
		canvas.style.height = `${TEX_HEIGHT / pixelRatio}px`;
		canvas.style.opacity = 0.75;

		this.canvas = canvas;
		this.createNoiseData();
		this.setNoiseData();
	}

	createNoiseData(){
		const ctx = this.noiseTex.getContext("2d")
		const circumference = this.length
		const imgdata = ctx.createImageData(circumference, TEX_WIDTH);
		const data = makeCylinderSurface(
			circumference, 
			TEX_WIDTH, 
			this.noise, 
			{ frequency: 0.03, octaves: 8 }
		);

		let contrast = 70;
		contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);

		for (let x = 0; x < circumference; x++) {
		  for (let y = 0; y < TEX_WIDTH; y++) {
		    const i = (x + y * circumference) * 4;
		    const val = (((data[x][y] + 1) / 2) * 255) * contrast + intercept;
		    imgdata.data[i] = val;
		    imgdata.data[i + 1] = val;
		    imgdata.data[i + 2] = val;
		    imgdata.data[i + 3] = val;
		  }
		}
		ctx.putImageData(imgdata, 0, 0)
		this.genVoronoiPoints()
		// this.displayVoronoiPoints()
	}

	setNoiseData(offset = 0) {
		const texCtx = this.noiseTex.getContext("2d");
		const ctx = this.mainTex.getContext("2d");
		const dispCtx = this.canvas.getContext("2d");
		const p1start = offset;
		const p1end = Math.min(offset + TEX_HEIGHT, this.length);
		const p2end = (offset + TEX_HEIGHT) % this.length;

		const sect1 = texCtx.getImageData(p1start, 0, p1end, TEX_WIDTH)
		const sect2 = texCtx.getImageData(0, 0, p2end === 0 ? 1 : p2end, TEX_WIDTH)
		ctx.clearRect(0,0,TEX_WIDTH, TEX_HEIGHT)

		ctx.putImageData(sect1, 0, 0)
		if(p1end === this.length){
			ctx.putImageData(sect2, this.length - offset, 0)
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		const outData = ctx.getImageData(0,0,TEX_WIDTH,TEX_HEIGHT)

		dispCtx.rotate(90 * Math.PI / 180)
		dispCtx.translate(0, -TEX_WIDTH)
		dispCtx.drawImage(this.mainTex, 0, 0)
		dispCtx.setTransform(1, 0, 0, 1, 0, 0);
	}

	genVoronoiPoints() {
		const worleyNoise = new Worley({
		    width: this.length, // In pixels
		    height: TEX_WIDTH, // In pixels
		    threshold: TEX_WIDTH * 0.5,
		    colors: [[0, 0, 0], [255, 255, 255]],
		    // colors: [[255, 255, 255], [0, 0, 0]],
		    alpha: true
		    // crests: this.pointCount,
		});
		for(let i = 0; i < this.pointCount; i++){
			let found = false;
			while (!found) {
				let x = Math.floor(Math.random()*this.length);
				let y = Math.floor(Math.random()*TEX_WIDTH);

				const clashes = this.voronoiPoints.filter(point => {
					return (
						x > point.x - MARGIN && 
						x < point.x + MARGIN && 
						y > point.y - MARGIN &&
						y < point.y + MARGIN
					)
				});

				if(clashes.length === 0){
					found = true;
					this.voronoiPoints.push({
						x,
						y
					})
					worleyNoise.addCrest(x, y, false);
				}
			}
		}

		this.voronoiPoints.filter(point => {
			return point.x < this.length * 0.3 || point.x > this.length * 0.6
		}).forEach(point => {
			worleyNoise.addCrest(
				point.x < this.length * 0.3 ? 
					point.x + this.length : 
					-point.x, 
				point.y, 
				false
			);
		})


		this.worleyNoise = worleyNoise;

		// Full texture access
		worleyNoise.Texture.ImageData().then((imgData) => {
		    // Do something like ctx.putImageData(imgData)
				const texCtx = this.noiseTex.getContext("2d");
		    console.log(imgData); // {width: Number ,height: Number ,data: Uint8Array => [0,1,2....n]
		    // texCtx.globalCompositeOperation = 'multiply'
		    // texCtx.putImageData(imgData, 0, 0)
		    // texCtx.globalCompositeOperation = 'source-over'
				// this.displayVoronoiPoints();
		    this.offset = this.length * 0.9
				this.update(0)
		})
		console.log(this.voronoiPoints)
	}

	displayVoronoiPoints() {
		const ctx = this.noiseTex.getContext("2d")
		this.worleyNoise.crests.forEach(point => {
			ctx.arc(point[0], point[1], 2.5, 0, 2 * Math.PI);
			ctx.fillStyle = '#fff'
			ctx.fill()
			ctx.closePath()
		});
	}

	update(dt) {
		this.offset += dt * this.speed;
		this.offset = this.offset % this.length;
		this.setNoiseData(Math.round(this.offset));
	}

	getTexture() {
		return this.canvas.getContext("2d").getImageData(0,0,TEX_WIDTH, TEX_HEIGHT)
	}
}

export default FlameTex;