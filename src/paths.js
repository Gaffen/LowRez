import * as THREE from 'three'

function getPaths() {
	const path = new THREE.Path();

	path.lineTo( 0, 0.8 );
	path.quadraticCurveTo( 0, 1, 0.2, 1 );
	path.lineTo( 1, 1 );

	const points = path.getPoints();

	const geometry = new THREE.BufferGeometry().setFromPoints( points );
	const material = new THREE.LineBasicMaterial( { color: 0xffffff } );

	const line = new THREE.Line( geometry, material );
	return line;
}

export default getPaths;