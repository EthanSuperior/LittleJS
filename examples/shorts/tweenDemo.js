// Variables to track tween groups and current demo section
let tweens; // Array of tween groups for different demo categories
let demoIdx = -1; // Current demo section index (-1 means no section active)

function gameInit() {
	// Initialize the tween system
	new TweenSystemPlugin();

	// Create a purple square that will be animated in some demos
	const square = new EngineObject();
	square.color = PURPLE;

	// Helper function to create a tween for a EngineObject
	function tweenObject(y, c) {
		const obj = new EngineObject();
		obj.color = c;
		// Returns a function that animates the object's position based on time 't'
		// X position goes from 0 to 10, Y position is fixed at y * 1.5
		return (t) => obj.pos.set(10 * t, y * 1.5);
	}

	// Basic Tweens - demonstrate simple linear animation
	// First tween uses default settings (60 frames, 0 to 1 range)
	// Second tween uses custom settings (30 frames, -1 to 1 range)
	const basicTweens = [
		new Tween(tweenObject(5, RED)),
		new Tween(tweenObject(4, RED), 30, -1, 1),
	];

	// Repeating Tweens - demonstrate different loop behaviors
	// .then() chains actions after a tween completes
	const repeatingTweens = [
		new Tween(tweenObject(3, ORANGE), 120, -1, 1).then(TweenRepeat.Loop), // Infinite loop
		new Tween(tweenObject(2, ORANGE), 120, -1, 1).then(TweenRepeat.PingPong), // Infinite ping-pong
		new Tween(tweenObject(1, ORANGE), 120, -1, 1).then(TweenRepeat.PingPong(5)), // Ping-pong 5 times
	];

	// Eased Tweens - demonstrate built-in easing curves
	// .curve() applies mathematical easing functions to make animations feel more natural
	const easedTweens = [
		new Tween(tweenObject(0, YELLOW), 120, -1, 1).curve(Curves.BACKOFF), // Overshoots then settles
		new Tween(tweenObject(-1, YELLOW), 120, -1, 1).curve(Curves.ELASTIC), // Bouncy elastic motion
		new Tween(tweenObject(-2, YELLOW), 120, -1, 1).curve(Curves.POWER(2)), // Quadratic acceleration
	];

	// Curved Tweens - demonstrate curve modification with Ease functions
	// Ease.OUT inverts the curve direction (bounce becomes reverse bounce)
	const curvedTweens = [
		new Tween(tweenObject(-3, GREEN), 120, -1, 1).curve(Curves.BOUNCE), // Normal bounce curve
		new Tween(tweenObject(-4, GREEN), 120, -1, 1).curve(
			Ease.OUT(Curves.BOUNCE) // Inverted bounce curve
		),
	];

	// Complex Tween - demonstrates advanced curve composition
	// Ease.PIECEWISE combines multiple curves in sequence for complex motion
	const complexTween = new Tween(tweenObject(-5, BLUE), 600, -1, 1)
		.curve(
			Ease.PIECEWISE(
				Curves.CIRC, // Circular motion
				Curves.SPRING, // Spring oscillation
				Curves.SINE, // Sine wave
				Curves.BEZIER(0, 1, 1, 0.5) // Custom Bezier curve
			)
		)
		.then((twn) => console.log(twn.toString())); // Log tween info when complete

	// Chained Tweens - demonstrate complex animation sequences
	// First tween: moves square left, then reverses direction
	const moveSquareLR = new Tween((t) => (square.pos.x = t), 120, -11, 0).then(
		(twn) => twn.reverse().reset().then(TweenRepeat.None) // Reverse and stop after one cycle
	);

	// Second tween: moves square up/down with custom curve, then triggers scaling
	const chainedTween = new Tween((t) => square.pos.set(-11, t), 400, -5.5, 5.5)
		.curve(Ease.OUT_IN((t) => (t < 0.5 ? t * 2 : 1 - (t - 0.5) * 1))) // Custom ease function
		.then((_twn) => {
			// When vertical movement completes, start scaling animation
			new Tween((t) => square.size.set(t, t), 120, 1, 3)
				.curve(Curves.ELASTIC) // Elastic scaling effect
				.then((_twn) => moveSquareLR.play()) // Then start horizontal movement
				.play();
		});
	tweens = [
		basicTweens, // Group 0: Basic linear tweens
		repeatingTweens, // Group 1: Looping tweens
		easedTweens, // Group 2: Eased tweens
		curvedTweens, // Group 3: Custom curved tweens
		[complexTween], // Group 4: Complex piecewise curve
		[chainedTween], // Group 5: Chained animation sequence
	];

	// Initialize all tweens to their starting positions
	// t.eval(t.life) evaluates the tween at its current life value
	tweens.forEach((ts) => ts.forEach((t) => t.eval(t.life)));
}

function gameUpdate() {
	// Handle mouse clicks to cycle through demo sections
	if (mouseWasPressed(0)) return;
	demoIdx++; // Move to next demo section

	if (demoIdx == tweens.length) {
		// All sections shown - stop all tweens
		tweens.forEach((ts) => ts.forEach((t) => t.stop()));
	} else if (demoIdx > tweens.length) {
		// Past the end - reset all tweens and start over
		tweens.forEach((ts) => ts.forEach((t) => t.reset().eval(t.life)));
		demoIdx = 0; // Restart from first section
	} else {
		// Play the current section's tweens
		tweens[demoIdx].forEach((t) => t.play());
	}
}

function gameRender() {
	// Show debug overlay for current tween section if debug mode is enabled
	if (debugOverlay) tweens[demoIdx]?.forEach((t) => t.renderDebug());
}
